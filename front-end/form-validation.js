/**
 * truEstate – Central Form Validation Library
 * Covers every form / interactive input across ALL pages:
 *   index.html (Login / Sign-Up)
 *   seller-dashboard.html  (Add Property, Counter Offer, Reschedule, Profile)
 *   agent-dashboard.html   (Edit Profile, Reschedule)
 *   admin-dashboard.html   (Profile + Password Change)
 *   superuser-dashboard.html (User CRUD, Property CRUD, Settings)
 *   Buyer Dashboard        (Offer form, Profile)
 */

/* ─── UTILITY HELPERS ─────────────────────────────────────── */

function tvIsEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function tvIsPhone(v) {
    const stripped = v.trim();
    // Must match basic phone pattern
    if (!/^[\+]?[\d\s\-\(\)]{7,15}$/.test(stripped)) return false;
    // Reject numbers that are entirely zeros (e.g. 0000000000)
    const digitsOnly = stripped.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 0 && /^0+$/.test(digitsOnly)) return false;
    return true;
}
function tvIsPositiveNumber(v) {
    return /^[\d,\.]+$/.test(v.trim()) && parseFloat(v.replace(/,/g, '')) > 0;
}

/** Show an inline error message below an input */
function tvShowError(input, msg) {
    // Remove old error
    const prev = input.parentElement.querySelector('.tv-err');
    if (prev) prev.remove();

    input.style.borderColor = '#ef4444';
    input.style.boxShadow  = '0 0 0 2px rgba(239,68,68,0.25)';
    input.style.transition = 'all 0.2s';

    const err = document.createElement('div');
    err.className = 'tv-err';
    err.style.cssText = 'color:#ef4444;font-size:0.72rem;margin-top:0.3rem;display:flex;align-items:center;gap:0.25rem;';
    err.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"
        viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}`;
    input.parentElement.appendChild(err);
}

/** Clear error state on an input */
function tvClearError(input) {
    const prev = input.parentElement ? input.parentElement.querySelector('.tv-err') : null;
    if (prev) prev.remove();
    input.style.borderColor = '';
    input.style.boxShadow  = '';
}

/** Attach real-time clearing when user starts typing */
function tvAttachLiveClearing(input) {
    if (input.dataset.tvBound) return;
    input.dataset.tvBound = '1';
    input.addEventListener('input', () => tvClearError(input));
    input.addEventListener('change', () => tvClearError(input));
}

/** Shake animation for a button on failure */
function tvShake(el) {
    el.style.animation = 'tvShake 0.35s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
}

/* Inject the shake keyframes once */
(function() {
    if (document.getElementById('tv-shake-style')) return;
    const s = document.createElement('style');
    s.id = 'tv-shake-style';
    s.textContent = `
    @keyframes tvShake {
        0%,100%{transform:translateX(0)}
        20%    {transform:translateX(-6px)}
        40%    {transform:translateX(6px)}
        60%    {transform:translateX(-4px)}
        80%    {transform:translateX(4px)}
    }
    .tv-err { animation: fadeIn .2s ease; }
    `;
    document.head.appendChild(s);
})();


/* ─── REAL-TIME INPUT RESTRICTIONS ────────────────────────── */

/**
 * Show a small floating hint pill next to an input explaining what IS allowed.
 * Auto-dismisses after 2 s, throttled so it doesn't spam.
 */
function tvHint(el, msg, color) {
    // Throttle: don't show again if one is already visible for this element
    if (el._tvHintActive) return;
    el._tvHintActive = true;

    // Remove any previous hint for this element
    const old = document.getElementById('tv-hint-' + el.id);
    if (old) old.remove();

    const hint = document.createElement('div');
    hint.id = el.id ? 'tv-hint-' + el.id : 'tv-hint-generic';
    hint.textContent = msg;

    // Position it absolutely via JS so it works inside any modal/container
    const rect = el.getBoundingClientRect();
    hint.style.cssText = [
        'position:fixed',
        `top:${rect.bottom + window.scrollY + 6}px`,
        `left:${rect.left + window.scrollX}px`,
        'background:' + (color || '#1c1c1c'),
        'color:#fff',
        'font-size:0.75rem',
        'font-weight:600',
        'padding:0.35rem 0.75rem',
        'border-radius:0.5rem',
        'border-left:3px solid ' + (color === '#f97316' ? '#f97316' : color === '#3b82f6' ? '#3b82f6' : '#ef4444'),
        'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
        'z-index:999999',
        'opacity:0',
        'transform:translateY(-4px)',
        'transition:all 0.2s ease',
        'pointer-events:none',
        'white-space:nowrap',
    ].join(';');

    document.body.appendChild(hint);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateY(0)';
        });
    });

    // Auto-dismiss after 2 s
    setTimeout(() => {
        hint.style.opacity = '0';
        hint.style.transform = 'translateY(-4px)';
        setTimeout(() => { hint.remove(); el._tvHintActive = false; }, 200);
    }, 2000);
}

/**
 * Attach live character-filtering + contextual hints to an input element.
 *  mode: 'alpha'  → only letters + spaces (names)
 *        'number' → only digits, commas, dots (prices / areas)
 *        'email'  → force lowercase as user types
 */
function tvRestrictInput(el, mode) {
    if (!el || el.dataset.tvRestrict) return; // already wired
    el.dataset.tvRestrict = mode;

    // Hint messages per mode
    const hints = {
        alpha:  '⚠️  Only letters are allowed here',
        number: '⚠️  Only numbers are allowed here',
        email:  '✉️  Auto-converted to lowercase',
    };

    el.addEventListener('input', function () {
        const pos = this.selectionStart;
        const val = this.value;
        let cleaned = val;

        if (mode === 'alpha') {
            cleaned = val.replace(/[^a-zA-Z \-']/g, '');
        } else if (mode === 'number') {
            cleaned = val.replace(/[^0-9.,]/g, '');
        } else if (mode === 'email') {
            cleaned = val.toLowerCase();
        }

        if (cleaned !== val) {
            // Show hint BEFORE mutating so rect is correct
            tvHint(this, hints[mode]);

            this.value = cleaned;
            const removed = val.length - cleaned.length;
            const newPos = Math.max(0, pos - (mode === 'email' ? 0 : removed));
            this.setSelectionRange(newPos, newPos);
        }
    });

    // Handle paste — show hint if content was cleaned
    el.addEventListener('paste', function (e) {
        e.preventDefault();
        let pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
        let cleanedPaste = pasted;

        if (mode === 'alpha')  cleanedPaste = pasted.replace(/[^a-zA-Z \-']/g, '');
        if (mode === 'number') cleanedPaste = pasted.replace(/[^0-9.,]/g, '');
        if (mode === 'email')  cleanedPaste = pasted.toLowerCase();

        if (cleanedPaste !== pasted) {
            tvHint(this, hints[mode]);
        }

        const start = this.selectionStart;
        const end   = this.selectionEnd;
        this.value  = this.value.slice(0, start) + cleanedPaste + this.value.slice(end);
        const newPos = start + cleanedPaste.length;
        this.setSelectionRange(newPos, newPos);
    });
}

/**
 * Scan every input/textarea on the page and apply the right restriction
 * based on: data-tv-type attribute, id pattern, name pattern, placeholder, or type.
 */
function tvApplyRestrictionsToPage() {
    document.querySelectorAll('input, textarea').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio' ||
            el.type === 'file'     || el.type === 'hidden' ||
            el.type === 'date'     || el.type === 'time'   ||
            el.type === 'submit'   || el.type === 'button') return;

        // 1. Explicit override via data attribute wins
        if (el.dataset.tvType) {
            tvRestrictInput(el, el.dataset.tvType);
            return;
        }

        const id          = (el.id          || '').toLowerCase();
        const name        = (el.name        || '').toLowerCase();
        const placeholder = (el.placeholder || '').toLowerCase();
        const elType      = (el.type        || '').toLowerCase();

        /* ── EMAIL ── */
        if (elType === 'email' ||
            id.includes('email') || name.includes('email') ||
            placeholder.includes('email')) {
            tvRestrictInput(el, 'email');
            return;
        }

        /* ── NAME (alpha only) ── */
        const alphaKeywords = [
            'name', 'fname', 'lname', 'firstname', 'lastname',
            'full-name', 'fullname', 'city', 'location', 'area',
            'platform', 'title', 'prop-name', 'prop-title',
            'user-name', 'pf-name', 'ep-name', 'profile-fname', 'profile-lname',
            'prof-fname', 'prof-lname', 'tv-signup-name', 'new-prop-name',
            'new-prop-location', 'new-prop-type', 'counter-prop-name',
        ];
        if (alphaKeywords.some(k => id.includes(k) || name.includes(k))) {
            tvRestrictInput(el, 'alpha');
            return;
        }
        // Placeholder hints
        if (/enter.*name|your name|full name|first name|last name|city|location/i.test(placeholder)) {
            tvRestrictInput(el, 'alpha');
            return;
        }

        /* ── NUMBER ── */
        const numberKeywords = [
            'price', 'amount', 'sqft', 'beds', 'baths', 'balcony',
            'phone', 'mobile', 'upload-size', 'tv-upload',
            'offer-amount', 'counter-offer-input',
            'new-prop-price', 'new-prop-sqft', 'new-prop-beds',
            'new-prop-baths', 'new-prop-balcony', 'prop-price',
        ];

        const isPhoneField = elType === 'tel' ||
            id.includes('phone') || id.includes('mobile') ||
            name.includes('phone') || name.includes('mobile') ||
            placeholder.includes('phone') || placeholder.includes('mobile');

        if (isPhoneField) {
            tvRestrictInput(el, 'number');
            // Extra blur check: reject all-zeros on phone fields
            if (!el.dataset.tvPhoneBound) {
                el.dataset.tvPhoneBound = '1';
                el.addEventListener('blur', function () {
                    const digits = this.value.replace(/[^0-9]/g, '');
                    if (digits.length > 0 && /^0+$/.test(digits)) {
                        tvShowError(this, 'Phone number cannot be all zeros');
                        tvHint(this, '⚠️  Phone number cannot be all zeros');
                        tvShake(this);
                        this.value = '';
                    }
                });
                // Also check live as user types more than 5 zeros in a row
                el.addEventListener('input', function () {
                    const digits = this.value.replace(/[^0-9]/g, '');
                    if (digits.length >= 7 && /^0+$/.test(digits)) {
                        tvHint(this, '⚠️  Phone number cannot be all zeros');
                        tvShake(this);
                        this.value = '';
                    }
                });
            }
            return;
        }

        if (elType === 'number' ||
            numberKeywords.some(k => id.includes(k) || name.includes(k))) {
            tvRestrictInput(el, 'number');
            return;
        }
        if (/enter.*price|amount|number|sqft|bedroom|bathroom/i.test(placeholder)) {
            tvRestrictInput(el, 'number');
            return;
        }
    });
}

/* ─── DOB / DATE FIELD YEAR RESTRICTION ───────────────────── */
/**
 * For every input[type="date"] on the page:
 *  - Sets min="1900-01-01" and max=today so the browser date picker
 *    won't accept years outside a sensible range.
 *  - On 'change', checks the entered year. If it has more than 4 digits
 *    or is clearly invalid (< 1900 or > current year), clears and hints.
 */
function tvApplyDobRestrictions() {
    const today     = new Date();
    const maxYear   = today.getFullYear();
    const minDate   = '1900-01-01';
    const maxDate   = today.toISOString().split('T')[0]; // e.g. "2026-04-02"

    document.querySelectorAll('input[type="date"]').forEach(el => {
        if (el.dataset.tvDobBound) return;
        el.dataset.tvDobBound = '1';

        // Constrain the native date picker
        if (!el.min) el.min = minDate;
        if (!el.max) el.max = maxDate;

        // Guard on every change (including manual keyboard entry in year box)
        el.addEventListener('change', function () {
            if (!this.value) return;
            const parts = this.value.split('-');   // ["YYYY","MM","DD"]
            const yearStr = parts[0] || '';

            // Reject if year has more than 4 digits
            if (yearStr.length > 4) {
                tvHint(this, '⚠️  Year must be 4 digits (e.g. 1995)');
                tvShake(this);
                this.value = '';
                return;
            }

            const year = parseInt(yearStr, 10);

            // Reject years before 1900 or in the future
            if (year < 1900) {
                tvHint(this, '⚠️  Year cannot be before 1900');
                tvShake(this);
                this.value = '';
                return;
            }
            if (year > maxYear) {
                tvHint(this, `⚠️  Year cannot be after ${maxYear}`);
                tvShake(this);
                this.value = '';
                return;
            }
        });

        // Also guard during input (keydown in the year spinner)
        el.addEventListener('input', function () {
            if (!this.value) return;
            const yearStr = (this.value.split('-')[0] || '');
            if (yearStr.length > 4) {
                // Trim the year to 4 digits
                const trimmed = yearStr.slice(0, 4);
                const rest = this.value.slice(yearStr.length); // -MM-DD part
                this.value = trimmed + rest;
                tvHint(this, '⚠️  Year must be 4 digits only');
            }
        });
    });
}

/* ─── REAL-TIME PASSWORD MATCH CHECKER ────────────────────── */
/**
 * Wire a password pair so the confirm field shows a live
 * ✓ / ✗ match indicator as the user types.
 *
 * @param {string} newPwId      id of the "new / main password" input
 * @param {string} confirmPwId  id of the "confirm password" input
 */
function tvWirePasswordMatch(newPwId, confirmPwId) {
    const newEl  = document.getElementById(newPwId);
    const conEl  = document.getElementById(confirmPwId);
    if (!newEl || !conEl) return;
    if (conEl.dataset.tvPwMatch) return; // already wired
    conEl.dataset.tvPwMatch = '1';

    // Create the status pill element (inserted after conEl)
    const pill = document.createElement('div');
    pill.id = 'tv-pw-match-' + confirmPwId;
    pill.style.cssText = [
        'font-size:0.75rem',
        'font-weight:600',
        'margin-top:0.35rem',
        'padding:0.25rem 0.6rem',
        'border-radius:0.4rem',
        'display:none',
        'align-items:center',
        'gap:0.3rem',
        'transition:all 0.2s ease',
        'width:fit-content',
    ].join(';');
    // Insert right after confirm field's parent wrapper
    const insertTarget = conEl.parentElement || conEl;
    insertTarget.insertAdjacentElement('afterend', pill);

    function updateMatch() {
        const newVal = newEl.value;
        const conVal = conEl.value;

        // Only show indicator once the user has started typing in confirm
        if (!conVal) {
            pill.style.display = 'none';
            // Clear any border colour on confirm
            conEl.style.borderColor = '';
            conEl.style.boxShadow = '';
            return;
        }

        pill.style.display = 'flex';

        if (newVal === conVal) {
            // ✓ Match
            pill.innerHTML = `<span style="font-size:0.85rem;">✅</span> Passwords match`;
            pill.style.color = '#1DB954';
            pill.style.background = 'rgba(29,185,84,0.1)';
            pill.style.border = '1px solid rgba(29,185,84,0.25)';
            conEl.style.borderColor = '#1DB954';
            conEl.style.boxShadow = '0 0 0 2px rgba(29,185,84,0.2)';
            // Clear any existing error on confirm field
            tvClearError(conEl);
        } else {
            // ✗ Mismatch
            pill.innerHTML = `<span style="font-size:0.85rem;">❌</span> Passwords don't match`;
            pill.style.color = '#ef4444';
            pill.style.background = 'rgba(239,68,68,0.08)';
            pill.style.border = '1px solid rgba(239,68,68,0.25)';
            conEl.style.borderColor = '#ef4444';
            conEl.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.2)';
        }
    }

    // Listen on both fields — typing in "new password" after confirm was filled
    // should immediately update the status
    conEl.addEventListener('input', updateMatch);
    newEl.addEventListener('input', updateMatch);

    // On blur of confirm: if mismatch, show persistent inline error
    conEl.addEventListener('blur', function () {
        if (conEl.value && newEl.value !== conEl.value) {
            tvShowError(conEl, 'Passwords do not match');
        }
    });

    // If user clears new-password field, hide the indicator
    newEl.addEventListener('input', function () {
        if (!newEl.value) {
            pill.style.display = 'none';
            conEl.style.borderColor = '';
            conEl.style.boxShadow = '';
        }
    });
}

