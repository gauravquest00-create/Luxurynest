// ==================== GLOBAL VARIABLES ====================
let leadsData = [], projectsData = [], propertiesData = [], areasData = [];
let currentPage = 'dashboard';
let isUpdatingHash = false;

// ==================== DOM ELEMENTS ====================
const pageContent = document.getElementById('pageContent');
const dynamicSearch = document.getElementById('dynamicSearch');
const adminNameSpan = document.getElementById('adminName');
const quickAddBtn = document.getElementById('quickAddBtn');


// ==================== MOBILE SIDEBAR TOGGLE (Hamburger Menu) ====================
function setupSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    let overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar) return;
    
    // Create overlay if not exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Expose globally for other functions (e.g., navigation close)
    window.closeSidebar = closeSidebar;
    
    // Hamburger button click
    if (menuToggle) {
        // Remove previous listener if any
        if (menuToggle._toggleHandler) menuToggle.removeEventListener('click', menuToggle._toggleHandler);
        const handler = (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        };
        menuToggle._toggleHandler = handler;
        menuToggle.addEventListener('click', handler);
    }
    
    // Overlay click closes sidebar
    overlay.addEventListener('click', closeSidebar);
    
    // On window resize, if screen becomes desktop and sidebar is open, close it
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}
// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initApp);
async function initApp() {
    console.log('Initializing app...');
    if (adminNameSpan) adminNameSpan.innerText = 'Admin';
    await fetchAllData();
    setupSidebarNavigation();
    setupSidebarToggle();      // must be defined
    attachProfileClick();
    attachGlobalQuickAdd();
    attachLogoutListener();
    setupSidebarCollapse();    // after toggle (no conflict)
    if (window.location.hash && window.location.hash !== '#') {
        loadPageFromHash();
    } else {
        loadPage('dashboard');
    }
}
// ==================== FETCH DATA ====================
async function fetchAllData() {
    try {
        console.log('Fetching data...');
        const [leadsRes, projectsRes, propertiesRes] = await Promise.all([
            fetch('/api/leads', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/admin/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/admin/properties', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (leadsRes.ok) leadsData = await leadsRes.json();
        if (projectsRes.ok) projectsData = await projectsRes.json();
        if (propertiesRes.ok) propertiesData = await propertiesRes.json();
        const areasRes = await fetch('/api/areas');
        if (areasRes.ok) areasData = await areasRes.json();
        console.log('Data loaded:', { leads: leadsData.length, projects: projectsData.length, properties: propertiesData.length });
    } catch(e) {
        console.error('Fetch error:', e);
        if (window.showToast) window.showToast('Error loading data', true);
        else alert('Error loading data');
    }
}

// ==================== SIDEBAR NAVIGATION ====================
function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found nav links:', navLinks.length);
    navLinks.forEach(link => {
        if (link._listener) link.removeEventListener('click', link._listener);
        const handler = (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            console.log('Navigating to:', page);
            
            // Safely call loadPage (either local or global)
            if (typeof loadPage === 'function') {
                loadPage(page);
            } else if (typeof window.loadPage === 'function') {
                window.loadPage(page);
            } else {
                console.error('loadPage function not defined');
                return;
            }
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile sidebar if open and closeSidebar exists
            if (window.innerWidth <= 768 && typeof window.closeSidebar === 'function') {
                window.closeSidebar();
            }
        };
        link._listener = handler;
        link.addEventListener('click', handler);
    });
}

// ==================== CORE PAGE LOADER (with hash support) ====================
function loadPage(page, updateHash = true) {
    currentPage = page;
    if (dynamicSearch) dynamicSearch.innerHTML = '';
    console.log('Loading page:', page);
    
    // Update Quick Add button text
    if (quickAddBtn) {
        if (page === 'leads') quickAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add Lead';
        else if (page === 'projects') quickAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add Project';
        else if (page === 'properties') quickAddBtn.innerHTML = '<i class="fas fa-plus"></i> Add Property';
        else quickAddBtn.innerHTML = '<i class="fas fa-plus"></i> Quick Add';
    }
    
    // Update URL hash
    if (updateHash && !isUpdatingHash && window.location.hash !== `#${page}`) {
        window.location.hash = page;
    }
    
    // Call render functions
    if (page === 'dashboard' && typeof window.renderDashboard === 'function') window.renderDashboard();
    else if (page === 'leads' && typeof window.renderLeadsPage === 'function') window.renderLeadsPage();
    else if (page === 'projects' && typeof window.renderProjectsPage === 'function') window.renderProjectsPage();
    else if (page === 'properties' && typeof window.renderPropertiesPage === 'function') window.renderPropertiesPage();
    else if (page === 'areas' && typeof window.renderAreasPage === 'function') window.renderAreasPage();
    else if (page === 'notifications' && typeof window.renderNotificationsPage === 'function') window.renderNotificationsPage();
    else if (page === 'profile' && typeof window.renderProfilePage === 'function') window.renderProfilePage();
    else {
        console.error(`Render function for page "${page}" not defined`);
        if (pageContent) pageContent.innerHTML = `<div class="error">Page not found: ${page}</div>`;
    }
}

// ==================== HASH NAVIGATION ====================
function loadPageFromHash() {
    let hash = window.location.hash.slice(1);
    if (!hash || hash === '') hash = 'dashboard';
    const pageMap = {
        'dashboard': 'dashboard',
        'leads': 'leads',
        'projects': 'projects',
        'properties': 'properties',
        'areas': 'areas',
        'notifications': 'notifications',
        'profile': 'profile'
    };
    const page = pageMap[hash] || 'dashboard';
    loadPage(page, false);
}

window.addEventListener('hashchange', () => {
    isUpdatingHash = true;
    loadPageFromHash();
    isUpdatingHash = false;
});

// ==================== QUICK ADD (CONTEXT-AWARE) ====================
function attachGlobalQuickAdd() {
    if (!quickAddBtn) return;
    if (quickAddBtn._handler) quickAddBtn.removeEventListener('click', quickAddBtn._handler);
    const handler = () => {
        if (currentPage === 'leads') {
            if (typeof openAddModal === 'function') openAddModal('lead');
            else console.error('openAddModal not defined');
        } else if (currentPage === 'projects') {
            if (typeof openAddModal === 'function') openAddModal('project');
            else console.error('openAddModal not defined');
        } else if (currentPage === 'properties') {
            if (typeof openAddModal === 'function') openAddModal('property');
            else console.error('openAddModal not defined');
        } 
        // else {
        //     if (typeof openAddModal === 'function') openAddModal('lead');
        //     else console.error('openAddModal not defined');
        // }
    };
    quickAddBtn._handler = handler;
    quickAddBtn.addEventListener('click', handler);
}

// ==================== PROFILE CLICK ====================
function attachProfileClick() {
    const adminProfile = document.querySelector('.admin-profile');
    if (!adminProfile) return;
    if (adminProfile._clickHandler) adminProfile.removeEventListener('click', adminProfile._clickHandler);
    const handler = (e) => {
        e.preventDefault();
        const profileLink = document.querySelector('.nav-link[data-page="profile"]');
        if (profileLink) {
            profileLink.click();
        } else {
            loadPage('profile');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const fallbackLink = document.querySelector('.nav-link[data-page="profile"]');
            if (fallbackLink) fallbackLink.classList.add('active');
        }
    };
    adminProfile._clickHandler = handler;
    adminProfile.addEventListener('click', handler);
}

// ==================== LOGOUT (FIXED) ====================
function attachLogoutListener() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            sessionStorage.clear();
            window.location.href = '/luxuryadmin/login.html';
        });
    }
}

