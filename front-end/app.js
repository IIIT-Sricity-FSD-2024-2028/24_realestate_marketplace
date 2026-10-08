const TruEstate = {
    // Backend API base — served from the same NestJS app, so a relative path
    // works whether the page is opened at :3000 or proxied elsewhere.
    API_BASE: '/api/v1',

    // ── Session storage: PER TAB, not per browser ────────────────────────
    //
    // The signed-in account lives in sessionStorage, which Chrome scopes to a
    // single tab. localStorage is shared by every tab on the origin, so with
    // the session kept there, signing in as a seller in one tab silently
    // replaced the buyer session in the tab next to it — one of the two would
    // appear to "log itself out". Buyer and seller are separate accounts here
    // (the same email can own both), so being signed into each in its own tab
    // is a normal thing to want.
    //
    // localStorage is still written, but only as a seed: a brand-new tab with
    // no session of its own adopts the last account signed in, so opening the
    // dashboard in a new tab doesn't demand a fresh login. The moment that tab
    // signs in as somebody else, its sessionStorage takes over and the other
    // tabs are untouched.
    SESSION_KEY: 'truEstate_user',

    setUser: function (user) {
        const serialized = JSON.stringify(user);
        try { sessionStorage.setItem(this.SESSION_KEY, serialized); } catch (e) { /* private mode */ }
        try { localStorage.setItem(this.SESSION_KEY, serialized); } catch (e) { /* private mode */ }
    },
    getUser: function () {
        let raw = null;
        try { raw = sessionStorage.getItem(this.SESSION_KEY); } catch (e) { /* private mode */ }
        if (!raw) {
            // First load in this tab — inherit the last login, then claim it
            // for this tab so a later sign-in elsewhere can't move it.
            try { raw = localStorage.getItem(this.SESSION_KEY); } catch (e) { /* private mode */ }
            if (raw) {
                try { sessionStorage.setItem(this.SESSION_KEY, raw); } catch (e) { /* private mode */ }
            }
        }
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    },
    clearUser: function () {
        try { sessionStorage.removeItem(this.SESSION_KEY); } catch (e) { /* private mode */ }
        try { localStorage.removeItem(this.SESSION_KEY); } catch (e) { /* private mode */ }
    },
    getToken: function () {
        const user = this.getUser();
        return user && user.token ? user.token : null;
    },

    /**
     * Fetch wrapper for the real backend. Attaches the JWT (if logged in),
     * unwraps the `{ success, statusCode, message, data }` envelope, and
     * throws an Error (with `.status` and `.errors`) on failure.
     *
     * Pass a `FormData` body (e.g. for file uploads) and the JSON
     * `Content-Type` is skipped so the browser can set its own multipart
     * boundary — setting it manually would break the upload.
     */
    api: async function (path, options) {
        options = options || {};
        const token = this.getToken();
        const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
        const headers = Object.assign(
            isFormData ? {} : { 'Content-Type': 'application/json' },
            options.headers || {},
        );
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch(this.API_BASE + path, Object.assign({}, options, { headers }));
        let body = null;
        try { body = await res.json(); } catch (_) { /* no body */ }

        if (!res.ok) {
            const message = (body && body.message) || ('Request failed with status ' + res.status);
            // A superuser can block any account (including an admin) mid-session.
            // The API rejects every request from a blocked account on the spot,
            // but an already-open dashboard would just fill with red errors and
            // keep looking signed in. Sign it out for real instead.
            if ((res.status === 401 || res.status === 403) && /blocked|no longer exists/i.test(message)) {
                this.forceSignOut(message);
            }
            const error = new Error(message);
            error.status = res.status;
            error.errors = body && body.errors;
            throw error;
        }
        return body;
    },

    /**
     * Drops the stored session and sends the user back to the right login
     * page, explaining why. Used when the API says this account can no longer
     * act — blocked by a superuser, or deleted outright.
     */
    forceSignOut: function (reason) {
        if (this._signingOut) return;
        this._signingOut = true;
        const user = this.getUser();
        const role = user && user.role;
        this.clearUser();
        let redirectUrl = 'index.html';
        if (role === 'admin') redirectUrl = 'admin-login.html';
        if (role === 'superuser') redirectUrl = 'superuser-login.html';
        alert(reason || 'Your session has ended. Please sign in again.');
        window.location.href = redirectUrl;
    },

    requireAuth: function (role) {
        const user = this.getUser();

        // Buyer and seller are dashboard roles, while the API deliberately
        // represents both account types as the single `user` role. The
        // landing page has historically stored the dashboard role directly
        // (`role: 'buyer'` / `role: 'seller'`), whereas older sessions may
        // contain the API role plus `userType`. Support both representations
        // so a valid buyer/seller session is not immediately redirected away
        // from its dashboard after login.
        const hasRequiredAccess = !role || (
            user && (
                user.role === role ||
                (role === 'buyer' && user.role === 'user' && user.userType === 'buyer') ||
                (role === 'seller' && user.role === 'user' && user.userType === 'seller')
            )
        );

        if (!hasRequiredAccess) {
            let redirectUrl = 'index.html';
            if (role === 'admin') redirectUrl = 'admin-login.html';
            if (role === 'superuser') redirectUrl = 'superuser-login.html';
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    /**
     * Keeps a dashboard in sync without the user pressing reload.
     *
     * Every dashboard used to fetch once on page load and never again, so a
     * seller accepting an offer, an admin confirming a visit, or an admin
     * advancing a deal step stayed invisible in the other party's already-open
     * tab until a manual refresh. This polls the page's own loaders on an
     * interval and — more importantly — the instant the tab regains focus,
     * which is when the user is actually looking at it.
     *
     *   TruEstate.startLiveRefresh({ role: 'buyer', refresh: loadEverything })
     *
     * Polling is skipped entirely while the tab is hidden (a background tab
     * hammering the API for hours helps nobody) and resumes on return.
     *
     * Sessions are per-tab, so a buyer dashboard and a seller dashboard can be
     * open side by side and each keeps polling as its own account.
     */
    startLiveRefresh: function (options) {
        const refresh = options.refresh;
        const intervalMs = options.intervalMs || 20000;
        const role = options.role;
        const self = this;
        const sessionId = (this.getUser() || {}).id || null;
        let running = false;
        let lastRun = Date.now();

        // Now that the session is per-tab (see SESSION_KEY), another tab
        // signing in as a different account is normal and cannot disturb this
        // one. This only catches the session going away or changing *within
        // this tab* — signing out in a background frame, or storage being
        // cleared — so the page stops polling as a stale identity.
        function sessionStillValid() {
            const user = self.getUser();
            if (!user) return false;
            if (sessionId && user.id && user.id !== sessionId) return false;
            if (role && user.role !== role) return false;
            return true;
        }

        async function run(force) {
            if (running) return;
            if (!force && document.visibilityState !== 'visible') return;
            if (!sessionStillValid()) { self.onSessionChanged(role); return; }
            running = true;
            try {
                await refresh();
                lastRun = Date.now();
            } catch (err) {
                // A transient failure must not kill the loop — the next tick retries.
                console.warn('Live refresh failed:', err && err.message);
            } finally {
                running = false;
            }
        }

        const timer = setInterval(run, intervalMs);

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible') run(true);
        });
        // Coming back to the tab is the moment stale data is most obvious, but
        // focus fires often (clicking back into the page), so rate-limit it.
        window.addEventListener('focus', function () {
            if (Date.now() - lastRun > 5000) run(true);
        });
        // Deliberately no 'storage' listener: that event fires for changes made
        // by *other* tabs, and signing into a second account in another tab is
        // now a supported thing to do — reacting to it is what used to log one
        // of two open dashboards out.

        return { refreshNow: function () { return run(true); }, stop: function () { clearInterval(timer); } };
    },

    /**
     * This tab's own session went away or changed identity. Freeze the page
     * and say so, instead of letting it keep issuing requests as somebody else
     * and surfacing confusing role errors. Another tab signing in as a
     * different account does NOT trigger this — sessions are per-tab.
     */
    onSessionChanged: function (role) {
        if (document.getElementById('tru-session-changed')) return;
        const user = this.getUser();
        const who = user && user.name ? (user.name + ' (' + user.role + ')') : null;
        const bar = document.createElement('div');
        bar.id = 'tru-session-changed';
        bar.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9998;display:flex;align-items:center;justify-content:center;padding:1rem;';
        bar.innerHTML =
            '<div style="max-width:26rem;background:#1a1a1a;border:1px solid rgba(255,255,255,0.12);border-radius:0.75rem;padding:2rem;text-align:center;color:#fff;">' +
            '<h2 style="font-size:1.125rem;font-weight:700;margin:0 0 0.75rem;">This session changed</h2>' +
            '<p style="color:#9ca3af;font-size:0.875rem;margin:0 0 1.5rem;line-height:1.6;">' +
            (who
                ? 'This tab is now signed in as <strong style="color:#fff;">' + who + '</strong>, but it is still showing the ' + (role || 'previous') + ' dashboard, so anything you do here would run as the wrong account.'
                : 'You are no longer signed in on this tab.') +
            '</p>' +
            '<button id="tru-session-reload" style="width:100%;background:#1DB954;color:#000;border:none;border-radius:0.5rem;padding:0.75rem;font-weight:700;cursor:pointer;">Reload this page</button>' +
            '</div>';
        document.body.appendChild(bar);
        document.getElementById('tru-session-reload').addEventListener('click', function () { window.location.reload(); });
    },

    logout: function (role) {
        this.clearUser();
        let redirectUrl = 'index.html';
        if (role === 'admin') redirectUrl = 'admin-login.html';
        if (role === 'superuser') redirectUrl = 'superuser-login.html';
        window.location.href = redirectUrl;
    },

    /**
     * Self-contained "Forgot password?" modal — builds its own DOM, so any
     * login page can open it with zero markup of its own:
     *   TruEstate.openForgotPasswordModal('buyer' | 'seller' | undefined)
     * Pass the account's userType (buyer/seller) to disambiguate when an
     * email owns more than one account; omit it for admin/superuser logins.
     *
     * Only collects the account email. The API generates a new password and
     * emails it directly to the account — it is never returned here, and the
     * old password stops working the moment the request goes through.
     */
    /** ₹ with Indian digit grouping — 1,44,550 rather than 144,550. */
    formatINR: function (amount) {
        const n = Number(amount) || 0;
        return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    },

    /**
     * The one checkout flow every paid feature on the platform goes through.
     *
     *   await TruEstate.pay({ purpose: 'subscription', tier: 'gold', cycle: 'monthly' })
     *   await TruEstate.pay({ purpose: 'featured_listing', propertyId: id, pack: 'premium' })
     *   await TruEstate.pay({ purpose: 'commission', commissionId: id })
     *
     * Resolves with the paid payment (and the server's "here's what you just
     * unlocked" message), or `null` if the customer backed out. Rejects only
     * on a real failure.
     *
     * Note what is NOT sent: an amount. The request says what is being bought
     * and the server prices it from the rate card, so the price shown in the
     * modal below is the server's own figure echoed back — the page has no
     * ability to change what anything costs.
     *
     * Which gateway drives the middle step is decided by the server: with
     * Razorpay keys configured it opens their real widget, otherwise the
     * built-in demo checkout stands in. Both end at the same /billing/verify.
     */
    pay: async function (request) {
        const order = (await this.api('/billing/checkout', {
            method: 'POST',
            body: JSON.stringify(request),
        })).data;

        const signature = order.gateway === 'razorpay'
            ? await this._razorpayCheckout(order)
            : await this._demoCheckout(order);

        if (!signature) {
            // Backed out. Close the order so it doesn't sit open forever.
            try {
                await this.api('/billing/cancelled', {
                    method: 'POST',
                    body: JSON.stringify({ orderId: order.orderId, reason: 'Cancelled by user' }),
                });
            } catch (e) { /* the order stays CREATED; harmless */ }
            return null;
        }

        const verified = await this.api('/billing/verify', {
            method: 'POST',
            body: JSON.stringify(signature),
        });
        return { payment: verified.data, message: verified.message };
    },

    /** Loads Razorpay's widget on demand and resolves with its signature triplet. */
    _razorpayCheckout: function (order) {
        const self = this;
        return new Promise(function (resolve, reject) {
            function open() {
                const user = self.getUser() || {};
                const rzp = new window.Razorpay({
                    key: order.keyId,
                    amount: order.amount * 100, // Razorpay counts in paise
                    currency: order.currency,
                    name: 'truEstate',
                    description: order.description,
                    order_id: order.orderId,
                    prefill: { name: user.name || '', email: user.email || '' },
                    theme: { color: '#1DB954' },
                    handler: function (response) {
                        resolve({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        });
                    },
                    modal: { ondismiss: function () { resolve(null); } },
                });
                rzp.on('payment.failed', function () { resolve(null); });
                rzp.open();
            }

            if (window.Razorpay) { open(); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = open;
            script.onerror = function () { reject(new Error('Could not reach the payment gateway.')); };
            document.head.appendChild(script);
        });
    },

    /**
     * The offline gateway's checkout screen.
     *
     * It looks like a payment page because that is what it stands in for, but
     * it never pretends to be real: the TEST MODE banner is not dismissible
     * and no card details are collected. Pressing Pay asks the server's mock
     * driver for a genuine HMAC signature over this order, which then goes
     * through exactly the same verification path a live payment would.
     */
    _demoCheckout: function (order) {
        const self = this;
        return new Promise(function (resolve) {
            const existing = document.getElementById('tru-checkout');
            if (existing) existing.remove();

            const money = self.formatINR.bind(self);
            const overlay = document.createElement('div');
            overlay.id = 'tru-checkout';
            overlay.style.cssText =
                'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9000;display:flex;' +
                'align-items:center;justify-content:center;padding:1rem;font-family:inherit;';
            overlay.innerHTML =
                '<div style="width:100%;max-width:24rem;background:#161616;border:1px solid rgba(255,255,255,0.12);border-radius:0.875rem;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.6);">' +
                  '<div style="background:#f59e0b;color:#111;font-size:0.7rem;font-weight:800;letter-spacing:0.06em;text-align:center;padding:0.4rem;">' +
                    'TEST MODE · NO REAL MONEY MOVES' +
                  '</div>' +
                  '<div style="padding:1.5rem;">' +
                    '<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;">' +
                      '<div style="width:2rem;height:2rem;border-radius:0.5rem;background:#1DB954;display:flex;align-items:center;justify-content:center;font-weight:800;color:#000;">t</div>' +
                      '<div>' +
                        '<div style="color:#fff;font-weight:700;font-size:0.95rem;line-height:1.2;">truEstate</div>' +
                        '<div style="color:#6b7280;font-size:0.7rem;">Secure checkout</div>' +
                      '</div>' +
                    '</div>' +
                    '<div style="color:#9ca3af;font-size:0.8rem;margin-bottom:0.35rem;">You are paying for</div>' +
                    '<div style="color:#fff;font-size:0.95rem;font-weight:600;margin-bottom:1.25rem;line-height:1.4;">' +
                      String(order.description).replace(/</g, '&lt;') +
                    '</div>' +
                    '<div style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:0.6rem;padding:0.9rem 1rem;margin-bottom:1.25rem;">' +
                      '<div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#9ca3af;margin-bottom:0.45rem;">' +
                        '<span>Amount</span><span style="color:#d1d5db;">' + money(order.baseAmount) + '</span></div>' +
                      '<div style="display:flex;justify-content:space-between;font-size:0.8rem;color:#9ca3af;margin-bottom:0.65rem;">' +
                        '<span>GST (18%)</span><span style="color:#d1d5db;">' + money(order.taxAmount) + '</span></div>' +
                      '<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:0.65rem;display:flex;justify-content:space-between;align-items:baseline;">' +
                        '<span style="color:#fff;font-size:0.85rem;font-weight:600;">Total payable</span>' +
                        '<span style="color:#1DB954;font-size:1.25rem;font-weight:800;">' + money(order.amount) + '</span></div>' +
                    '</div>' +
                    '<div style="color:#6b7280;font-size:0.68rem;line-height:1.6;margin-bottom:1.1rem;">' +
                      'Receipt <span style="color:#9ca3af;">' + order.receipt + '</span><br>' +
                      'Order <span style="color:#9ca3af;">' + order.orderId + '</span><br>' +
                      'This is the built-in offline gateway. It signs the order exactly as Razorpay ' +
                      'would, and the server verifies that signature before anything is unlocked — ' +
                      'add RAZORPAY_KEY_ID to .env and the real widget opens here instead.' +
                    '</div>' +
                    '<button id="tru-checkout-pay" style="width:100%;background:#1DB954;color:#000;border:none;border-radius:0.5rem;padding:0.8rem;font-weight:800;font-size:0.9rem;cursor:pointer;">' +
                      'Pay ' + money(order.amount) +
                    '</button>' +
                    '<button id="tru-checkout-cancel" type="button" style="width:100%;background:none;border:none;color:#6b7280;padding:0.7rem;margin-top:0.25rem;cursor:pointer;font-size:0.8rem;">Cancel payment</button>' +
                  '</div>' +
                '</div>';
            document.body.appendChild(overlay);

            let settled = false;
            function finish(value) {
                if (settled) return;
                settled = true;
                overlay.remove();
                resolve(value);
            }

            overlay.addEventListener('click', function (e) { if (e.target === overlay) finish(null); });
            document.getElementById('tru-checkout-cancel').addEventListener('click', function () { finish(null); });

            document.getElementById('tru-checkout-pay').addEventListener('click', async function () {
                const btn = this;
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.textContent = 'Processing…';
                try {
                    const res = await self.api('/billing/demo-checkout/' + encodeURIComponent(order.orderId), {
                        method: 'POST',
                        body: JSON.stringify({}),
                    });
                    finish(res.data);
                } catch (err) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.textContent = 'Pay ' + money(order.amount);
                    showToast(err.message || 'Payment failed', 'error');
                }
            });
        });
    },

    openForgotPasswordModal: function (userType) {
        const existing = document.getElementById('tru-forgot-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tru-forgot-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;';
        overlay.innerHTML =
            '<div style="width:100%;max-width:26rem;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:2rem;">' +
            '<h2 style="font-size:1.25rem;font-weight:700;margin:0 0 0.5rem;color:#fff;">Reset your password</h2>' +
            '<p id="tru-forgot-step-desc" style="color:#9ca3af;font-size:0.875rem;margin:0 0 1.5rem;">Enter your account email and we\'ll email you a new password. Your current password will stop working.</p>' +
            '<div id="tru-forgot-step-1">' +
            '<label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.5rem;">Email</label>' +
            '<input id="tru-forgot-email" type="email" placeholder="you@example.com" style="width:100%;box-sizing:border-box;background:#111;border:1px solid #444;border-radius:0.5rem;padding:0.75rem 1rem;color:#fff;margin-bottom:1rem;">' +
            '<button id="tru-forgot-request-btn" style="width:100%;background:#1DB954;color:#000;border:none;border-radius:0.5rem;padding:0.75rem;font-weight:700;cursor:pointer;">Email me a new password</button>' +
            '</div>' +
            '<div id="tru-forgot-step-2" style="display:none;">' +
            '<p style="color:#d1d5db;font-size:0.875rem;margin:0;">If an account exists for that email, we\'ve emailed a new password to it. Check your inbox (and spam folder), log in with that password, then change it from Settings.</p>' +
            '</div>' +
            '<button id="tru-forgot-close-btn" type="button" style="width:100%;background:none;border:none;color:#9ca3af;padding:0.75rem;margin-top:0.5rem;cursor:pointer;">Cancel</button>' +
            '</div>';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
        document.getElementById('tru-forgot-close-btn').addEventListener('click', function () { overlay.remove(); });

        document.getElementById('tru-forgot-request-btn').addEventListener('click', async function () {
            const email = document.getElementById('tru-forgot-email').value.trim();
            if (!email) { showToast('Please enter your email', 'error'); return; }
            const btn = document.getElementById('tru-forgot-request-btn');
            btn.disabled = true; btn.textContent = 'Sending…';
            try {
                const body = { email };
                if (userType) body.userType = userType;
                await TruEstate.api('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });
                document.getElementById('tru-forgot-step-1').style.display = 'none';
                document.getElementById('tru-forgot-step-2').style.display = 'block';
                document.getElementById('tru-forgot-step-desc').textContent = 'Check your email';
                document.getElementById('tru-forgot-close-btn').textContent = 'Close';
                showToast('If that account exists, a new password has been emailed to it');
            } catch (err) {
                showToast(err.message || 'Failed to request password reset', 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Email me a new password';
            }
        });
    }
};

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';

    if (type === 'error') {
        toast.style.background = '#ef4444'; 
    } else {
        toast.style.background = '#1DB954'; 
    }

    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}
