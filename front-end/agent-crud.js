/**
 * Agent Dashboard CRUD Operations & Persistence
 */

// ====== AGENT PROFILE ======
function saveAgentProfile() {
    // ── Validation ──
    if (typeof tvValidateAgentProfile === 'function' && !tvValidateAgentProfile()) {
        if (window.showToast) window.showToast('⚠️ Please fill in all required profile fields.');
        return;
    }
    const profile = {
        name: document.getElementById('pf-name')?.value || '',
        phone: document.getElementById('pf-phone')?.value || '',
        email: document.getElementById('pf-email')?.value || '',
        location: document.getElementById('pf-location')?.value || '',
        area: document.getElementById('pf-area')?.value || ''
    };
    localStorage.setItem('agentProfile', JSON.stringify(profile));

    // ── Sync back to globalUsers so Super Admin sees real email ──
    try {
        let gUsers = JSON.parse(localStorage.getItem('globalUsers')) || [];
        const entry = gUsers.find(u => u.role === 'Agent');
        if (entry) {
            if (profile.name)  entry.name  = profile.name;
            if (profile.email) entry.email = profile.email;
            localStorage.setItem('globalUsers', JSON.stringify(gUsers));
        }
    } catch (_) {}

    // Update UI Elements globally
    updateAgentProfileUI(profile);

    if (window.showToast) window.showToast('✅ Profile saved successfully!');
}

function loadAgentProfile() {
    const data = localStorage.getItem('agentProfile');
    if (!data) return;
    const p = JSON.parse(data);

    if (document.getElementById('pf-name')) document.getElementById('pf-name').value = p.name || '';
    if (document.getElementById('pf-phone')) document.getElementById('pf-phone').value = p.phone || '';
    if (document.getElementById('pf-email')) document.getElementById('pf-email').value = p.email || '';
    if (document.getElementById('pf-location')) document.getElementById('pf-location').value = p.location || '';
    if (document.getElementById('pf-area')) document.getElementById('pf-area').value = p.area || '';

    updateAgentProfileUI(p);
}

function updateAgentProfileUI(profile) {
    if (!profile) return;

    // Update Profile Header
    if (profile.name) {
        const nameEl = document.querySelector('[data-section="profile"] h2');
        if (nameEl) nameEl.textContent = profile.name;

        // Avatar in profile header
        const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        // The avatar is the first element with that specific style 
        // 5rem x 5rem
        const avatars = document.querySelectorAll('div[style*="5rem"]');
        avatars.forEach(av => {
            if (av.style.borderRadius === '9999px') av.textContent = initials;
        });

        // Sidebar avatar
        const sidebarAvatar = document.querySelector('aside div[style*="2.5rem"][style*="9999px"]');
        if (sidebarAvatar) sidebarAvatar.textContent = initials;

        // Sidebar name
        const sidebarName = document.querySelector('aside div > div[style*="font-weight:500"]');
        if (sidebarName) sidebarName.textContent = profile.name;
    }

    const profParas = document.querySelectorAll('[data-section="profile"] p');
    if (profile.email) {
        profParas.forEach(p => {
            if (p.textContent.includes('@')) p.textContent = profile.email;
        });
    }
}

