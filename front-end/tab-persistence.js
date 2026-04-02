// tab-persistence.js
// Overrides the default switchPage to support localStorage persistence without flickering on reload

window.switchPage = function (event, pageName, isInitialLoad = false) {
    if (event) event.preventDefault();

    // Remove active state from all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'none'; // reset
    });

    // Remove active state from all nav items
    document.querySelectorAll('.nav-item, .dropdown-item, .sidebar a').forEach(item => {
        item.classList.remove('active');
        const ind = item.querySelector('.nav-indicator');
        if (ind) ind.remove();
    });

    // Activate target page
    const target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.add('active');
        if (!isInitialLoad) {
            target.style.animation = 'fadeIn 0.3s ease';
        }
    }

    // Highlight correct nav item
    let clicked;
    if (event && event.currentTarget) {
        clicked = event.currentTarget;
    } else {
        // Find the element with data-page corresponding to the target pageName
        clicked = document.querySelector(`[data-page="${pageName}"]`);
    }

    if (clicked) {
        clicked.classList.add('active');
        // Only add nav-indicator if it is a main nav item or sidebar link
        if (clicked.classList.contains('nav-item') || clicked.closest('.nav')) {
            const ind = document.createElement('div');
            ind.className = 'nav-indicator';
            clicked.appendChild(ind);
        }

        // If it's a dropdown item, make sure parent is open
        const dropdownContent = clicked.closest('.dropdown-content');
        if (dropdownContent && !dropdownContent.classList.contains('open')) {
            dropdownContent.classList.add('open');
            // update icon if exists
            const btnId = dropdownContent.id;
            const icon = document.getElementById(btnId + '-icon');
            if (icon) icon.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
        }
    }

    // Save to localStorage
    const dbName = window.location.pathname.split('/').pop().split('.')[0] || 'dashboard';
    if (pageName) {
        localStorage.setItem('activeTab_' + dbName, pageName);
    }
};

// Immediately restore on parse (no DOMContentLoaded wait, prevents flicker)
(function () {
    const dbName = window.location.pathname.split('/').pop().split('.')[0] || 'dashboard';
    const savedTab = localStorage.getItem('activeTab_' + dbName);
    if (savedTab) {
        window.switchPage(null, savedTab, true);
    }
})();