/* ─── CORE VALIDATE FUNCTION ──────────────────────────────── */

/**
 * Validates a set of rules against form fields.
 * @param {Array} rules  – [{id, label, required, type, minLen, match, matchLabel}]
 * @returns {boolean}    – true if all pass
 */
function tvValidate(rules) {
    let ok = true;
    rules.forEach(rule => {
        const el = document.getElementById(rule.id);
        if (!el) return;
        tvAttachLiveClearing(el);

        // Skip hidden (display:none parent)
        if (el.offsetParent === null && !rule.forceCheck) return;

        const val = (el.value || '').trim();

        // Required check
        if (rule.required && val === '') {
            tvShowError(el, `${rule.label} is required`);
            ok = false;
            return;
        }
        if (!val) return; // optional & empty → skip further checks

        // Email format
        if (rule.type === 'email' && !tvIsEmail(val)) {
            tvShowError(el, `Please enter a valid email address`);
            ok = false;
            return;
        }
        // Phone format
        if (rule.type === 'phone' && !tvIsPhone(val)) {
            tvShowError(el, `Please enter a valid phone number`);
            ok = false;
            return;
        }
        // Minimum length
        if (rule.minLen && val.length < rule.minLen) {
            tvShowError(el, `${rule.label} must be at least ${rule.minLen} characters`);
            ok = false;
            return;
        }
        // Positive number
        if (rule.type === 'number' && !tvIsPositiveNumber(val)) {
            tvShowError(el, `${rule.label} must be a valid positive number`);
            ok = false;
            return;
        }
        // Match another field
        if (rule.match) {
            const other = document.getElementById(rule.match);
            if (other && val !== other.value.trim()) {
                tvShowError(el, `${rule.label} does not match ${rule.matchLabel || 'the other field'}`);
                ok = false;
                return;
            }
        }
    });
    return ok;
}


