
const TruEstate = {
    getUser() {
        try { return JSON.parse(localStorage.getItem('truEstate_user')); } catch { return null; }
    },
    setUser(user) {
        localStorage.setItem('truEstate_user', JSON.stringify(user));
    },
    clearUser() {
        localStorage.removeItem('truEstate_user');
    },
    logout() {
        this.clearUser();
        window.location.href = 'index.html';
    },
    requireAuth(role) {
        const user = this.getUser();
        if (!user) { window.location.href = 'index.html'; return false; }
        return true;
    }
};


function showToast(message, type = 'success') {
    const existing = document.querySelectorAll('.te-toast');
    existing.forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'te-toast';
    const bgColor = type === 'success' ? '#1DB954' : type === 'error' ? '#ef4444' : '#f59e0b';
    const textColor = type === 'success' ? '#000000' : '#ffffff';
    toast.style.cssText = `
        position: fixed; top: 1.5rem; right: 1.5rem; z-index: 10000;
        padding: 1rem 1.5rem; border-radius: 0.75rem;
        background-color: ${bgColor}; color: ${textColor};
        font-weight: 600; font-size: 0.875rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transform: translateX(120%); transition: transform 0.3s ease;
        max-width: 400px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== FORM VALIDATION ==========
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(form) {
    let valid = true;
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="number"], textarea, select');
    inputs.forEach(input => {
        if (input.offsetParent === null) return; // skip hidden
        input.style.borderColor = '';
        if (input.value.trim() === '') {
            input.style.borderColor = '#ef4444';
            valid = false;
        }
        if (input.type === 'email' && input.value.trim() && !validateEmail(input.value.trim())) {
            input.style.borderColor = '#ef4444';
            valid = false;
        }
    });
    if (!valid) showToast('Please fill in all required fields correctly', 'error');
    return valid;
}

// ========== DASHBOARD SIDEBAR NAVIGATION ==========
function initDashboardSidebar() {
    const sidebar = document.querySelector('aside') || document.querySelector('.sidebar');
    if (!sidebar) return;
    const navLinks = sidebar.querySelectorAll('nav a[href="#"]');
    const mainContent = document.querySelector('main') || document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Look for page-content sections first (buyer dashboard style)
    const pageContents = mainContent.querySelectorAll('.page-content');
    if (pageContents.length > 0) return; // Already has its own switching (buyer dashboard)
    
    // For seller/agent/admin that need page content sections created
    const contentSections = mainContent.querySelectorAll('[data-section]');
    if (contentSections.length === 0) return;
    
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-nav');
            if (!sectionId) return;
            
            // Remove active from all nav links
            navLinks.forEach(l => {
                l.style.backgroundColor = '';
                l.style.color = '#9ca3af';
                const indicator = l.querySelector('.nav-indicator-dynamic');
                if (indicator) indicator.remove();
            });
            
            // Set active
            this.style.backgroundColor = '#282828';
            this.style.color = '#ffffff';
            const indicator = document.createElement('div');
            indicator.className = 'nav-indicator-dynamic';
            indicator.style.cssText = 'margin-left: auto; width: 0.25rem; height: 2rem; background-color: #1DB954; border-radius: 9999px;';
            this.appendChild(indicator);

            // Switch content
            contentSections.forEach(s => s.style.display = 'none');
            const target = document.querySelector(`[data-section="${sectionId}"]`);
            if (target) {
                target.style.display = 'block';
                target.style.animation = 'fadeIn 0.3s ease';
            }
        });
    });
}

// ========== SEARCH FILTER ==========
function initSearchFilter(inputSelector, itemsSelector) {
    const input = document.querySelector(inputSelector);
    if (!input) return;
    input.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const items = document.querySelectorAll(itemsSelector);
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    if (window.innerWidth > 768) return;
    const sidebar = document.querySelector('aside') || document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.id = 'mobile-menu-btn';
    hamburger.innerHTML = `<svg style="width:1.5rem;height:1.5rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`;
    hamburger.style.cssText = `
        position: fixed; top: 1rem; left: 1rem; z-index: 1001;
        background-color: #1DB954; color: #000000;
        border: none; border-radius: 0.5rem; padding: 0.5rem;
        cursor: pointer; display: none;
    `;
    document.body.appendChild(hamburger);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.7); z-index: 999;
        display: none;
    `;
    document.body.appendChild(overlay);
    
    function checkMobile() {
        if (window.innerWidth <= 768) {
            hamburger.style.display = 'block';
            sidebar.style.position = 'fixed';
            sidebar.style.zIndex = '1000';
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.transition = 'transform 0.3s ease';
        } else {
            hamburger.style.display = 'none';
            sidebar.style.position = '';
            sidebar.style.zIndex = '';
            sidebar.style.transform = '';
            overlay.style.display = 'none';
        }
    }
    
    hamburger.addEventListener('click', function() {
        sidebar.style.transform = 'translateX(0)';
        overlay.style.display = 'block';
    });
    
    overlay.addEventListener('click', function() {
        sidebar.style.transform = 'translateX(-100%)';
        overlay.style.display = 'none';
    });
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
}

// ========== SMOOTH PAGE TRANSITIONS ==========
function initPageTransitions() {
    // Add fade-in animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .te-fade-in { animation: fadeIn 0.3s ease; }
    `;
    document.head.appendChild(style);
}

// ========== MODAL ==========
function showModal(title, content, onConfirm) {
    const existing = document.querySelector('.te-modal-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'te-modal-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.8); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.2s ease;
    `;
    
    overlay.innerHTML = `
        <div style="background-color: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">${title}</h3>
                <button class="te-modal-close" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.5rem; padding: 0.25rem;">✕</button>
            </div>
            <div class="te-modal-body">${content}</div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
                <button class="te-modal-cancel" style="background-color: #282828; color: #ffffff; padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;">Cancel</button>
                ${onConfirm ? '<button class="te-modal-confirm" style="background-color: #1DB954; color: #000000; padding: 0.625rem 1.25rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;">Confirm</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('.te-modal-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.te-modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    
    if (onConfirm) {
        overlay.querySelector('.te-modal-confirm').addEventListener('click', () => {
            onConfirm();
            overlay.remove();
        });
    }
}

// ========== INIT ON DOM READY ==========
document.addEventListener('DOMContentLoaded', function() {
    initPageTransitions();
    initMobileMenu();
    
    // Make all default "#" links do nothing harmful
    document.querySelectorAll('a[href="#"]').forEach(link => {
        if (!link.hasAttribute('data-page') && !link.hasAttribute('data-nav') && !link.getAttribute('onclick')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
            });
        }
    });
});
