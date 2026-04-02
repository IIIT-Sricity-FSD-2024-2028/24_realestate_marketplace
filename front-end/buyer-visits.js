// buyer-visits.js
// Handles Site Visits CRUD for Buyer Dashboard

function confirmScheduleVisit() {
    // Gather selected slot & day
    let slotTime = '10:00 AM';
    document.querySelectorAll('.sv-slot').forEach(btn => {
        const cssText = btn.style.cssText.toLowerCase();
        if (cssText.includes('1db954') || cssText.includes('rgb(29, 185, 84)')) {
            slotTime = btn.textContent.trim();
        }
    });
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const yr = svCurrentDate.getFullYear();
    const mo = svCurrentDate.getMonth();
    const day = svSelectedDay || new Date().getDate();
    const dateStr = day + ' ' + months[mo] + ' ' + yr;

    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];

    if (svIsReschedule && svRescheduleCard) {
        // UPDATE the existing card's date/time line
        const visitId = svRescheduleCard.dataset.visitId || svRescheduleCard.getAttribute('data-visit-id');
        if (visitId) {
            let v = siteVisits.find(x => x.id === visitId);
            if (v) {
                v.dateStr = dateStr;
                v.slotTime = slotTime;
                v.status = 'pending';
                v.sellerStatus = 'pending';
                v.agentStatus = 'pending';
            }
        } else {
            // Fallback for hardcoded mock HTML elements rescheduling (no ID)
            const title = svRescheduleCard.querySelector('h4') ? svRescheduleCard.querySelector('h4').textContent : '';
            let v = siteVisits.find(x => x.propertyName === title && x.status !== 'cancelled' && x.status !== 'rejected');
            if (v) {
                v.dateStr = dateStr;
                v.slotTime = slotTime;
                v.status = 'pending';
                v.sellerStatus = 'pending';
                v.agentStatus = 'pending';
            } else {
                // If it wasn't in localStorage at all, create it!
                siteVisits.push({
                    id: 'V' + Date.now(), propertyId: typeof currentPropertyId !== 'undefined' ? currentPropertyId : 'PROP-X', propertyName: title,
                    buyer: 'James Morgan', seller: 'Seller User', dateStr: dateStr, slotTime: slotTime, status: 'pending', sellerStatus: 'pending', agentStatus: 'pending'
                });
            }
        }
        localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
        closeScheduleVisit();
        showToast('📅 Visit rescheduled for ' + dateStr + ' at ' + slotTime + '!');
        renderBuyerVisits();
    } else {
        // NEW visit
        const newV = {
            id: 'V' + Date.now(),
            propertyId: typeof currentPropertyId !== 'undefined' ? currentPropertyId : 'PROP-X',
            propertyName: svCurrentProperty,
            buyer: 'James Morgan',
            seller: 'Seller User',
            dateStr: dateStr,
            slotTime: slotTime,
            status: 'pending',
            sellerStatus: 'pending',
            agentStatus: 'pending'
        };
        siteVisits.push(newV);
        localStorage.setItem('siteVisits', JSON.stringify(siteVisits));

        closeScheduleVisit();
        showToast('📅 Visit request sent for ' + svCurrentProperty + '!');
        renderBuyerVisits();

        setTimeout(() => {
            const link = document.querySelector('[onclick*="visit-status"]');
            if (link) link.click();
        }, 800);
    }
}