// ====== DYNAMIC PURCHASE TRACKING ======
function renderAgentPurchaseTracking() {
    const container = document.getElementById('agent-ptrack-container');
    if (!container) return;

    // Load actual offers from the buyer
    const offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    const acceptedOffers = offers.filter(o => o.status === 'accepted');

    // Also mix in mocked purchases if there are any that the buyer clicked directly
    let mockPurchases = JSON.parse(localStorage.getItem('mockPurchases')) || [];

    // Combine them into a standard struct
    let allDeals = [];
    acceptedOffers.forEach(o => allDeals.push({ id: o.id, propName: o.title, location: o.area, buyerName: 'Assigned Buyer', agreedAmt: o.priceFmt, status: o.dealStatus || 'in-progress', step: o.dealStep || 1, isMock: false }));
    mockPurchases.forEach((m, idx) => allDeals.push({ id: 'mock_' + idx, propName: m.propName, location: m.location, buyerName: 'Assigned Buyer', agreedAmt: m.agreedPrice, status: m.dealStatus || 'in-progress', step: m.dealStep || 1, isMock: true }));

    if (allDeals.length === 0) {
        container.innerHTML = '<p style="color:#9ca3af;font-size:0.875rem;">No active purchase tracks found. Buyers must initiate purchases first.</p>';
        return;
    }

    const stepLabels = ['', 'Offer Accepted', 'Document Verification', 'Token Payment', 'Full Payment', 'Registration'];

    container.innerHTML = allDeals.map((deal, index) => {
        let sc = deal.status === 'completed' ? '#1DB954' : '#f97316';
        let st = deal.status === 'completed' ? '✅ Completed' : '⏳ In Progress';
        let borderC = deal.status === 'completed' ? '#1DB954' : '#3b82f6';
        let trackW = [0, 0, 25, 50, 75, 100][deal.step];

        // Ensure step cap
        const s = Math.min(5, deal.step);

        let progressNodes = '';
        for (let i = 1; i <= 5; i++) {
            if (i < s) {
                progressNodes += `
                <div style="flex:1;text-align:center;position:relative;z-index:2;">
                    <div style="width:2.25rem;height:2.25rem;border-radius:50%;background:#1DB954;margin:0 auto 0.5rem;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:700;color:#000;">✓</div>
                    <div style="font-size:0.7rem;color:#1DB954;font-weight:600;">${stepLabels[i]}</div>
                    <div style="font-size:0.6rem;color:#6b7280;margin-top:0.2rem;">Done</div>
                </div>`;
            } else if (i === s && deal.status !== 'completed') {
                progressNodes += `
                <div style="flex:1;text-align:center;position:relative;z-index:2;">
                    <div style="width:2.25rem;height:2.25rem;border-radius:50%;background:#f97316;margin:0 auto 0.5rem;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:#000;box-shadow:0 0 0 4px rgba(249,115,22,0.2);">●</div>
                    <div style="font-size:0.7rem;color:#f97316;font-weight:600;">${stepLabels[i]}</div>
                    <div style="font-size:0.6rem;color:#f97316;margin-top:0.2rem;">← Current Step</div>
                </div>`;
            } else {
                progressNodes += `
                <div style="flex:1;text-align:center;position:relative;z-index:2;">
                    <div style="width:2.25rem;height:2.25rem;border-radius:50%;background:#282828;border:2px solid #3f3f3f;margin:0 auto 0.5rem;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:700;color:#9ca3af;">${i}</div>
                    <div style="font-size:0.7rem;color:#9ca3af;font-weight:600;">${stepLabels[i]}</div>
                    <div style="font-size:0.6rem;color:#6b7280;margin-top:0.2rem;">Pending</div>
                </div>`;
            }
        }

        let actionNodes = '';
        if (deal.status !== 'completed' && s < 5) {
            for (let i = s + 1; i <= 5; i++) {
                if (i === s + 1) {
                    if (i === 2) {
                        actionNodes += `<button onclick="openDocVerifyModalDynamic('${deal.id}', ${deal.isMock})" style="background:#f97316;color:#000;padding:0.5rem 1.25rem;border-radius:0.5rem;border:none;font-weight:700;cursor:pointer;font-size:0.8rem;">📄 Verify Documents</button>`;
                    } else {
                        actionNodes += `<button onclick="agentAdvanceDeal('${deal.id}', ${deal.isMock}, ${i})" style="background:#f97316;color:#000;padding:0.5rem 1.25rem;border-radius:0.5rem;border:none;font-weight:700;cursor:pointer;font-size:0.8rem;">✓ ${stepLabels[i]} Done</button>`;
                    }
                } else {
                    if (i === 2) {
                        actionNodes += `<button onclick="openDocVerifyModalDynamic('${deal.id}', ${deal.isMock})" style="background:#282828;color:#9ca3af;padding:0.5rem 1.25rem;border-radius:0.5rem;border:none;font-weight:600;font-size:0.8rem;cursor:pointer;">📄 Verify Documents</button>`;
                    } else {
                        actionNodes += `<button onclick="agentAdvanceDeal('${deal.id}', ${deal.isMock})" style="background:#282828;color:#9ca3af;padding:0.5rem 1.25rem;border-radius:0.5rem;border:none;font-weight:600;font-size:0.8rem;cursor:pointer;">${stepLabels[i]} Done</button>`;
                    }
                }
            }
        }

        return `
        <div style="background:#1a1a1a;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.1);padding:1.75rem;margin-bottom:1.5rem;border-left:3px solid ${borderC};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                <div>
                    <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:0.25rem;">${deal.propName}</h3>
                    <p style="color:#9ca3af;font-size:0.8125rem;">📍 ${deal.location} · Buyer: ${deal.buyerName} · Agreed: <span style="color:#1DB954;font-weight:600;">${deal.agreedAmt}</span></p>
                </div>
                <span style="background:rgba(${deal.status === 'completed' ? '29,185,84' : '249,115,22'},0.12);color:${sc};padding:0.375rem 0.875rem;border-radius:0.375rem;font-size:0.8125rem;font-weight:600;">${st}</span>
            </div>
            
            <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.75rem;">
                <div style="position:absolute;top:1.125rem;left:1.5rem;right:1.5rem;height:2px;background:#282828;z-index:0;"></div>
                <div style="position:absolute;top:1.125rem;left:1.5rem;width:${trackW}%;height:2px;background:#1DB954;z-index:1;transition:width 0.4s;"></div>
                ${progressNodes}
            </div>

            ${deal.status === 'completed' ? `
            <div style="background:rgba(29,185,84,0.08);border:1px solid rgba(29,185,84,0.3);border-radius:0.75rem;padding:1rem 1.25rem;text-align:center;">
                <div style="font-size:1.375rem;margin-bottom:0.35rem;">🎉</div>
                <div style="font-weight:700;color:#1DB954;font-size:0.9375rem;">Deal Successfully Completed!</div>
                <div style="color:#9ca3af;font-size:0.8125rem;margin-top:0.25rem;">Registration done. Buyer & Seller have been notified.</div>
            </div>` : `
            <div style="background:#121212;border-radius:0.75rem;padding:1.25rem;">
                <p style="font-size:0.8125rem;color:#9ca3af;margin-bottom:1rem;">Mark the step completed <strong style="color:#fff;">after doing it offline</strong>.</p>
                <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">${actionNodes}</div>
            </div>`}
        </div>`;
    }).join('');
}