/* ═══════════════════════════════════════════════════════════
   PAGE 1 – index.html  (Login / Sign-Up)
═══════════════════════════════════════════════════════════ */
/**
 * tvValidateLoginForm()
 * Called by handleLogin() in index.html BEFORE it processes the submission.
 * Returns true if all fields are valid, false (+ shows toast) if not.
 * Does NOT redirect — that is handleLogin()'s job.
 */
function tvValidateLoginForm() {
    const nameWrapper    = document.getElementById('name-field');
    const confirmWrapper = document.getElementById('confirm-password-field');
    const isSignup       = (nameWrapper && nameWrapper.style.display !== 'none');

    const submitBtn = document.getElementById('submit-btn');
    const emailEl   = document.querySelector('#auth-page input[type="email"]');
    const passEl    = document.getElementById('password');
    const nameEl    = (isSignup && nameWrapper) ? nameWrapper.querySelector('input') : null;
    const confEl    = (isSignup && confirmWrapper) ? confirmWrapper.querySelector('input[type="password"]') : null;

    const emailVal = (emailEl ? emailEl.value : '').trim();
    const passVal  = (passEl  ? passEl.value  : '').trim();
    const nameVal  = (nameEl  ? nameEl.value  : '').trim();
    const confVal  = (confEl  ? confEl.value  : '').trim();

    if (isSignup) {
        if (!nameVal) {
            tvLoginToast('👤 Please enter your full name to sign up.');
            if (submitBtn) tvShake(submitBtn);
            if (nameEl) nameEl.focus();
            return false;
        }
        if (!emailVal) {
            tvLoginToast('📧 Please enter your email address.');
            if (submitBtn) tvShake(submitBtn);
            if (emailEl) emailEl.focus();
            return false;
        }
        if (!tvIsEmail(emailVal)) {
            tvLoginToast('📧 Please enter a valid email address.');
            if (submitBtn) tvShake(submitBtn);
            if (emailEl) emailEl.focus();
            return false;
        }
        if (!passVal || passVal.length < 6) {
            tvLoginToast('🔒 Password must be at least 6 characters.');
            if (submitBtn) tvShake(submitBtn);
            if (passEl) passEl.focus();
            return false;
        }
        if (!confVal || confVal !== passVal) {
            tvLoginToast('🔒 Passwords do not match. Please re-enter.');
            if (submitBtn) tvShake(submitBtn);
            if (confEl) confEl.focus();
            return false;
        }
    } else {
        if (!emailVal && !passVal) {
            tvLoginToast('📧 Please fill in your email and password to login.');
            if (submitBtn) tvShake(submitBtn);
            if (emailEl) emailEl.focus();
            return false;
        }
        if (!emailVal) {
            tvLoginToast('📧 Please enter your email address.');
            if (submitBtn) tvShake(submitBtn);
            if (emailEl) emailEl.focus();
            return false;
        }
        if (!tvIsEmail(emailVal)) {
            tvLoginToast('📧 Please enter a valid email address.');
            if (submitBtn) tvShake(submitBtn);
            if (emailEl) emailEl.focus();
            return false;
        }
        if (!passVal) {
            tvLoginToast('🔒 Please enter your password.');
            if (submitBtn) tvShake(submitBtn);
            if (passEl) passEl.focus();
            return false;
        }
    }
    return true;
}