function renderBuyerVisits() {
    let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
    const upcomingContainer = document.getElementById('visit-tab-upcoming')?.querySelector('.card') || document.getElementById('buyer-visits-container');
    const completedContainer = document.getElementById('visit-tab-completed')?.querySelector('.card');
    const failedContainer = document.getElementById('visit-tab-failed')?.querySelector('.card');

    if (!upcomingContainer || !completedContainer || !failedContainer) return;

    let upcomingHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;
    let completedHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;
    let failedHTML = `<h3 style="padding:1.25rem 1.5rem;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.05);">Visits</h3>`;

    let hasUpcoming = false, hasCompleted = false, hasFailed = false;

    siteVisits.forEach(v => {
        // Assume all visits are for the current buyer 'James Morgan' to simplify mock logic
        const initials = (v.propertyName || 'P').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        let badgeClass = "", badgeText = "", buttons = "";

        if (['upcoming', 'pending', 'accepted', 'rescheduled'].includes(v.status)) {
            hasUpcoming = true;
            badgeClass = v.status === 'accepted' ? "badge-green" : "badge-yellow";
            badgeText = v.status === 'accepted' ? "● Confirmed" : (v.status === 'rescheduled' ? "● Rescheduled" : "● Pending");
            buttons = `<button class="btn-outline" onclick="openReschedule('${v.propertyName.replace(/'/g, "\\'")}', this)">Reschedule</button>
                       <button class="btn-danger" onclick="rejectVisit(this, '${v.id}')">Cancel</button>`;
        } else if (v.status === 'completed') {
            hasCompleted = true;
            badgeClass = "badge-green";
            badgeText = "● Completed";
        } else if (v.status === 'cancelled' || v.status === 'rejected') {
            hasFailed = true;
            badgeClass = "badge-red";
            badgeText = v.status === 'cancelled' ? "● Cancelled" : "● Rejected";
        }

        const cardHTML = `
            <div class="visit-card" data-visit-id="${v.id}">
                <div style="display:flex;align-items:center;gap:1rem;">
                    <div class="avatar" style="background:#1DB954;color:#000;">${initials}</div>
                    <div>
                        <h4 style="font-weight:600;">${v.propertyName}</h4>
                        <div style="font-size:0.75rem; display:flex; gap:1rem; margin-top:0.25rem;">
                            <span>Seller: <span style="color:${(v.sellerStatus || 'pending') === 'accepted' ? '#1DB954' : ((v.sellerStatus || 'pending') === 'rejected' ? '#ef4444' : '#f97316')}">${(v.sellerStatus || 'pending').toUpperCase()}</span></span>
                            <span>Agent: <span style="color:${(v.agentStatus || 'pending') === 'accepted' ? '#1DB954' : ((v.agentStatus || 'pending') === 'rejected' ? '#ef4444' : '#f97316')}">${(v.agentStatus || 'pending').toUpperCase()}</span></span>
                        </div>
                        <p class="visit-time-text" style="color:#9ca3af;font-size:0.75rem;margin-top:0.5rem;">📅 ${v.dateStr} &nbsp; 🕐 ${v.slotTime}</p>
                    </div>
                </div>
                <div style="display:flex;gap:0.5rem;align-items:center;">
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                    ${buttons}
                </div>
            </div>`;

        if (['upcoming', 'pending', 'accepted', 'rescheduled'].includes(v.status)) upcomingHTML += cardHTML;
        else if (v.status === 'completed') completedHTML += cardHTML;
        else if (['cancelled', 'rejected'].includes(v.status)) failedHTML += cardHTML;
    });

    if (!hasUpcoming) upcomingHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No upcoming visits scheduled.</p>`;
    if (!hasCompleted) completedHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No completed visits.</p>`;
    if (!hasFailed) failedHTML += `<p style="padding:1.5rem;color:#9ca3af;font-size:0.875rem;">No failed/cancelled visits.</p>`;

    upcomingContainer.innerHTML = upcomingHTML;
    completedContainer.innerHTML = completedHTML;
    failedContainer.innerHTML = failedHTML;
}

function rejectVisit(btn, id) {
    if (id) {
        let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
        let v = siteVisits.find(x => x.id === id);
        if (v) v.status = 'cancelled';
        localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
        renderBuyerVisits();
        showToast('Visit cancelled successfully!');
    } else {
        const card = btn.closest('.visit-card');
        if (!card) return;

        // Find existing localStorage visit matching the name just in case
        const title = card.querySelector('h4') ? card.querySelector('h4').textContent : '';
        let siteVisits = JSON.parse(localStorage.getItem('siteVisits')) || [];
        let v = siteVisits.find(x => x.propertyName === title && x.status !== 'cancelled' && x.status !== 'rejected');
        if (v) {
            v.status = 'cancelled';
            localStorage.setItem('siteVisits', JSON.stringify(siteVisits));
            renderBuyerVisits();
            showToast('Visit cancelled successfully!');
            return;
        }

        const clone = card.cloneNode(true);
        const btns = clone.querySelectorAll('.btn-outline, .btn-danger');
        btns.forEach(b => b.remove());
        const badge = clone.querySelector('.status-badge');
        if (badge) { badge.className = 'status-badge badge-red'; badge.textContent = '● Cancelled'; }
        const failedContainer = document.getElementById('visit-tab-failed')?.querySelector('.card') || document.getElementById('buyer-failed-container');
        if (failedContainer) failedContainer.appendChild(clone);
        card.style.animation = 'cardOut 0.3s ease forwards';
        setTimeout(() => card.remove(), 300);
        showToast('Visit cancelled');
    }
}

// Ensure properties render when document loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderBuyerVisits, 100);
});


