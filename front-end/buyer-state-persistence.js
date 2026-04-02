// buyer-state-persistence.js
// Intercepts and overrides the mock array lists to use localStorage to prevent hardcoded respawns.

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize arrays from localStorage or default to the IDs of the hardcoded mock items
    // Under Consideration has ID 5 ("Luxury Villa with Garden") mocked.
    let savedUC = localStorage.getItem('ucList');
    // If it's completely null, it's the first time user loads the app, so we populate it with the mock ID
    // If it's "[]", it means user removed everything, so it maps to empty.
    window.underConsiderationList = savedUC ? JSON.parse(savedUC) : [5];

    // Shortlist has ID 1 and 3 mocked.
    let savedSL = localStorage.getItem('slList');
    window.shortlistList = savedSL ? JSON.parse(savedSL) : [1, 3];

    let savedNeg = localStorage.getItem('negList');
    window.submittedOffers = savedNeg ? JSON.parse(savedNeg) : [
        { id: 'OFR-5501', propertyId: 7, propertyName: 'Eco-Friendly Smart Home', price: 9000000, offerPrice: 8500000, status: 'counter', date: 'Oct 24, 2025' }
    ];

    // 2. Fully Override the modifying functions instead of wrapping them to prevent double-toggling

    window.removeFromConsideration = function (id) {
        window.underConsiderationList = window.underConsiderationList.filter(x => String(x) !== String(id));
        localStorage.setItem('ucList', JSON.stringify(window.underConsiderationList));
        updateUnderConsiderationPage();
        showToast('Removed from Under Consideration');
    };

    window.moveToUnderConsideration = function () {
        if (!currentPropertyId) return;
        const p = currentProperties.find(x => String(x.id) === String(currentPropertyId));
        if (!p) return;

        if (!window.underConsiderationList.some(x => String(x) === String(currentPropertyId))) {
            window.underConsiderationList.push(currentPropertyId);
            localStorage.setItem('ucList', JSON.stringify(window.underConsiderationList));
            updateUnderConsiderationPage();

            const btn = document.getElementById('btn-consideration');
            if (btn) { btn.style.background = '#282828'; btn.style.color = '#1DB954'; btn.innerHTML = '✅ In Consideration'; }
            showToast('✅ ' + p.title + ' added to Under Consideration!');

            try { closeModal(); } catch (e) { }
            setTimeout(() => {
                const link = document.querySelector('[onclick*="under-consideration"]');
                if (link) link.click();
            }, 600);
        } else {
            showToast('Already in Under Consideration');
            setTimeout(() => {
                const link = document.querySelector('[onclick*="under-consideration"]');
                if (link) link.click();
            }, 400);
        }
    };

    window.addToShortlist = function () {
        if (!currentPropertyId) return;
        const p = currentProperties.find(x => String(x.id) === String(currentPropertyId));
        if (!p) return;

        if (!window.shortlistList.some(x => String(x) === String(currentPropertyId))) {
            window.shortlistList.push(currentPropertyId);
            localStorage.setItem('slList', JSON.stringify(window.shortlistList));
            updateShortlistPage();
            showToast('♡ ' + p.title + ' added to Shortlist!');
        } else {
            showToast('Already in Shortlist');
        }
    };

    window.addToShortlistDirect = function (id) {
        const p = typeof currentProperties !== 'undefined' ? currentProperties.find(x => String(x.id) === String(id)) : null;
        if (!p) return;

        if (!window.shortlistList.some(x => String(x) === String(id))) {
            window.shortlistList.push(id);
            localStorage.setItem('slList', JSON.stringify(window.shortlistList));
            updateShortlistPage();
            renderRecommendations(currentProperties);
            showToast('♡ ' + p.title + ' added to Shortlist!');
        } else {
            window.shortlistList = window.shortlistList.filter(x => String(x) !== String(id));
            localStorage.setItem('slList', JSON.stringify(window.shortlistList));
            updateShortlistPage();
            renderRecommendations(currentProperties);
            showToast('Removed from Shortlist');
        }
    };

    // 3. Immediately trigger renders to replace hardcoded HTML with our localStorage-backed state
    // We invoke them synchronously to completely prevent UI flashes on reload
    if (typeof updateUnderConsiderationPage === 'function') updateUnderConsiderationPage();
    if (typeof updateShortlistPage === 'function') updateShortlistPage();
});