/** Keep tvInitLoginPage as a no-op for backward compat — validation is now called from handleLogin() */
function tvInitLoginPage() { /* validation is now driven by handleLogin() via tvValidateLoginForm() */ }



/**
 * Show a beautiful floating popup toast specifically for the login page.
 * Appears at the top-right (near the form), auto-dismisses after 3 s.
 */
function tvLoginToast(msg) {
    // Remove any existing login toast
    const old = document.getElementById('tv-login-toast');
    if (old) { old.style.opacity = '0'; setTimeout(() => old.remove(), 200); }

    const toast = document.createElement('div');
    toast.id = 'tv-login-toast';
    toast.innerHTML = `
        <span style="font-size:1.1rem;line-height:1;">${msg.split(' ')[0]}</span>
        <span style="flex:1;">${msg.split(' ').slice(1).join(' ')}</span>
    `;
    toast.style.cssText = [
        'position:fixed',
        'top:1.25rem',
        'right:1.5rem',
        'display:flex',
        'align-items:center',
        'gap:0.6rem',
        'background:#1c1c1c',
        'color:#fff',
        'padding:0.9rem 1.5rem',
        'border-radius:0.875rem',
        'font-size:0.88rem',
        'font-weight:600',
        'box-shadow:0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(239,68,68,0.4)',
        'border-left:4px solid #ef4444',
        'z-index:999999',
        'opacity:0',
        'transform:translateY(-12px) scale(0.95)',
        'transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'pointer-events:none',
        'max-width:340px',
        'line-height:1.4',
    ].join(';');

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Auto-dismiss after 3 s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}