// ==================== SIDEBAR COLLAPSE (Desktop) ====================
// ==================== SIDEBAR COLLAPSE (Desktop) ====================
// ==================== SIDEBAR COLLAPSE (Desktop only) ====================
function setupSidebarCollapse() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mainContent = document.getElementById('mainContent');
    const icon = collapseBtn?.querySelector('i');
    
    if (!sidebar || !collapseBtn) return;
    
    const isDesktop = () => window.innerWidth > 768;
    
    // Restore saved state
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (savedCollapsed && isDesktop()) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('sidebar-collapsed');
        if (icon) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    }
    
    collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isDesktop()) return;
        
        sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        const nowCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', nowCollapsed);
        
        // Change icon based on state
        if (icon) {
            if (nowCollapsed) {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
            }
        }
    });
    
    window.addEventListener('resize', () => {
        if (isDesktop()) {
            const saved = localStorage.getItem('sidebarCollapsed') === 'true';
            if (saved) {
                sidebar.classList.add('collapsed');
                if (mainContent) mainContent.classList.add('sidebar-collapsed');
                if (icon && !icon.classList.contains('fa-chevron-right')) {
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                }
            } else {
                sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.classList.remove('sidebar-collapsed');
                if (icon && !icon.classList.contains('fa-chevron-left')) {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-chevron-left');
                }
            }
        } else {
            sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('sidebar-collapsed');
            // Ensure icon is left chevron on mobile (even though button may be hidden, but okay)
            if (icon && window.innerWidth <= 768) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
            }
        }
    });
}

// ==================== REFRESH CURRENT PAGE ====================
function refreshCurrentPage() {
    const active = document.querySelector('.nav-link.active');
    if (active) loadPage(active.dataset.page);
}

// Expose global helpers
window.refreshCurrentPage = refreshCurrentPage;
window.closeSidebar = window.closeSidebar || function() {};
window.loadPage = loadPage;