function agentAdvanceDeal(id, isMock, targetStep) {
    if (isMock) {
        let mockPurchases = JSON.parse(localStorage.getItem('mockPurchases')) || [];
        let m = mockPurchases[parseInt(id.replace('mock_', ''))];
        m.dealStep = targetStep || ((m.dealStep || 1) + 1);
        if (m.dealStep >= 5) { m.dealStep = 5; m.dealStatus = 'completed'; }
        localStorage.setItem('mockPurchases', JSON.stringify(mockPurchases));
    } else {
        let offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
        let o = offers.find(x => String(x.id) === String(id));
        if (o) {
            o.dealStep = targetStep || ((o.dealStep || 1) + 1);
            if (o.dealStep >= 5) { o.dealStep = 5; o.dealStatus = 'completed'; }
            localStorage.setItem('submittedOffers', JSON.stringify(offers));
        }
    }
    renderAgentPurchaseTracking();
    if (window.showToast) window.showToast('✅ Deal step advanced successfully.');
}

window.openDocVerifyModalDynamic = function (id, isMock) {
    const modal = document.getElementById('doc-verify-modal');
    if (!modal) return;

    // Set text
    let propName = 'Property';
    if (isMock) {
        let max = JSON.parse(localStorage.getItem('mockPurchases')) || [];
        if (max[parseInt(id.replace('mock_', ''))]) propName = max[parseInt(id.replace('mock_', ''))].propName;
    } else {
        let max = JSON.parse(localStorage.getItem('submittedOffers')) || [];
        let o = max.find(x => String(x.id) === String(id));
        if (o) propName = o.title;
    }
    const titleEl = document.getElementById('doc-verify-deal-name');
    if (titleEl) titleEl.textContent = propName;

    const docItems = [
        { id: 'doc-aadhar', label: 'Aadhar Card', desc: 'Buyer + Seller Aadhar verified' },
        { id: 'doc-pan', label: 'PAN Card', desc: 'Buyer + Seller PAN verified' },
        { id: 'doc-sale', label: 'Sale Deed Draft', desc: 'Original sale deed reviewed' },
        { id: 'doc-encumb', label: 'Encumbrance Certificate', desc: 'EC for last 15 years verified' },
        { id: 'doc-khata', label: 'Khata / Title Deed', desc: 'Property title documents verified' },
        { id: 'doc-noc', label: 'NOC from Society/Builder', desc: 'No-objection certificate obtained' },
    ];

    const list = document.getElementById('doc-checklist');
    if (list) {
        list.innerHTML = docItems.map(d => `
        <label style="display:flex;align-items:flex-start;gap:0.875rem;background:#121212;border-radius:0.625rem;padding:0.875rem;cursor:pointer;border:1px solid rgba(255,255,255,0.05);transition:border-color 0.2s;" onmouseover="this.style.borderColor='rgba(29,185,84,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
        <input type="checkbox" id="${d.id}" onchange="updateDocProgress()" style="width:1.1rem;height:1.1rem;accent-color:#1DB954;cursor:pointer;flex-shrink:0;margin-top:0.1rem;">
        <div>
            <div style="font-size:0.875rem;font-weight:600;margin-bottom:0.15rem;">${d.label}</div>
            <div style="font-size:0.75rem;color:#9ca3af;">${d.desc}</div>
        </div>
        </label>`).join('');
    }

    // Reset progress
    if (typeof window.updateDocProgress === 'function') window.updateDocProgress();
    else {
        // Fallback update
        const pb = document.getElementById('doc-progress-bar');
        const c = document.getElementById('doc-count');
        const b = document.getElementById('doc-verify-confirm-btn');
        if (pb) pb.style.width = '0%';
        if (c) c.textContent = '0 / 6';
        if (b) { b.style.background = '#282828'; b.style.color = '#9ca3af'; b.disabled = true; b.style.cursor = 'not-allowed'; }
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Wire confirm button directly
    const btn = document.getElementById('doc-verify-confirm-btn');
    if (btn) {
        btn.onclick = () => {
            const m = document.getElementById('doc-verify-modal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = '';
            agentAdvanceDeal(id, isMock);
        };
    }
};

// ====== AGENT TAB PERSISTENCE ======
function setupAgentTabPersistence() {
    const originalSwitch = window.switchAgentPage;
    if (originalSwitch) {
        window.switchAgentPage = function (pageId) {
            originalSwitch(pageId);
            localStorage.setItem('activeAgentPage', pageId);
        };
    }
}

function loadAgentTab() {
    const savedTab = localStorage.getItem('activeAgentPage');
    if (savedTab && window.switchAgentPage) {
        window.switchAgentPage(savedTab);
    }
}

// ====== SITE VISITS ======
window.switchVisitTab = function (tabName) {
    document.querySelectorAll('.visit-subtab').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#9ca3af';
    });
    const activeBtn = document.getElementById('vtab-' + tabName);
    if (activeBtn) {
        activeBtn.style.background = '#1DB954';
        activeBtn.style.color = '#000';
    }
    renderAgentVisits(tabName);
}

