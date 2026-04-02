// seller-crud.js
// Handles Negotiate, Payment Tracking, and Profile logic securely for Seller Dashboard

function formatCurrency(amt) {
    if (!amt || isNaN(amt)) return amt;
    if (amt >= 10000000) return '₹' + (amt / 10000000).toFixed(2) + ' Cr';
    if (amt >= 100000) return '₹' + (amt / 100000).toFixed(2) + ' Lac';
    return "₹" + amt.toLocaleString('en-IN');
}

function renderSellerNegotiations(filterType = 'all') {
    const container = document.querySelector('#page-negotiate .content-section');
    if (!container) return;

    // Header & Pills injection
    let html = `
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;">All Negotiations</h2>
        <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap;">
            <button class="pill ${filterType === 'all' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerNegotiations('all')">All</button>
            <button class="pill ${filterType === 'ongoing' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerNegotiations('ongoing')">Ongoing</button>
            <button class="pill ${filterType === 'completed' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerNegotiations('completed')">Completed</button>
            <button class="pill ${filterType === 'rejected' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerNegotiations('rejected')">Rejected</button>
        </div>
        <div id="seller-negotiations-list"></div>
    `;

    // Assign synchronously to erase hardcoded template flashing immediately
    container.innerHTML = html;

    const offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    const listContainer = document.getElementById('seller-negotiations-list');

    // We filter out withdrawn offers, leaving what the seller should see.
    let filtered = offers.filter(o => o.status !== 'withdrawn');
    if (filterType === 'ongoing') filtered = filtered.filter(o => o.status === 'pending');
    if (filterType === 'completed') filtered = filtered.filter(o => o.status === 'accepted');
    if (filterType === 'rejected') filtered = filtered.filter(o => o.status === 'rejected');

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="card" style="text-align:center;padding:3rem;"><p style="color:#9ca3af;">No negotiation offers found for this category.</p></div>';
        return;
    }

    let cardsHTML = '';
    filtered.reverse().forEach(o => {
        let statusBadge = '';
        let statusStr = '';
        let buttonHTML = '';

        let offerFmt = formatCurrency(o.offerAmt);
        let listPriceStr = typeof o.listingPrice !== 'undefined' ? (isNaN(o.listingPrice) ? o.listingPrice : formatCurrency(parseFloat(o.listingPrice))) : (o.priceFmt ? o.priceFmt : 'Listing Price Unknown');

        let customCounterRow = '';
        if (o.counterAmt) {
            customCounterRow = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid rgba(255,255,255,0.05);">
                    <div>
                        <div class="info-label">Your Counter Offer</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#1DB954;">${formatCurrency(o.counterAmt)}</div>
                    </div>
                </div>
             `;
        }

        if (o.status === 'pending') {
            statusBadge = '<span class="status-badge badge-green" style="border:1px solid rgba(29,185,84,0.3);">💬 Ongoing</span>';
            buttonHTML = `
                <button onclick="sellerCounterOffer('${o.id}')" style="padding:0.625rem 1.25rem;border-radius:0.5rem;border:2px solid #1DB954;background:transparent;color:#1DB954;font-weight:600;cursor:pointer;font-size:0.8125rem;">Make Counter Offer</button>
                <button class="btn-primary" onclick="sellerAcceptOffer('${o.id}')">Accept Offer</button>
                <button class="btn-danger" style="margin-left:auto;" onclick="sellerRejectOffer('${o.id}')">Reject Offer</button>
            `;
            statusStr = '💬 In Negotiation';
        } else if (o.status === 'accepted') {
            statusBadge = '<span class="status-badge badge-green" style="border:1px solid rgba(29,185,84,0.3);">✓ Completed</span>';
            statusStr = '✓ Deal Closed';
        } else if (o.status === 'rejected') {
            statusBadge = '<span class="status-badge badge-red" style="border:1px solid rgba(239,68,68,0.3);">✕ Rejected</span>';
            statusStr = '✕ Rejected';
        }

        cardsHTML += `
            <div class="card neg-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                    <div style="display:flex;align-items:center;gap:1rem;">
                        <div style="width:2.75rem;height:2.75rem;border-radius:0.5rem;background:#282828;display:flex;align-items:center;justify-content:center;">
                            <svg style="width:1.5rem;height:1.5rem;" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                        <div>
                            <h3 style="font-weight:600;font-size:1rem;">${o.title}</h3>
                            <p style="color:#9ca3af;font-size:0.875rem;">📍 ${o.area || 'Unknown'}</p>
                            <p style="color:#9ca3af;font-size:0.875rem;">Buyer: <span style="color:#fff;font-weight:500;">Interested Buyer</span></p>
                        </div>
                    </div>
                    ${statusBadge}
                </div>
                <div style="background:#121212;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div class="info-label">Listing Price</div>
                            <div style="font-size:1.25rem;font-weight:700;">${listPriceStr}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="color:${o.status === 'rejected' ? '#ef4444' : (o.status === 'accepted' ? '#1DB954' : '#9ca3af')};font-size:0.75rem;">${statusStr}</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="info-label">${o.status === 'accepted' ? 'Final Price' : "Buyer's Offer"}</div>
                            <div style="font-size:1.25rem;font-weight:700;color:${o.status === 'rejected' ? '#ef4444' : '#1DB954'};">${offerFmt}</div>
                        </div>
                    </div>
                    ${customCounterRow}
                </div>
                ${buttonHTML ? `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">${buttonHTML}</div>` : ''}
            </div>
        `;
    });
    listContainer.innerHTML = cardsHTML;
}

function sellerAcceptOffer(id) {
    let offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    let o = offers.find(x => String(x.id) === String(id));
    if (o) {
        o.status = 'accepted';
        localStorage.setItem('submittedOffers', JSON.stringify(offers));
        renderSellerNegotiations();
        renderSellerTrackPayment(); // Render sync update!

        // Ensure showToast exists on window
        if (window.showToast) window.showToast('Offer accepted! Check Track Payment.');
        else alert('Offer accepted! Check Track Payment.');
    }
}

function sellerRejectOffer(id) {
    let offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    let o = offers.find(x => String(x.id) === String(id));
    if (o) {
        o.status = 'rejected';
        localStorage.setItem('submittedOffers', JSON.stringify(offers));
        renderSellerNegotiations();
        if (window.showToast) window.showToast('Offer rejected.');
        else alert('Offer rejected.');
    }
}

function sellerCounterOffer(id) {
    let offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    let o = offers.find(x => String(x.id) === String(id));
    if (o) {
        let amt = prompt('Enter counter offer amount (numeric values only):');
        if (amt && !isNaN(parseFloat(amt))) {
            o.counterAmt = parseFloat(amt);
            o.status = 'pending';
            localStorage.setItem('submittedOffers', JSON.stringify(offers));
            renderSellerNegotiations();
            if (window.showToast) window.showToast('Counter offer formally recorded!');
            else alert('Counter offer formally recorded!');
        }
    }
}

function renderSellerTrackPayment(filterType = 'all') {
    const container = document.querySelector('#page-track-payment .content-section');
    if (!container) return;

    let offers = JSON.parse(localStorage.getItem('submittedOffers')) || [];
    let txns = [];
    if (offers.length === 0) {
        txns = [
            { id: "TXN-2024-001", prop: "Luxury Villa in Beverly Hills", buyer: "Sarah Johnson", amt: 4500000, date: "2026-03-05", status: "completed" },
            { id: "TXN-2024-002", prop: "Modern Downtown Apartment", buyer: "Michael Chen", amt: 850000, date: "2026-03-08", status: "ongoing" },
            { id: "TXN-2024-003", prop: "Beachfront Condo", buyer: "James Wilson", amt: 1200000, date: "2026-03-01", status: "completed" },
            { id: "TXN-2024-004", prop: "Skyline Penthouse", buyer: "Akshay Jain", amt: 6950000, date: "2026-03-12", status: "processing" },
            { id: "TXN-2024-006", prop: "Garden Villa", buyer: "Meera Nair", amt: 3500000, date: "2026-02-15", status: "rejected" }
        ];
    } else {
        txns = offers.map((o, i) => {
            return {
                id: "TXN-2026-" + (100 + i),
                prop: o.title,
                buyer: "System Buyer",
                amt: o.offerAmt,
                date: o.date,
                status: o.status === 'accepted' ? 'completed' : (o.status === 'pending' ? 'ongoing' : o.status)
            };
        });
    }

    let filtered = txns;
    if (filterType !== 'all') {
        filtered = txns.filter(t => t.status === filterType);
    }

    // Stats calculation based on txns
    let totRcv = txns.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amt || 0), 0);
    let totPen = txns.filter(t => t.status === 'ongoing').reduce((sum, t) => sum + (t.amt || 0), 0);
    let totPro = txns.filter(t => t.status === 'processing').reduce((sum, t) => sum + (t.amt || 0), 0);

    let statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon-box" style="background-color:rgba(29,185,84,0.2);"><svg fill="none" stroke="#1DB954" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                <div class="stat-label">Total Received</div>
                <div class="stat-value">${offers.length === 0 ? '₹7,525,000' : formatCurrency(totRcv)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box" style="background-color:rgba(249,115,22,0.2);"><svg fill="none" stroke="#f97316" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                <div class="stat-label">Pending Payments</div>
                <div class="stat-value">${offers.length === 0 ? '₹850,000' : formatCurrency(totPen)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box" style="background-color:rgba(59,130,246,0.2);"><svg fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
                <div class="stat-label">Processing</div>
                <div class="stat-value">${offers.length === 0 ? '₹625,000' : formatCurrency(totPro)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box" style="background-color:rgba(29,185,84,0.2);"><svg fill="none" stroke="#1DB954" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                <div class="stat-label">This Month</div>
                <div class="stat-value">${offers.length === 0 ? '₹9,000,000' : formatCurrency(totRcv + totPro)}</div>
            </div>
        </div>
    `;

    let pillsHtml = `
        <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap;">
            <button class="pill ${filterType === 'all' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerTrackPayment('all')">All <span class="count">${txns.length}</span></button>
            <button class="pill ${filterType === 'ongoing' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerTrackPayment('ongoing')">Ongoing <span class="count">${txns.filter(t => t.status === 'ongoing').length}</span></button>
            <button class="pill ${filterType === 'completed' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerTrackPayment('completed')">Completed <span class="count">${txns.filter(t => t.status === 'completed').length}</span></button>
            <button class="pill ${filterType === 'rejected' ? 'pill-active' : 'pill-inactive'}" onclick="renderSellerTrackPayment('rejected')">Rejected <span class="count">${txns.filter(t => t.status === 'rejected').length}</span></button>
        </div>
    `;

    let tableRows = filtered.map(t => {
        let sc = "badge-green", st = "● Completed", cc = "#1DB954";
        if (t.status === 'ongoing' || t.status === 'pending') { sc = "badge-orange"; st = "● Pending"; cc = "#1DB954"; }
        if (t.status === 'processing') { sc = "badge-orange"; st = "● Processing"; cc = "#1DB954"; }
        if (t.status === 'rejected') { sc = "badge-red"; st = "● Failed"; cc = "#ef4444"; }

        return `
            <tr>
                <td style="color:#9ca3af;">${t.id}</td>
                <td style="color:#fff;">${t.prop}</td>
                <td style="color:#9ca3af;">${t.buyer}</td>
                <td style="color:${cc};font-weight:600;">${formatCurrency(t.amt)}</td>
                <td style="color:#9ca3af;">${t.date}</td>
                <td><span class="status-badge ${sc}">${st}</span></td>
            </tr>
        `;
    }).join("");

    if (filtered.length === 0) {
        tableRows = '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:2rem;">No payment records found.</td></tr>';
    }

    container.innerHTML = statsHtml + pillsHtml + `
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;">Payment History</h2>
        <div class="card" style="padding:0;overflow:hidden;">
            <table>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Property</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="payments-table">
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

// ====== SELLER SITE VISITS ======
window.switchSellerVisitTab = function (tabName) {
    document.querySelectorAll('.visit-subtab').forEach(btn => {
        btn.style.background = 'transparent';
        btn.style.color = '#9ca3af';
    });
    const activeBtn = document.getElementById('vtab-' + tabName);
    if (activeBtn) {
        activeBtn.style.background = '#1DB954';
        activeBtn.style.color = '#000';
    }
    renderSellerVisits(tabName);
}

function renderSellerVisits(filter = 'upcoming') {
    const container = document.getElementById('seller-visits-container');
    if (!container) return;

    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];

    // Filter logic
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

        // Ensure Seller sees what's going on
        let statusBadge = '';
        let actionStr = '';
        const opStatus = v.sellerStatus || 'pending';

        if (opStatus === 'pending') {
            statusBadge = `
            <div style="background:rgba(249,115,22,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#f97316;"></div>
              <span style="color:#f97316; font-size:0.8rem; font-weight:600;">Pending</span>
            </div>`;
            actionStr = `
            <button onclick="acceptSellerVisit('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Confirm</button>
            <button onclick="openSellerReschedule('${v.id}')" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reschedule</button>
            <button onclick="declineSellerVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'accepted') {
            statusBadge = `
            <div style="background:rgba(29,185,84,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#1DB954;"></div>
              <span style="color:#1DB954; font-size:0.8rem; font-weight:600;">Confirmed by You</span>
            </div>`;
            actionStr = `
            <button onclick="markSellerVisited('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Mark Completed</button>
            <button onclick="openSellerReschedule('${v.id}')" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reschedule</button>
            <button onclick="declineSellerVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'rescheduled') {
            statusBadge = `
            <div style="background:rgba(249,115,22,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#f97316;"></div>
              <span style="color:#f97316; font-size:0.8rem; font-weight:600;">Rescheduled</span>
            </div>`;
            actionStr = `
            <button onclick="acceptSellerVisit('${v.id}')" style="background:#1DB954; border:none; color:#000; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:600; cursor:pointer;">Confirm</button>
            <button onclick="declineSellerVisit('${v.id}')" style="background:transparent; border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:0.55rem 1.25rem; border-radius:0.5rem; font-size:0.8rem; font-weight:500; cursor:pointer;">Reject</button>`;
        } else if (opStatus === 'completed') {
            statusBadge = `
            <div style="background:rgba(29,185,84,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#1DB954;"></div>
              <span style="color:#1DB954; font-size:0.8rem; font-weight:600;">Completed</span>
            </div>`;
            actionStr = '';
        } else {
            // failed, rejected, cancelled
            statusBadge = `
            <div style="background:rgba(239,68,68,0.1); padding:0.4rem 0.8rem; border-radius:2rem; display:flex; align-items:center; gap:0.4rem;">
              <div style="width:6px; height:6px; border-radius:50%; background:#ef4444;"></div>
              <span style="color:#ef4444; font-size:0.8rem; font-weight:600;">${opStatus.charAt(0).toUpperCase() + opStatus.slice(1)}</span>
            </div>`;
            actionStr = '';
        }

        const propTitle = v.propertyName || v.propertyTitle || `Property #${v.propertyId}`;

        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:1.5rem 2rem; border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; align-items:center; gap:1.25rem;">
            <div style="width:3rem; height:3rem; border-radius:50%; background:${color}; color:${color === '#1DB954' ? '#000' : '#fff'}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1rem;">${initials}</div>
            <div>
              <h3 style="color:#fff; font-weight:600; font-size:1.05rem; margin-bottom:0.15rem;">${visitorFullName}</h3>
              <p style="color:#9ca3af; font-size:0.85rem; margin-bottom:0.15rem;">${propTitle}</p>
              <div style="display:flex; align-items:center; gap:0.5rem; color:#6b7280; font-size:0.75rem; margin-top:0.4rem;">
                <span style="display:flex; align-items:center; gap:0.25rem;">📅 ${v.dateStr || v.date}</span>
                <span style="display:flex; align-items:center; gap:0.25rem;">⏰ ${v.slotTime || v.time}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            ${statusBadge}
            ${actionStr}
          </div>
        </div>`;
    });

    container.innerHTML = html;
}

function updateSellerVisitStatus(id, newStatus) {
    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let v = visits.find(o => String(o.id) === String(id));
    if (v) {
        v.sellerStatus = newStatus;
        if (v.sellerStatus === 'rejected' || v.agentStatus === 'rejected') v.status = 'rejected';
        else if (v.sellerStatus === 'accepted' && (v.agentStatus === 'accepted' || !v.agentStatus)) v.status = 'accepted';
        else if (v.sellerStatus === 'completed' || v.agentStatus === 'completed') v.status = 'completed';
        else v.status = 'pending';

        localStorage.setItem('siteVisits', JSON.stringify(visits));
        renderSellerVisits();
    }
}

window.acceptSellerVisit = function (id) {
    updateSellerVisitStatus(id, 'accepted');
    if (window.showToast) window.showToast('✅ Visit Accepted! Buyer and Agent notified.');
};
window.declineSellerVisit = function (id) {
    updateSellerVisitStatus(id, 'rejected');
    if (window.showToast) window.showToast('Visit Declined.');
};
window.markSellerVisited = function (id) {
    updateSellerVisitStatus(id, 'completed');
    if (window.showToast) window.showToast('🏠 Visit marked as completed.');
};

let currentSellerRescheduleId = null;
window.openSellerReschedule = function (id) {
    currentSellerRescheduleId = id;
    const modal = document.getElementById('reschedule-modal');
    if (modal) modal.style.display = 'flex';
};

window.confirmReschedule = function () {
    if (!currentSellerRescheduleId) return;
    const dateStr = document.getElementById('resh-date')?.value;
    const timeStr = document.getElementById('resh-time')?.value;

    let visits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let v = visits.find(o => String(o.id) === String(currentSellerRescheduleId));
    if (v) {
        if (dateStr) { v.date = dateStr; v.dateStr = dateStr; }
        if (timeStr) { v.time = timeStr; v.slotTime = timeStr; }
        v.sellerStatus = 'accepted';
        v.agentStatus = 'pending';
        if (v.sellerStatus === 'accepted' && (v.agentStatus === 'accepted' || !v.agentStatus)) v.status = 'accepted';
        else v.status = 'pending';
        localStorage.setItem('siteVisits', JSON.stringify(visits));
        renderSellerVisits();
    }

    const modal = document.getElementById('reschedule-modal');
    if (modal) modal.style.display = 'none';
    if (window.showToast) window.showToast('🗓️ Visit rescheduled to ' + dateStr + ' ' + timeStr);
};

function saveSellerProfile() {
    const profile = {
        fname: document.getElementById('prof-fname')?.value || '',
        lname: document.getElementById('prof-lname')?.value || '',
        email: document.getElementById('prof-email')?.value || '',
        phone: document.getElementById('prof-phone')?.value || '',
        dob: document.getElementById('prof-dob')?.value || '',
        gender: document.getElementById('prof-gender')?.value || '',
        location: document.getElementById('prof-location')?.value || ''
    };
    localStorage.setItem('sellerProfile', JSON.stringify(profile));

    // ── Sync back to globalUsers so Super Admin sees real email ──
    const fullName = [profile.fname, profile.lname].filter(Boolean).join(' ').trim();
    try {
        let gUsers = JSON.parse(localStorage.getItem('globalUsers')) || [];
        const entry = gUsers.find(u => u.role === 'Seller');
        if (entry) {
            if (fullName)       entry.name  = fullName;
            if (profile.email)  entry.email = profile.email;
            localStorage.setItem('globalUsers', JSON.stringify(gUsers));
        }
    } catch (_) {}

    const initials = (profile.fname.charAt(0) + (profile.lname ? profile.lname.charAt(0) : '')).toUpperCase();
    if (initials) document.querySelectorAll('.user-avatar').forEach(av => av.textContent = initials);

    if (fullName) {
        document.querySelectorAll('.user-name, #prof-display-name').forEach(el => el.textContent = fullName);
    }

    const toastFn = window.showToast || alert;
    toastFn('✅ Seller profile updated successfully!');
}

function loadSellerProfile() {
    const data = localStorage.getItem('sellerProfile');
    if (!data) return;
    const profile = JSON.parse(data);

    const map = {
        'prof-fname': profile.fname,
        'prof-lname': profile.lname,
        'prof-email': profile.email,
        'prof-phone': profile.phone,
        'prof-dob': profile.dob,
        'prof-gender': profile.gender,
        'prof-location': profile.location
    };

    for (const [id, val] of Object.entries(map)) {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
    }

    if (profile.fname) {
        const initials = (profile.fname.charAt(0) + (profile.lname ? profile.lname.charAt(0) : '')).toUpperCase();
        document.querySelectorAll('.user-avatar').forEach(av => av.textContent = initials);
    }

    const fullName = `${profile.fname} ${profile.lname} `.trim();
    if (fullName) {
        document.querySelectorAll('.user-name, #prof-display-name').forEach(el => el.textContent = fullName);
    }
}


window.renderSoldProperties = function () {
    const container = document.getElementById('seller-sold-container');
    if (!container) return;

    let accepted = (JSON.parse(localStorage.getItem('submittedOffers')) || []).filter(o => o.dealStatus === 'completed');
    let mockPurchases = JSON.parse(localStorage.getItem('mockPurchases')) || [];
    let completedMocks = mockPurchases.filter(m => m.dealStatus === 'completed');

    let allSold = [];

    accepted.forEach(o => {
        const offerFmt = '\u20b9' + (o.offerAmt / 100000 >= 100 ? (o.offerAmt / 10000000).toFixed(2) + ' Cr' : (o.offerAmt / 100000).toFixed(0) + ' Lac');
        allSold.push({ propName: o.title || o.propertyName, soldPrice: offerFmt, location: o.area || o.location || 'Unknown', type: o.type || 'Property', img: o.img || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', date: new Date().toLocaleDateString('en-GB') });
    });
    completedMocks.forEach(m => {
        allSold.push({ propName: m.propName, soldPrice: m.agreedPrice, location: m.location || 'Unknown', type: 'Apartment', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', date: new Date().toLocaleDateString('en-GB') });
    });

    if (allSold.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#9ca3af;"><div style="font-size:3rem;margin-bottom:1rem;">🏠</div><h3 style="color:#fff;margin-bottom:0.5rem;">No properties sold yet</h3><p>Your officially completed deals will magically appear right here.</p></div>';
        return;
    }

    container.innerHTML = allSold.map((p, i) => `
        <div class="card" style="padding:0;overflow:hidden;">
            <div style="height:12rem;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                <img src="${p.img}" alt="${p.propName}" style="width:100%;height:100%;object-fit:cover;">
                <span class="status-badge badge-green" style="position:absolute;top:1rem;right:1rem;">✓ SOLD</span>
            </div>
            <div style="padding:1.25rem;">
                <h3 style="font-weight:600;margin-bottom:0.25rem;">${p.propName}</h3>
                <p style="color:#9ca3af;font-size:0.875rem;margin-bottom:0.75rem;">📍 ${p.location}</p>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                    <span style="color:#9ca3af;font-size:0.875rem;">Sold Price:</span>
                    <span style="color:#1DB954;font-weight:600;">${p.soldPrice}</span>
                </div>
                <hr style="border-color:rgba(255,255,255,0.05);margin:0.875rem 0;">
                <p style="color:#9ca3af;font-size:0.875rem;margin-top:0.5rem;">📅 Sold Date: <span style="color:#fff;">${p.date}</span></p>
            </div>
        </div>
    `).join('');
};

window.addEventListener('DOMContentLoaded', () => {
    // Fire all dynamic bindings immediately!
    renderSellerNegotiations();
    renderSellerTrackPayment();
    loadSellerProfile();
    if (typeof renderSellerVisits === 'function') renderSellerVisits('upcoming');
    if (typeof renderSoldProperties === 'function') renderSoldProperties();
});