/* ═══════════════════════════════════════════════════════════
   PAGE 2 – seller-dashboard.html
═══════════════════════════════════════════════════════════ */

/* -- Add Property form -- */
function tvValidateAddProperty() {
    return tvValidate([
        { id: 'new-prop-name',     label: 'Property Name',    required: true,  minLen: 3 },
        { id: 'new-prop-location', label: 'City / Location',  required: true,  minLen: 2 },
        { id: 'new-prop-price',    label: 'Price',            required: true,  type: 'number' },
        { id: 'new-prop-sqft',     label: 'Area (sqft)',      required: true,  type: 'number' },
        { id: 'new-prop-beds',     label: 'Bedrooms',         required: true,  type: 'number' },
        { id: 'new-prop-baths',    label: 'Bathrooms',        required: true,  type: 'number' },
    ]);
}

/* -- Counter Offer modal -- */
function tvValidateCounterOffer() {
    return tvValidate([
        { id: 'counter-offer-input', label: 'Counter Offer Amount', required: true, type: 'number' },
    ]);
}

/* -- Reschedule Visit modal -- */
function tvValidateReschedule() {
    // Check that a date/slot is selected
    const dateInput = document.getElementById('reschedule-date') ||
                      document.querySelector('#reschedule-modal input[type="date"]');
    if (dateInput) {
        tvAttachLiveClearing(dateInput);
        if (!dateInput.value) {
            tvShowError(dateInput, 'Please select a visit date');
            tvShake(dateInput);
            return false;
        }
    } else {
        // Calendar-based selection
        const selected = document.querySelector('.cal-day.selected, .cal-day-selected, [data-selected="true"]');
        if (!selected) {
            showToast && showToast('Please select a date from the calendar.', 'error');
            return false;
        }
    }
    const slotSelected = document.querySelector('.slot-btn.selected, .slot-btn[style*="#1DB954"]');
    if (!slotSelected) {
        showToast && showToast('Please select a time slot.', 'error');
        return false;
    }
    return true;
}

/* -- Seller Profile page -- */
function tvValidateSellerProfile() {
    return tvValidate([
        { id: 'prof-fname',    label: 'First Name',       required: true },
        { id: 'prof-lname',    label: 'Last Name',        required: true },
        { id: 'prof-email',    label: 'Email',            required: true, type: 'email' },
        { id: 'prof-phone',    label: 'Phone',            required: true, type: 'phone' },
        { id: 'prof-location', label: 'Location',         required: true },
        { id: 'prof-dob',      label: 'Date of Birth',   required: true },
    ]);
}

