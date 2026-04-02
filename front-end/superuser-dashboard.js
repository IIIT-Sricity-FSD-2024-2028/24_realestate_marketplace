// ============================================
// SUPER USER DASHBOARD LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboardStats();
    initUserManagement();
    initPropertyManagement();
    loadSettings();

    // Logout Logic
    document.getElementById('btn-logout').addEventListener('click', () => {
        // Clear session but keep global storage intact
        localStorage.removeItem('truEstate_user');
        window.location.href = 'index.html';
    });
});

// --- NAVIGATION ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    const savedTab = localStorage.getItem('activeSuperTab') || 'dashboard';

    function activateTab(tabId) {
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        const targetNav = document.querySelector(`.nav-item[data-nav="${tabId}"]`);
        if (targetNav) targetNav.classList.add('active');

        const targetId = 'section-' + tabId;
        const targetSec = document.getElementById(targetId);
        if (targetSec) targetSec.classList.add('active');

        if (targetId === 'section-dashboard') initDashboardStats();
        if (targetId === 'section-users') loadUsers();
        if (targetId === 'section-properties') loadProperties();

        localStorage.setItem('activeSuperTab', tabId);
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(item.getAttribute('data-nav'));
        });
    });

    activateTab(savedTab);
}

// --- DASHBOARD STATS ---
function initDashboardStats() {
    const globalUsers = JSON.parse(localStorage.getItem('globalUsers')) || [];
    const globalProps = JSON.parse(localStorage.getItem('properties')) || [];

    document.getElementById('stat-total-users').textContent = globalUsers.length > 0 ? globalUsers.length : '4';
    document.getElementById('stat-total-props').textContent = globalProps.length > 0 ? globalProps.length : '9';

    const activeUsers = globalUsers.filter(u => u.status === 'Active').length;
    document.getElementById('stat-active-users').textContent = activeUsers > 0 ? activeUsers : '3';
}

// --- USER MANAGEMENT (CRUD) ---
let currentUsers = [];

function loadUsers() {
    currentUsers = JSON.parse(localStorage.getItem('globalUsers')) || [];

    // ── Seed placeholder entries for roles that have never had a real signup ──
    // A "real" entry is one whose email doesn't match the hardcoded placeholder.
    const PLACEHOLDER_EMAILS = {
        'Buyer':  'buyer@truestate.com',
        'Seller': 'seller@truestate.com',
        'Agent':  'agent@truestate.com',
        'Admin':  'admin@truestate.com',
    };
    const hasRealUser = (role) => currentUsers.some(u => u.role === role && u.email !== PLACEHOLDER_EMAILS[role]);
    const hasAnyUser  = (role) => currentUsers.some(u => u.role === role);

    if (!hasAnyUser('Buyer'))  currentUsers.push({ id: 'U1001', name: 'James Morgan',  email: 'buyer@truestate.com',  role: 'Buyer',  status: 'Active' });
    if (!hasAnyUser('Seller')) currentUsers.push({ id: 'U1002', name: 'Sarah Parker',  email: 'seller@truestate.com', role: 'Seller', status: 'Active' });
    if (!hasAnyUser('Agent'))  currentUsers.push({ id: 'U1003', name: 'Mike Johnson',  email: 'agent@truestate.com',  role: 'Agent',  status: 'Active' });
    if (!hasAnyUser('Admin'))  currentUsers.push({ id: 'U1004', name: 'Admin User',    email: 'admin@truestate.com',  role: 'Admin',  status: 'Active' });

    // ── Overlay profile-store data onto matching entries (match by email) ──
    // This ensures profile edits in each dashboard are reflected here.
    const syncByEmail = (email, profile) => {
        const entry = currentUsers.find(u => u.email === email);
        if (entry && profile) {
            if (profile.name  && profile.name.trim())  entry.name  = profile.name.trim();
            if (profile.email && profile.email.trim()) entry.email = profile.email.trim();
        }
    };

    // Seller profile
    try {
        const sp = JSON.parse(localStorage.getItem('sellerProfile'));
        if (sp && sp.email) {
            const name = [sp.fname, sp.lname].filter(Boolean).join(' ').trim() || sp.name || '';
            syncByEmail(sp.email, { name: name || undefined, email: sp.email });
        }
    } catch (_) {}

    // Agent profile
    try {
        const ap = JSON.parse(localStorage.getItem('agentProfile'));
        if (ap && ap.email) syncByEmail(ap.email, { name: ap.name || undefined, email: ap.email });
    } catch (_) {}

    // Buyer profile
    try {
        const bp = JSON.parse(localStorage.getItem('buyerProfile'));
        if (bp && bp.email) {
            const name = [bp.fname, bp.lname].filter(Boolean).join(' ').trim() || bp.name || '';
            syncByEmail(bp.email, { name: name || undefined, email: bp.email });
        }
    } catch (_) {}

    // Admin profile
    try {
        const adminP = JSON.parse(localStorage.getItem('adminProfile'));
        if (adminP && adminP.email) syncByEmail(adminP.email, { name: adminP.name || undefined, email: adminP.email });
    } catch (_) {}

    saveUsers();
    renderUsersTable(currentUsers);
}

