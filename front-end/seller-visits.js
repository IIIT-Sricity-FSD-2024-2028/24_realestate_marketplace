// seller-visits.js
// Handles Site Visits CRUD for Seller Dashboard

function renderSellerVisits() {
    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    if (siteVisits.length === 0) {
        siteVisits = [
            { id: "mock-v1", propertyName: "Luxury 3BHK Apartment", buyer: "Amit Patel", dateStr: "March 10, 2026", slotTime: "10:00 AM", status: "pending" },
            { id: "mock-v2", propertyName: "Beach House Villa", buyer: "Smith Mishra", dateStr: "Nov 15, 2025", slotTime: "2:00 PM", status: "upcoming" },
            { id: "mock-v3", propertyName: "Penthouse Suite", buyer: "Rahul Kumar", dateStr: "Nov 20, 2025", slotTime: "4:00 PM", status: "upcoming" }
        ];
    }

    // There are three main container areas in seller dashboard:
    // 1. Visit Requests (Pending)
    // 2. Scheduled Visits (Upcoming)
    // 3. Completed Visits
    // 4. Failed/Rejected Visits

    const requestsContainer = document.getElementById('visit-requests-list');
    const upcomingContainer = document.getElementById('scheduled-visits-container');
    const completedContainer = document.getElementById('visit-tab-completed')?.querySelector('.card');
    const failedContainer = document.getElementById('failed-visits-container');

    if (!requestsContainer || !upcomingContainer || !completedContainer || !failedContainer) return;

    let requestsHTML = ``;
    let upcomingHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;
    let completedHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;
    let failedHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;

    let hasRequests = false, hasUpcoming = false, hasCompleted = false, hasFailed = false;

    siteVisits.forEach(v => {
        const initials = (v.propertyName || 'P').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

        if (v.status === 'pending') {
            hasRequests = true;
            requestsHTML += `
                <div class="card visit-request-card" data-visit-id="${v.id}">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1.5rem;">
                        <div style="flex:1;min-width:300px;">
                            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.25rem;">
                                <div class="avatar" style="background:#1DB954;color:#000;">${v.buyer.charAt(0)}</div>
                                <div>
                                    <h3 style="font-size:1.125rem;font-weight:700;">${v.buyer}</h3>
                                    <p style="color:#9ca3af;font-size:0.875rem;">Buyer ID: #BYR-LOC</p>
                                </div>
                            </div>
                            <div style="background:#121212;border-radius:0.75rem;padding:1.25rem;border:1px solid rgba(255,255,255,0.05);">
                                <h4 style="font-weight:600;margin-bottom:0.75rem;">Interested Property</h4>
                                <div style="display:flex;gap:0.75rem;">
                                    <div style="width:4rem;height:4rem;background:#282828;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🏠</div>
                                    <div>
                                        <div style="font-weight:600;">${v.propertyName}</div>
                                        <p style="color:#9ca3af;font-size:0.875rem;margin-top:0.25rem;">📍 Location</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="flex:1;min-width:300px;">
                            <div style="background:#121212;border-radius:0.75rem;padding:1.25rem;border:1px solid rgba(255,255,255,0.05);height:100%;">
                                <h4 style="font-weight:600;margin-bottom:1rem;">Requested Schedule</h4>
                                <div style="display:flex;gap:1rem;margin-bottom:1.5rem;">
                                    <div style="flex:1;background:#1a1a1a;padding:1rem;border-radius:0.5rem;text-align:center;border:1px solid #1DB95440;">
                                        <div style="color:#9ca3af;font-size:0.75rem;margin-bottom:0.25rem;">Date</div>
                                        <div style="font-weight:600;color:#1DB954;">${v.dateStr}</div>
                                    </div>
                                    <div style="flex:1;background:#1a1a1a;padding:1rem;border-radius:0.5rem;text-align:center;border:1px solid #1DB95440;">
                                        <div style="color:#9ca3af;font-size:0.75rem;margin-bottom:0.25rem;">Time</div>
                                        <div style="font-weight:600;color:#1DB954;">${v.slotTime}</div>
                                    </div>
                                </div>
                                <div style="display:flex;gap:0.75rem;">
                                    <button class="btn-primary" style="flex:1;" onclick="confirmVisitDynamic('${v.id}')">✓ Confirm Visit</button>
                                    <button class="btn-danger" style="flex:1;" onclick="declineVisitDynamic('${v.id}')">✕ Decline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            let badgeClass = "", badgeText = "", buttons = "";

            if (v.status === 'upcoming') {
                hasUpcoming = true;
                badgeClass = "badge-green";
                badgeText = "● Confirmed";
                buttons = `<button class="btn-outline" onclick="openReschedule('${v.id}')">Reschedule</button>
                           <button class="btn-danger" onclick="rejectScheduledVisitDynamic('${v.id}')">Reject</button>`;
            } else if (v.status === 'completed') {
                hasCompleted = true;
                badgeClass = "badge-green";
                badgeText = "● Completed";
            } else if (v.status === 'cancelled' || v.status === 'rejected') {
                hasFailed = true;
                badgeClass = "badge-red";
                badgeText = v.status === 'cancelled' ? "● Cancelled by Buyer" : "● Rejected";
            }

            const cardHTML = `
                <div class="visit-card" data-visit-id="${v.id}">
                    <div style="display:flex;align-items:center;gap:1rem;">
                        <div class="avatar" style="background:#1DB954;color:#000;">${initials}</div>
                        <div>
                            <h4 style="font-weight:600;">${v.propertyName} - ${v.buyer}</h4>
                            <p style="color:#9ca3af;font-size:0.875rem;">Property Visit</p>
                            <p class="visit-time-text" style="color:#9ca3af;font-size:0.75rem;margin-top:0.5rem;">📅 ${v.dateStr} &nbsp; 🕐 ${v.slotTime}</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                        ${buttons}
                    </div>
                </div>`;

            if (v.status === 'upcoming') upcomingHTML += cardHTML;
            else if (v.status === 'completed') completedHTML += cardHTML;
            else if (v.status === 'cancelled' || v.status === 'rejected') failedHTML += cardHTML;
        }
    });

    if (!hasRequests) requestsHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No pending site visit requests.</p>`;
    if (!hasUpcoming) upcomingHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No upcoming visits scheduled.</p>`;
    if (!hasCompleted) completedHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No completed visits.</p>`;
    if (!hasFailed) failedHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No failed/cancelled visits.</p>`;

    requestsContainer.innerHTML = requestsHTML;
    upcomingContainer.innerHTML = upcomingHTML;
    completedContainer.innerHTML = completedHTML;
    failedContainer.innerHTML = failedHTML;
}

function confirmVisitDynamic(id) {
    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let p = siteVisits.find(x => x.id === id);
    if (p) p.status = 'upcoming';
    localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
    renderSellerVisits();
    showToast('Visit confirmed and moved to Upcoming!');
}

function declineVisitDynamic(id) {
    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let p = siteVisits.find(x => x.id === id);
    if (p) p.status = 'rejected';
    localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
    renderSellerVisits();
    showToast('Visit request declined.');
}

function rejectScheduledVisitDynamic(id) {
    declineVisitDynamic(id);
}

function markAsCompletedDynamic(id) {
    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    let p = siteVisits.find(x => x.id === id);
    if (p) p.status = 'completed';
    localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
    renderSellerVisits();
    showToast('Visit marked as completed!');
}

window.addEventListener('DOMContentLoaded', () => {
    renderSellerVisits();
});