/* -- Password Change (any dashboard) -- */
function tvValidatePasswordChange(currentId, newId, confirmId) {
    const curEl  = document.getElementById(currentId);
    const newEl  = document.getElementById(newId);
    const conEl  = document.getElementById(confirmId);
    if (!curEl && !newEl && !conEl) return true; // fields absent → skip

    // Only validate if user touched any of them
    const anyFilled = (curEl && curEl.value) || (newEl && newEl.value) || (conEl && conEl.value);
    if (!anyFilled) return true;

    if (curEl)  { curEl.id  = curEl.id  || 'tv-cur-pw';  tvAttachLiveClearing(curEl); }
    if (newEl)  { newEl.id  = newEl.id  || 'tv-new-pw';  tvAttachLiveClearing(newEl); }
    if (conEl)  { conEl.id  = conEl.id  || 'tv-con-pw';  tvAttachLiveClearing(conEl); }

    return tvValidate([
        { id: curEl  ? curEl.id  : 'tv-cur-pw', label: 'Current Password', required: true, minLen: 6 },
        { id: newEl  ? newEl.id  : 'tv-new-pw', label: 'New Password',     required: true, minLen: 8 },
        { id: conEl  ? conEl.id  : 'tv-con-pw', label: 'Confirm Password', required: true,
          match: newEl ? newEl.id : 'tv-new-pw', matchLabel: 'New Password' },
    ]);
}


/* ═══════════════════════════════════════════════════════════
   PAGE 3 – agent-dashboard.html
═══════════════════════════════════════════════════════════ */

/* -- Edit Profile modal -- */
function tvValidateAgentEditProfile() {
    return tvValidate([
        { id: 'ep-name',     label: 'Full Name',  required: true },
        { id: 'ep-email',    label: 'Email',      required: true, type: 'email' },
        { id: 'ep-phone',    label: 'Phone',      required: true, type: 'phone' },
        { id: 'ep-location', label: 'Location',   required: true },
    ]);
}

/* -- Agent Profile page fields -- */
function tvValidateAgentProfile() {
    return tvValidate([
        { id: 'pf-name',     label: 'Full Name',      required: true },
        { id: 'pf-phone',    label: 'Phone',          required: true, type: 'phone' },
        { id: 'pf-email',    label: 'Email',          required: true, type: 'email' },
        { id: 'pf-location', label: 'Location',       required: true },
        { id: 'pf-dob',      label: 'Date of Birth',  required: true },
    ]);
}


/* ═══════════════════════════════════════════════════════════
   PAGE 4 – admin-dashboard.html
═══════════════════════════════════════════════════════════ */
function tvValidateAdminProfile() {
    const ok1 = tvValidate([
        { id: 'profile-fname', label: 'First Name',    required: true },
        { id: 'profile-lname', label: 'Last Name',     required: true },
        { id: 'profile-email', label: 'Email',         required: true, type: 'email' },
        { id: 'profile-phone', label: 'Phone',         required: true, type: 'phone' },
        { id: 'profile-dob',   label: 'Date of Birth', required: true },
    ]);
    const ok2 = tvValidatePasswordChange('current-password', 'new-password', 'confirm-password');

    // Office details — city & state must not contain digits, pincode must be exactly 6 digits
    let ok3 = true;
    const cityEl    = document.getElementById('office-city');
    const stateEl   = document.getElementById('office-state');
    const pincodeEl = document.getElementById('office-pincode');

    if (cityEl && cityEl.value.trim()) {
        tvAttachLiveClearing(cityEl);
        if (/[0-9]/.test(cityEl.value)) {
            tvShowError(cityEl, 'City must not contain numbers');
            tvShake(cityEl);
            ok3 = false;
        }
    }
    if (stateEl && stateEl.value.trim()) {
        tvAttachLiveClearing(stateEl);
        if (/[0-9]/.test(stateEl.value)) {
            tvShowError(stateEl, 'State must not contain numbers');
            tvShake(stateEl);
            ok3 = false;
        }
    }
    if (pincodeEl && pincodeEl.value.trim()) {
        tvAttachLiveClearing(pincodeEl);
        const pin = pincodeEl.value.trim();
        if (!/^\d{6}$/.test(pin)) {
            tvShowError(pincodeEl, 'Pincode must be exactly 6 digits');
            tvShake(pincodeEl);
            ok3 = false;
        }
    }

    return ok1 && ok2 && ok3;
}


/* ═══════════════════════════════════════════════════════════
   PAGE 5 – superuser-dashboard.html
═══════════════════════════════════════════════════════════ */

/* -- Add/Edit User modal -- */
function tvValidateUserForm() {
    return tvValidate([
        { id: 'user-name',  label: 'Full Name', required: true, minLen: 2 },
        { id: 'user-email', label: 'Email',     required: true, type: 'email' },
    ]);
}

/* -- Add/Edit Property modal -- */
function tvValidatePropForm() {
    return tvValidate([
        { id: 'prop-title',    label: 'Property Title', required: true, minLen: 3 },
        { id: 'prop-location', label: 'Location',       required: true },
        { id: 'prop-price',    label: 'Price',          required: true },
    ]);
}

/* -- System Settings form -- */
function tvValidateSettings() {
    const platformNameInput = document.querySelector('#settings-form input[type="text"]');
    const uploadSizeInput   = document.querySelector('#settings-form input[type="number"]');
    if (platformNameInput && !platformNameInput.id) platformNameInput.id = 'tv-platform-name';
    if (uploadSizeInput   && !uploadSizeInput.id)   uploadSizeInput.id   = 'tv-upload-size';
    return tvValidate([
        { id: 'tv-platform-name', label: 'Platform Name', required: true },
        { id: 'tv-upload-size',   label: 'Upload Size',   required: true, type: 'number' },
    ]);
}