function saveUsers() {
    localStorage.setItem('globalUsers', JSON.stringify(currentUsers));
    initDashboardStats();
}

function renderUsersTable(usersToRender) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';

    if (usersToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #9ca3af;">No users found.</td></tr>';
        return;
    }

    usersToRender.forEach(user => {
        const tr = document.createElement('tr');

        // Status Badge Styling
        let statusBadge = '';
        if (user.status === 'Active') {
            statusBadge = '<span style="background: rgba(29, 185, 84, 0.15); color: #1DB954; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Active</span>';
        } else {
            statusBadge = '<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Blocked</span>';
        }

        tr.innerHTML = `
            <td><strong style="color: #fff;">${user.id}</strong></td>
            <td>${user.name}</td>
            <td style="color: #9ca3af;">${user.email}</td>
            <td>${user.role}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="deleteUser('${user.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 0.4rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function initUserManagement() {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-form');
    const btnAdd = document.getElementById('btn-add-user');
    const btnCancel = document.getElementById('cancel-user-btn');

    // Search and Filter
    document.getElementById('userSearchInput').addEventListener('input', (e) => filterUsers(e.target.value, document.getElementById('userRoleFilter').value));
    document.getElementById('userRoleFilter').addEventListener('change', (e) => filterUsers(document.getElementById('userSearchInput').value, e.target.value));

    btnAdd.addEventListener('click', () => {
        form.reset();
        modal.classList.add('active');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const role = document.getElementById('user-role').value;
        const status = document.getElementById('user-status').value;

        // ── Validation ──
        if (typeof tvValidateUserForm === 'function' && !tvValidateUserForm()) {
            if (window.showToast) window.showToast('Please fill in all required user fields.', 'error');
            return;
        }
        if (!name || !email) {
            if (window.showToast) window.showToast('Please fill all required fields.', 'error');
            return;
        }

        const newUser = {
            id: 'U' + Math.floor(Math.random() * 100000),
            name, email, role, status
        };

        currentUsers.push(newUser);
        saveUsers();
        renderUsersTable(currentUsers);
        modal.classList.remove('active');
    });

    loadUsers();
}

function filterUsers(searchTerm, roleFilter) {
    let filtered = currentUsers;
    if (searchTerm) {
        filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.role === roleFilter);
    }
    renderUsersTable(filtered);
}

window.deleteUser = function (id) {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        currentUsers = currentUsers.filter(u => u.id !== id);
        saveUsers();
        renderUsersTable(currentUsers);
    }
};


// --- PROPERTY MANAGEMENT (CRUD) ---
let currentProps = [];
const STATIC_PROPS = [
    { id: 1, name: 'Luxury Apartment', location: 'Banjara Hills, Hyderabad', price: '2,50,00,000', priceFormatted: '₹2.5 Cr', status: 'Listed' },
    { id: 2, name: 'Modern Villa', location: 'Jubilee Hills, Hyderabad', price: '5,20,00,000', priceFormatted: '₹5.2 Cr', status: 'Listed' },
    { id: 3, name: 'Sunset Villa', location: 'Gachibowli, Hyderabad', price: '3,80,00,000', priceFormatted: '₹3.8 Cr', status: 'Listed' },
    { id: 4, name: 'Sky Penthouse', location: 'HITEC City, Hyderabad', price: '7,50,00,000', priceFormatted: '₹7.5 Cr', status: 'Listed' },
    { id: 5, name: 'Green Valley Apartment', location: 'Gachibowli, Hyderabad', price: '1,20,00,000', priceFormatted: '₹1.2 Cr', status: 'Listed' },
    { id: 6, name: 'Royal Heritage Villa', location: 'Banjara Hills, Hyderabad', price: '8,50,00,000', priceFormatted: '₹8.5 Cr', status: 'Listed' },
    { id: 7, name: 'Tech Park Apartment', location: 'HITEC City, Hyderabad', price: '85,00,000', priceFormatted: '₹85 L', status: 'Listed' },
    { id: 8, name: 'Jubilee Heights Penthouse', location: 'Jubilee Hills, Hyderabad', price: '6,80,00,000', priceFormatted: '₹6.8 Cr', status: 'Listed' },
    { id: 9, name: 'Gachibowli Heights', location: 'Gachibowli, Hyderabad', price: '1,80,00,000', priceFormatted: '₹1.8 Cr', status: 'Listed' }
];

function loadProperties() {
    let localProps = JSON.parse(localStorage.getItem('properties')) || [];
    let deletedIds = JSON.parse(localStorage.getItem('deletedSuperProps')) || [];

    // Combine static properties with specifically created ones, excluding any force-deleted ones
    currentProps = [...STATIC_PROPS, ...localProps.map(lp => ({
        id: lp.id, name: lp.title || lp.name, location: lp.location, price: lp.price, priceFormatted: '₹' + lp.price, status: lp.status === 'pending' ? 'Draft' : 'Listed'
    }))].filter(p => !deletedIds.includes(String(p.id)));

    renderPropertiesTable(currentProps);
}

function saveProperties() {
    localStorage.setItem('properties', JSON.stringify(currentProps));
    // Trigger cross-actor sync if necessary (the other tabs read directly from localstorage on load)
    initDashboardStats();
}

function renderPropertiesTable(propsToRender) {
    const tbody = document.getElementById('props-tbody');
    tbody.innerHTML = '';

    if (propsToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #9ca3af;">No properties found in global system.</td></tr>';
        return;
    }

    propsToRender.forEach(prop => {
        const tr = document.createElement('tr');

        let statusBadge = '';
        if (prop.status === 'Listed') {
            statusBadge = '<span style="background: rgba(29, 185, 84, 0.15); color: #1DB954; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Listed</span>';
        } else if (prop.status === 'Draft') {
            statusBadge = '<span style="background: rgba(249, 115, 22, 0.15); color: #f97316; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Draft</span>';
        } else {
            statusBadge = '<span style="background: rgba(156, 163, 175, 0.15); color: #9ca3af; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Archived</span>';
        }

        tr.innerHTML = `
            <td><strong style="color: #fff;">${prop.id || 'P-NEW'}</strong></td>
            <td>
                <div style="font-weight: 600;">${prop.name || prop.title}</div>
                <div style="font-size: 0.75rem; color: #9ca3af;">${prop.location}</div>
            </td>
            <td style="color: #1DB954; font-weight: 600;">${prop.priceFormatted || prop.price || 'N/A'}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="deleteProperty('${prop.id}')" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 0.4rem 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s;">Force Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function initPropertyManagement() {
    const modal = document.getElementById('prop-modal');
    const form = document.getElementById('prop-form');
    const btnAdd = document.getElementById('btn-add-prop');
    const btnCancel = document.getElementById('cancel-prop-btn');

    // Search and Filter
    document.getElementById('propSearchInput').addEventListener('input', (e) => filterProperties(e.target.value, document.getElementById('propStatusFilter').value));
    document.getElementById('propStatusFilter').addEventListener('change', (e) => filterProperties(document.getElementById('propSearchInput').value, e.target.value));

    btnAdd.addEventListener('click', () => {
        form.reset();
        modal.classList.add('active');
    });

    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('prop-title').value;
        const location = document.getElementById('prop-location').value;
        const price = document.getElementById('prop-price').value;
        const status = document.getElementById('prop-status').value;

        // ── Validation ──
        if (typeof tvValidatePropForm === 'function' && !tvValidatePropForm()) {
            if (window.showToast) window.showToast('Please fill in all required property fields.', 'error');
            return;
        }
        if (!title || !location || !price) {
            if (window.showToast) window.showToast('Please fill all required fields.', 'error');
            return;
        }

        const newProp = {
            id: 'PROP' + Math.floor(Math.random() * 100000),
            name: title,
            location: location,
            price: price.replace(/[^0-9.]/g, ''), // Strip out currency symbols for raw value just in case
            status: status,
            type: 'Apartment',
            date: new Date().toISOString().split('T')[0]
        };

        currentProps.push(newProp);
        saveProperties();
        renderPropertiesTable(currentProps);
        modal.classList.remove('active');
    });

    loadProperties();
}

