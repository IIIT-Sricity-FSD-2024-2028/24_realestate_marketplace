const TruEstate = {
    // Backend API base — served from the same NestJS app, so a relative path
    // works whether the page is opened at :3000 or proxied elsewhere.
    API_BASE: '/api/v1',

    setUser: function (user) {
        localStorage.setItem('truEstate_user', JSON.stringify(user));
    },
    getUser: function () {
        const user = localStorage.getItem('truEstate_user');
        return user ? JSON.parse(user) : null;
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
            const error = new Error(message);
            error.status = res.status;
            error.errors = body && body.errors;
            throw error;
        }
        return body;
    },

    requireAuth: function (role) {
        const user = this.getUser();
        if (!user || (role && user.role !== role)) {
            let redirectUrl = 'index.html';
            if (role === 'admin') redirectUrl = 'admin-login.html';
            if (role === 'superuser') redirectUrl = 'superuser-login.html';
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },
    logout: function (role) {
        localStorage.removeItem('truEstate_user');
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
     */
    openForgotPasswordModal: function (userType) {
        const existing = document.getElementById('tru-forgot-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tru-forgot-modal';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;padding:1rem;';
        overlay.innerHTML =
            '<div style="width:100%;max-width:26rem;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:2rem;">' +
            '<h2 style="font-size:1.25rem;font-weight:700;margin:0 0 0.5rem;color:#fff;">Reset your password</h2>' +
            '<p id="tru-forgot-step-desc" style="color:#9ca3af;font-size:0.875rem;margin:0 0 1.5rem;">Enter your account email and we\'ll generate a reset token.</p>' +
            '<div id="tru-forgot-step-1">' +
            '<label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.5rem;">Email</label>' +
            '<input id="tru-forgot-email" type="email" placeholder="you@example.com" style="width:100%;box-sizing:border-box;background:#111;border:1px solid #444;border-radius:0.5rem;padding:0.75rem 1rem;color:#fff;margin-bottom:1rem;">' +
            '<button id="tru-forgot-request-btn" style="width:100%;background:#1DB954;color:#000;border:none;border-radius:0.5rem;padding:0.75rem;font-weight:700;cursor:pointer;">Send reset link</button>' +
            '</div>' +
            '<div id="tru-forgot-step-2" style="display:none;">' +
            '<div id="tru-forgot-dev-note" style="background:#111;border:1px solid rgba(29,185,84,0.3);border-radius:0.5rem;padding:0.75rem;font-size:0.75rem;color:#9ca3af;margin-bottom:1rem;word-break:break-all;"></div>' +
            '<label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.5rem;">Reset token</label>' +
            '<input id="tru-forgot-token" type="text" placeholder="Paste the reset token" style="width:100%;box-sizing:border-box;background:#111;border:1px solid #444;border-radius:0.5rem;padding:0.75rem 1rem;color:#fff;margin-bottom:1rem;">' +
            '<label style="display:block;font-size:0.875rem;color:#9ca3af;margin-bottom:0.5rem;">New password</label>' +
            '<input id="tru-forgot-newpass" type="password" placeholder="8+ chars, upper/lower/digit/special" style="width:100%;box-sizing:border-box;background:#111;border:1px solid #444;border-radius:0.5rem;padding:0.75rem 1rem;color:#fff;margin-bottom:1rem;">' +
            '<button id="tru-forgot-reset-btn" style="width:100%;background:#1DB954;color:#000;border:none;border-radius:0.5rem;padding:0.75rem;font-weight:700;cursor:pointer;">Reset password</button>' +
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
                const result = await TruEstate.api('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });
                document.getElementById('tru-forgot-step-1').style.display = 'none';
                document.getElementById('tru-forgot-step-2').style.display = 'block';
                document.getElementById('tru-forgot-step-desc').textContent = 'Enter the reset token and choose a new password.';
                const devNote = document.getElementById('tru-forgot-dev-note');
                if (result.data && result.data.resetToken) {
                    devNote.innerHTML = '<strong style="color:#1DB954;">Dev mode:</strong> no email service is configured, so here’s your reset token directly (a real deployment would only email it):<br><code style="color:#fff;word-break:break-all;">' + result.data.resetToken + '</code>';
                    document.getElementById('tru-forgot-token').value = result.data.resetToken;
                } else {
                    devNote.textContent = 'If an account exists for that email, a reset token has been generated for it.';
                }
                showToast('Reset instructions generated');
            } catch (err) {
                showToast(err.message || 'Failed to request password reset', 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Send reset link';
            }
        });

        document.getElementById('tru-forgot-reset-btn').addEventListener('click', async function () {
            const token = document.getElementById('tru-forgot-token').value.trim();
            const newPassword = document.getElementById('tru-forgot-newpass').value;
            if (!token || !newPassword) { showToast('Please fill in both fields', 'error'); return; }
            const btn = document.getElementById('tru-forgot-reset-btn');
            btn.disabled = true; btn.textContent = 'Resetting…';
            try {
                await TruEstate.api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token: token, newPassword: newPassword }) });
                showToast('Password reset! You can now log in with your new password.');
                overlay.remove();
            } catch (err) {
                const detail = (err.errors && err.errors.length) ? ': ' + err.errors[0] : '';
                showToast((err.message || 'Failed to reset password') + detail, 'error');
            } finally {
                btn.disabled = false; btn.textContent = 'Reset password';
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