/* ═══════════════════════════════════════════════════════════
   PAGE 6 – Buyer Dashboard - truEstate.html
═══════════════════════════════════════════════════════════ */

/* -- Buyer offer popup -- */
function tvValidateBuyerOffer() {
    const offerInput = document.getElementById('offer-amount-input') ||
                       document.querySelector('#offer-form-popup input[type="text"]') ||
                       document.querySelector('#offer-form-popup input[type="number"]');
    if (!offerInput) return true;
    if (!offerInput.id) offerInput.id = 'tv-offer-amount';
    tvAttachLiveClearing(offerInput);
    if (!offerInput.value.trim()) {
        tvShowError(offerInput, 'Please enter your offer amount');
        tvShake(offerInput);
        return false;
    }
    if (!tvIsPositiveNumber(offerInput.value)) {
        tvShowError(offerInput, 'Please enter a valid offer amount');
        tvShake(offerInput);
        return false;
    }
    return true;
}

/* -- Buyer Profile page -- */
function tvValidateBuyerProfile() {
    return tvValidate([
        { id: 'prof-fname',    label: 'First Name',     required: true },
        { id: 'prof-lname',    label: 'Last Name',      required: true },
        { id: 'prof-email',    label: 'Email',          required: true, type: 'email' },
        { id: 'prof-phone',    label: 'Phone',          required: true, type: 'phone' },
        { id: 'prof-location', label: 'Location',       required: true },
        { id: 'prof-dob',      label: 'Date of Birth',  required: true },
    ]);
}

/* -- Seller: Update Password button handler -- */
function updateSellerPassword() {
    const ok = tvValidatePasswordChange(
        'seller-current-password',
        'seller-new-password',
        'seller-confirm-password'
    );
    if (ok) {
        // Clear the fields after a successful update
        ['seller-current-password','seller-new-password','seller-confirm-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = ''; el.style.borderColor = ''; el.style.boxShadow = ''; }
        });
        const pill = document.getElementById('tv-pw-match-seller-confirm-password');
        if (pill) pill.style.display = 'none';
        showToast && showToast('\u2705 Password updated successfully!');
    } else {
        showToast && showToast('\u274C Passwords do not match. Please re-enter.', 'error');
    }
}

/* -- Buyer: Update Password button handler -- */
function updateBuyerPassword() {
    const ok = tvValidatePasswordChange(
        'buyer-current-password',
        'buyer-new-password',
        'buyer-confirm-password'
    );
    if (ok) {
        // Clear the fields after a successful update
        ['buyer-current-password','buyer-new-password','buyer-confirm-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = ''; el.style.borderColor = ''; el.style.boxShadow = ''; }
        });
        const pill = document.getElementById('tv-pw-match-buyer-confirm-password');
        if (pill) pill.style.display = 'none';
        showToast && showToast('\u2705 Password updated successfully!');
    } else {
        showToast && showToast('\u274C Passwords do not match. Please re-enter.', 'error');
    }
}