function renderAgentVisits(filter = 'upcoming') {
    const container = document.getElementById('agent-visits-container');
    if (!container) return;

    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];

    // Filter logic based on tab
    let filteredVisits = [];
    if (filter === 'upcoming') {
        filteredVisits = visits.filter(v => ['pending', 'accepted', 'rescheduled'].includes(v.status));
    } else if (filter === 'completed') {
        filteredVisits = visits.filter(v => v.status === 'completed');
    } else if (filter === 'failed') {
        filteredVisits = visits.filter(v => v.status === 'cancelled' || v.status === 'rejected');
    }

    if (filteredVisits.length === 0) {
        container.innerHTML = `<p style="color:#9ca3af;text-align:center;padding:2rem;">No ${filter} visits found.</p>`;
        return;
    }

    let html = '';
    filteredVisits.forEach((v, idx) => {
        const visitorFullName = v.buyer || v.visitorName || 'JD';
        const initials = visitorFullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const color = idx % 2 === 0 ? '#1DB954' : '#f97316'; // alternate colors like mockup

        let statusBadge = '';
        let actionButtons = '';
        const opStatus = v.agentStatus || 'pending';

        if (opStatus === 'pending') {
            statusBadge = `
            <div style="background:rgba(249,115,22,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#f97316;"></div>
              <span style="color:#f97316; font-size:0.8rem; font-weight:600;">Pending</span>
            </div>`;
            actionButtons = `
            <button onclick="acceptAgentVisit('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Confirm</button>
            <button onclick="openAgentReschedule('${v.id}')" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reschedule</button>
            <button onclick="declineAgentVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'accepted') {
            statusBadge = `
            <div style="background:rgba(29,185,84,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#1DB954;"></div>
              <span style="color:#1DB954; font-size:0.8rem; font-weight:600;">Confirmed by You</span>
            </div>`;
            actionButtons = `
            <button onclick="markAgentVisited('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Mark Completed</button>
            <button onclick="openAgentReschedule('${v.id}')" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reschedule</button>
            <button onclick="declineAgentVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'rescheduled') {
            statusBadge = `
            <div style="background:rgba(249,115,22,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#f97316;"></div>
              <span style="color:#f97316; font-size:0.8rem; font-weight:600;">Rescheduled</span>
            </div>`;
            actionButtons = `
            <button onclick="acceptAgentVisit('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Confirm</button>
            <button onclick="declineAgentVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'completed') {
            statusBadge = `
            <div style="background:rgba(29,185,84,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#1DB954;"></div>
              <span style="color:#1DB954; font-size:0.8rem; font-weight:600;">Completed</span>
            </div>`;
        } else {
            statusBadge = `
            <div style="background:rgba(239,68,68,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></div>
              <span style="color:#ef4444; font-size:0.8rem; font-weight:600;">${opStatus.charAt(0).toUpperCase() + opStatus.slice(1)}</span>
            </div>`;
        }

        const propTitle = v.propertyTitle || `Property #${v.propertyId}`;

        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 2rem; border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; align-items:center; gap:1.25rem;">
            <div style="width:3rem; height:3rem; border-radius:50%; background:${color}; color:${color === '#1DB954' ? '#000' : '#fff'}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1rem;">${initials}</div>
            <div>
              <h3 style="color:#fff; font-weight:600; font-size:1.05rem; margin-bottom:0.15rem;">${visitorFullName}</h3>
              <p style="color:#9ca3af; font-size:0.85rem; margin-bottom:0.15rem;">${v.propertyName || propTitle}</p>
              <div style="display:flex; align-items:center; gap:0.5rem; color:#6b7280; font-size:0.75rem; margin-top:0.4rem;">
                <span style="display:flex; align-items:center; gap:0.25rem;">📅 ${v.dateStr || v.date}</span>
                <span style="display:flex; align-items:center; gap:0.25rem;">⏰ ${v.slotTime || v.time}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            ${statusBadge}
            ${actionButtons}
          </div>
        </div>`;
    });

    container.innerHTML = html;
}

function updateAgentVisitStatus(id, newStatus) {
    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let v = visits.find(o => String(o.id) === String(id));
    if (v) {
        v.agentStatus = newStatus;
        if (v.agentStatus === 'rejected' || v.sellerStatus === 'rejected') v.status = 'rejected';
        else if (v.agentStatus === 'accepted' && (v.sellerStatus === 'accepted' || !v.sellerStatus)) v.status = 'accepted';
        else if (v.agentStatus === 'completed' || v.sellerStatus === 'completed') v.status = 'completed';
        else v.status = 'pending';

        localStorage.setItem('siteVisits', JSON.stringify(visits));
        renderAgentVisits();
    }
}

// Global hooks for dynamic elements
window.acceptAgentVisit = function (id) {
    updateAgentVisitStatus(id, 'accepted');
    if (window.showToast) window.showToast('✅ Visit Accepted! Buyer notified.');
};
window.declineAgentVisit = function (id) {
    updateAgentVisitStatus(id, 'rejected');
    if (window.showToast) window.showToast('Visit Declined.');
};
window.markAgentVisited = function (id) {
    updateAgentVisitStatus(id, 'completed');
    if (window.showToast) window.showToast('🏠 Visit marked as completed.');
};

let currentAgentRescheduleId = null;
window.openAgentReschedule = function (id) {
    currentAgentRescheduleId = id;
    const modal = document.getElementById('reschedule-modal');
    if (modal) modal.style.display = 'flex';
};
window.confirmReschedule = function () {
    if (!currentAgentRescheduleId) return;
    const dateStr = document.getElementById('resh-date')?.value || document.getElementById('reschedule-date')?.value;
    const timeStr = document.getElementById('resh-time')?.value || document.getElementById('reschedule-time')?.value;

    // ── Validation ──
    if (!dateStr) {
        if (window.showToast) window.showToast('⚠️ Please select a date for rescheduling.');
        const dateEl = document.getElementById('resh-date') || document.getElementById('reschedule-date');
        if (dateEl) { dateEl.style.borderColor = '#ef4444'; setTimeout(() => { dateEl.style.borderColor = ''; }, 2000); }
        return;
    }


    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let v = visits.find(o => String(o.id) === String(currentAgentRescheduleId));
    if (v) {
        if (dateStr) { v.date = dateStr; v.dateStr = dateStr; }
        if (timeStr) { v.time = timeStr; v.slotTime = timeStr; }
        v.agentStatus = 'accepted';
        v.sellerStatus = 'pending';
        if (v.agentStatus === 'accepted' && (v.sellerStatus === 'accepted' || !v.sellerStatus)) v.status = 'accepted';
        else v.status = 'pending';
        localStorage.setItem('siteVisits', JSON.stringify(visits));
        renderAgentVisits();
    }

    const modal = document.getElementById('reschedule-modal');
    if (modal) modal.style.display = 'none';
    if (window.showToast) window.showToast('🗓️ Visit rescheduled to ' + dateStr + ' ' + timeStr);
};

// Override legacy functions to use our dynamic ones
window.acceptVisit = window.acceptAgentVisit;
window.declineVisit = window.declineAgentVisit;

// Ensure the functions load on startup
function renderAgentBuyerRequests() {
    const list = document.getElementById('agent-buyer-requests-list');
    if (!list) return;

    let reqs = JSON.parse(localStorage.getItem('buyerRequests')) || [];

    if (reqs.length === 0) {
        list.innerHTML = '<p style="color:#9ca3af;padding:1rem;">No new buyer requests at the moment. When buyers contact you, they will appear here.</p>';
        return;
    }

    list.innerHTML = reqs.map(r => {
        const isNew = r.status === 'new';
        const init = r.buyerName ? r.buyerName.substring(0, 2).toUpperCase() : 'GU';

        let badgeHtml = isNew ? `<span id="breq-badge-${r.id}" style="background:rgba(249,115,22,0.12);color:#f97316;padding:0.35rem 0.9rem;border-radius:0.5rem;font-size:0.75rem;font-weight:600;white-space:nowrap;">⏳ New Request</span>`
            : (r.status === 'accepted' ? `<span id="breq-badge-${r.id}" style="background:rgba(29,185,84,0.12);color:#1DB954;padding:0.35rem 0.9rem;border-radius:0.5rem;font-size:0.75rem;font-weight:600;white-space:nowrap;">✓ Accepted</span>`
                : `<span id="breq-badge-${r.id}" style="background:rgba(239,68,68,0.12);color:#ef4444;padding:0.35rem 0.9rem;border-radius:0.5rem;font-size:0.75rem;font-weight:600;white-space:nowrap;">✕ Declined</span>`);

        let actionsHtml = isNew ? `
            <div id="breq-actions-${r.id}" style="display:flex;gap:0.75rem;flex-wrap:wrap;">
              <button onclick="handleAcceptBuyerReq('${r.id}')" style="background:#1DB954;color:#000;padding:0.5rem 1.25rem;border-radius:0.5rem;border:none;font-weight:700;cursor:pointer;font-size:0.875rem;">✓ Accept Request</button>
              <button onclick="handleDeclineBuyerReq('${r.id}')" style="background:none;color:#ef4444;padding:0.5rem 1.25rem;border-radius:0.5rem;border:1px solid rgba(239,68,68,0.3);font-weight:600;cursor:pointer;font-size:0.875rem;">✕ Decline</button>
            </div>` : `
            <div id="breq-actions-${r.id}">
              <span style="color:${r.status === 'accepted' ? '#1DB954' : '#ef4444'};font-size:0.875rem;font-weight:600;">${r.status === 'accepted' ? '✅ Added to Current Buyers.' : '❌ Request Declined.'}</span>
            </div>
            `;

        return `
          <div id="breq-card-${r.id}" style="background:#1a1a1a;border-radius:0.75rem;border:1px solid ${isNew ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.05)'};padding:1.5rem;margin-bottom:1.25rem;">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
              <div style="width:3rem;height:3rem;border-radius:9999px;background:#f97316;display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;flex-shrink:0;">${init}</div>
              <div style="flex:1;">
                <h3 style="font-weight:700;margin-bottom:0.25rem;">${r.buyerName}</h3>
                <p style="color:#9ca3af;font-size:0.8125rem;">📍 ${r.location} &nbsp;•&nbsp; 🏠 ${r.property}</p>
                <p style="color:#9ca3af;font-size:0.8125rem;">Budget: <span style="color:#1DB954;font-weight:600;">${r.budget || 'Negotiable'}</span> &nbsp;•&nbsp; Contact: ${r.phone}</p>
              </div>
              ${badgeHtml}
            </div>
            <p style="color:#9ca3af;font-size:0.8125rem;margin-bottom:1rem;line-height:1.6;">${r.note || 'No additional notes provided.'}</p>
            ${actionsHtml}
          </div>
        `;
    }).reverse().join('');
}

window.handleAcceptBuyerReq = function (id) {
    let reqs = JSON.parse(localStorage.getItem('buyerRequests')) || [];
    let r = reqs.find(x => String(x.id) === String(id));
    if (r) {
        r.status = 'accepted';
        localStorage.setItem('buyerRequests', JSON.stringify(reqs));

        if (typeof acceptBuyerReq === 'function' && window.buyerRequestData) {
            window.buyerRequestData[id] = {
                initials: r.buyerName ? r.buyerName.substring(0, 2).toUpperCase() : 'GU',
                avatarBg: '#f97316', avatarColor: '#000', name: r.buyerName,
                property: r.property,
                statusLabel: 'New Buyer', statusColor: '#3b82f6', statusBg: 'rgba(59,130,246,0.12)',
                phone: r.phone, email: r.email, area: r.location, budget: r.budget, note: r.note
            };
            acceptBuyerReq(id, r.buyerName);
        }
    }
    renderAgentBuyerRequests();
}

window.handleDeclineBuyerReq = function (id) {
    let reqs = JSON.parse(localStorage.getItem('buyerRequests')) || [];
    let r = reqs.find(x => String(x.id) === String(id));
    if (r) {
        r.status = 'declined';
        localStorage.setItem('buyerRequests', JSON.stringify(reqs));
    }
    renderAgentBuyerRequests();
}

window.addEventListener('DOMContentLoaded', () => {
    setupAgentTabPersistence();
    loadAgentTab();
    if (typeof renderAgentBuyerRequests === 'function') renderAgentBuyerRequests();
    loadAgentProfile();

    // Initialize dynamic purchase tracking
    setTimeout(() => {
        renderAgentPurchaseTracking();
    }, 50);

    renderAgentVisits();
});