function filterProperties(searchTerm, statusFilter) {
    let filtered = currentProps;
    if (searchTerm) {
        filtered = filtered.filter(p => (p.name || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
    }
    renderPropertiesTable(filtered);
}

window.deleteProperty = function (id) {
    if (confirm("Are you sure you want to force delete this property? It will be removed from the Super Admin view.")) {
        let deletedIds = JSON.parse(localStorage.getItem('deletedSuperProps')) || [];
        deletedIds.push(String(id));
        localStorage.setItem('deletedSuperProps', JSON.stringify(deletedIds));

        let localProps = JSON.parse(localStorage.getItem('properties')) || [];
        let newLocal = localProps.filter(p => String(p.id) !== String(id));
        if (newLocal.length !== localProps.length) {
            localStorage.setItem('properties', JSON.stringify(newLocal));
        }

        loadProperties();
        initDashboardStats();
    }
};

// --- SETTINGS (PERSISTENCE) ---
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('superSystemSettings')) || null;
    if (settings) {
        const inputs = document.querySelectorAll('#settings-form .form-control');
        if (inputs.length >= 3) {
            inputs[0].value = settings.platformName || "truEstate";
            inputs[1].value = settings.maintenanceMode || "false";
            inputs[2].value = settings.maxUploadSize || "25";
        }
    }
}

// Handle Settings Save
document.getElementById('btn-save-settings').addEventListener('click', () => {
    // ── Validation ──
    if (typeof tvValidateSettings === 'function' && !tvValidateSettings()) {
        if (window.showToast) window.showToast('Platform Name and Upload Size are required.', 'error');
        return;
    }
    const inputs = document.querySelectorAll('#settings-form .form-control');
    if (inputs.length >= 3) {
        const settings = {
            platformName: inputs[0].value,
            maintenanceMode: inputs[1].value,
            maxUploadSize: inputs[2].value
        };
        localStorage.setItem('superSystemSettings', JSON.stringify(settings));
        if (window.showToast) window.showToast('✅ System settings saved successfully!');
        else alert('System settings saved and applied successfully.');
    }
});