/* ─── PAGE-LEVEL AUTO-WIRING ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

    const page = location.pathname.split('/').pop().toLowerCase();

    /* ── index.html ───────────────────────────────────── */
    if (page === 'index.html' || page === '') {
        tvInitLoginPage();
        // Wire confirm-password match indicator for the Sign-Up form
        // The confirm input gets its id set lazily by tvInitLoginPage, so defer slightly
        setTimeout(() => {
            tvWirePasswordMatch('password', 'tv-confirm-pw');
        }, 100);
    }

    /* ── seller-dashboard.html ───────────────────────── */
    if (page === 'seller-dashboard.html') {

        // Wire live password match indicator for Change Password section
        tvWirePasswordMatch('seller-new-password', 'seller-confirm-password');

        /* Add Property form */
        const addForm = document.getElementById('addPropertyForm');
        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                if (!tvValidateAddProperty()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(this.querySelector('[type="submit"]'));
                    showToast && showToast('Please fill in all required property fields.', 'error');
                }
            }, true); // capture so we run BEFORE the existing handler
        }

        /* Counter Offer modal submit button */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.textContent.trim().includes('Submit Counter Offer') ||
                btn.onclick && btn.getAttribute('onclick') === 'submitCounterOffer()') {
                if (!tvValidateCounterOffer()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                }
            }
        }, true);

        /* Reschedule confirm button */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            if ((btn.textContent.trim() === 'Confirm Reschedule') ||
                (btn.getAttribute('onclick') === 'confirmReschedule()')) {
                if (!tvValidateReschedule()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }, true);

        /* Profile Save Changes button — matched via onclick attr because text spans multiple HTML lines */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const oc = btn.getAttribute('onclick') || '';
            const txt = btn.textContent.replace(/\s+/g, ' ').trim();
            if (oc.includes('saveSellerProfile') || txt === 'Save Changes') {
                if (!tvValidateSellerProfile()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                    showToast && showToast('Please complete all required profile fields.', 'error');
                }
            }
        }, true);
    }

    /* ── agent-dashboard.html ────────────────────────── */
    if (page === 'agent-dashboard.html') {

        /* Edit Profile modal Save button — matches onclick="saveAgentProfile()" */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const oc = btn.getAttribute('onclick') || '';
            if (oc.includes('saveEditProfile') || oc.includes('saveAgentProfile')) {
                if (!tvValidateAgentEditProfile()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                    showToast && showToast('Please fill in all required profile fields.', 'error');
                }
            }
        }, true);

        /* Profile page inline Save Changes (text may span lines) */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const oc  = btn.getAttribute('onclick') || '';
            const txt = btn.textContent.replace(/\s+/g, ' ').trim();
            if ((txt === 'Save Changes' || oc.includes('saveAgentProfile')) && !oc.includes('saveEditProfile')) {
                if (!tvValidateAgentProfile()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                    showToast && showToast('Please complete all required profile fields.', 'error');
                }
            }
        }, true);
    }

    /* ── admin-dashboard.html ────────────────────────── */
    if (page === 'admin-dashboard.html') {
        // Wire confirm-password match indicator for Security Settings
        tvWirePasswordMatch('new-password', 'confirm-password');

        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.textContent.trim() === 'Save Changes') {
                if (!tvValidateAdminProfile()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                    showToast && showToast('Please complete all required fields.', 'error');
                }
            }
        }, true);
    }

    /* ── superuser-dashboard.html ────────────────────── */
    if (page === 'superuser-dashboard.html') {

        /* User form */
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', function(e) {
                if (!tvValidateUserForm()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const btn = this.querySelector('[type="submit"]');
                    if (btn) tvShake(btn);
                    showToast && showToast('Please fill in all required user fields.', 'error');
                }
            }, true);
        }

        /* Property form */
        const propForm = document.getElementById('prop-form');
        if (propForm) {
            propForm.addEventListener('submit', function(e) {
                if (!tvValidatePropForm()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const btn = this.querySelector('[type="submit"]');
                    if (btn) tvShake(btn);
                    showToast && showToast('Please fill in all required property fields.', 'error');
                }
            }, true);
        }

        /* Settings Save button */
        const saveSettingsBtn = document.getElementById('btn-save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', function(e) {
                if (!tvValidateSettings()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(this);
                    showToast && showToast('Platform Name and Upload Size are required.', 'error');
                }
            }, true);
        }
    }

    /* ── Buyer Dashboard ─────────────────────────────── */
    if (page.includes('buyer')) {

        // Wire live password match indicator for Change Password section
        tvWirePasswordMatch('buyer-new-password', 'buyer-confirm-password');

        /* Offer form submit */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.textContent.trim().toLowerCase().includes('submit offer') ||
                (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('submitOffer'))) {
                if (!tvValidateBuyerOffer()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }, true);

        /* Profile Save Changes — matched via onclick attr because text spans multiple HTML lines */
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const oc  = btn.getAttribute('onclick') || '';
            const txt = btn.textContent.replace(/\s+/g, ' ').trim();
            if (oc.includes('saveProfile') || txt === 'Save Changes') {
                if (!tvValidateBuyerProfile()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    tvShake(btn);
                    showToast && showToast('Please complete all required profile fields.', 'error');
                }
            }
        }, true);
    }

    /* ── Live-clear on every relevant input across ALL pages ── */
    document.querySelectorAll('input, textarea, select').forEach(el => {
        tvAttachLiveClearing(el);
    });

    /* ── Apply input restrictions on every page (runs immediately) ── */
    tvApplyRestrictionsToPage();
    tvApplyDobRestrictions();

    /* ── Watch for dynamically added modals/popups and re-run restrictions ── */
    const _tvObserver = new MutationObserver(mutations => {
        let needsRescan = false;
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1 &&
                    (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' ||
                     node.querySelector && node.querySelector('input, textarea'))) {
                    needsRescan = true;
                }
            });
        });
        if (needsRescan) {
            tvApplyRestrictionsToPage();
            tvApplyDobRestrictions();
        }
    });
    _tvObserver.observe(document.body, { childList: true, subtree: true });
});


/* ─── EXPORTS (callable from inline onclick attrs too) ──── */
window.tvValidateAddProperty      = tvValidateAddProperty;
window.tvValidateCounterOffer     = tvValidateCounterOffer;
window.tvValidateReschedule       = tvValidateReschedule;
window.tvValidateSellerProfile    = tvValidateSellerProfile;
window.tvValidateAgentEditProfile = tvValidateAgentEditProfile;
window.tvValidateAgentProfile     = tvValidateAgentProfile;
window.tvValidateAdminProfile     = tvValidateAdminProfile;
window.tvValidateUserForm         = tvValidateUserForm;
window.tvValidatePropForm         = tvValidatePropForm;
window.tvValidateSettings         = tvValidateSettings;
window.tvValidateBuyerOffer       = tvValidateBuyerOffer;
window.tvValidateBuyerProfile     = tvValidateBuyerProfile;
window.updateSellerPassword       = updateSellerPassword;
window.updateBuyerPassword        = updateBuyerPassword;
window.tvRestrictInput            = tvRestrictInput;
window.tvApplyRestrictionsToPage  = tvApplyRestrictionsToPage;
window.tvApplyDobRestrictions     = tvApplyDobRestrictions;
window.tvWirePasswordMatch        = tvWirePasswordMatch;
