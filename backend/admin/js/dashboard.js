let statsChart = null;
let statusChart = null;

function renderDashboard() {
    // Ensure data arrays exist
    const leads = leadsData || [];
    const projects = projectsData || [];
    const properties = propertiesData || [];
    const areas = areasData || [];
    
    if (!leads.length && !projects.length && !properties.length) {
        pageContent.innerHTML = '<div class="loading">Loading dashboard...</div>';
        setTimeout(() => renderDashboard(), 500);
        return;
    }
    
    // Hide quick add button on dashboard (as per original)
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.style.display = 'none';
    
    // --- Original calculations (unchanged) ---
    const totalLeads = leads.length;
    const activeProjects = projects.filter(p => p.liveStatus === 'active').length;
    const activeProperties = properties.filter(p => p.liveStatus === 'active').length;
    const totalAreas = areas.length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const hotLeads = leads.filter(l => new Date(l.createdAt) > weekAgo).length;
    
    // Lead score distribution
    let high = 0, medium = 0, low = 0;
    leads.forEach(l => {
        let budget = (l.requirementDetails?.budget || '').toString();
        if (budget.includes('Cr') || budget.includes('crore')) high++;
        else if (budget.includes('L') || budget.includes('lakh')) medium++;
        else low++;
    });
    if (high + medium + low === 0) { high = 3; medium = 2; low = 1; }
    
    const newCount = leads.filter(l => l.status === 'new').length;
    const contactedCount = leads.filter(l => l.status === 'contacted').length;
    const closedCount = leads.filter(l => l.status === 'closed').length;
    
    // Recent leads (last 5)
    const recent = [...leads].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
    
    // Projects with progress (mock – uses real project names)
    const projectsWithProgress = projects.slice(0, 4).map(p => ({
        name: p.name,
        progress: Math.floor(Math.random() * 100) // replace with real if you have a field
    }));
    
    // Mock notifications (can be replaced with real data from backend)
    const mockNotifications = [
        { icon: 'fa-user-plus', text: 'New lead created', time: 'Just now' },
        { icon: 'fa-building', text: 'Project status updated', time: '1 hour ago' },
        { icon: 'fa-home', text: 'New property listed', time: '3 hours ago' },
        { icon: 'fa-bell', text: 'System notification', time: 'Yesterday' }
    ];
    
    // --- Premium UI HTML (keeps all original charts/stats) ---
    let html = `
        <!-- Stats Cards -->
        <div class="dashboard-stats">
            <div class="stat-card clickable" data-nav="leads">
                <div class="stat-info">
                    <h4>Total Leads</h4>
                    <div class="stat-number">${totalLeads}</div>
                    <div class="stat-trend positive"><i class="fas fa-arrow-up"></i> +8%</div>
                </div>
                <div class="stat-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="stat-card clickable" data-nav="projects">
                <div class="stat-info">
                    <h4>Active Projects</h4>
                    <div class="stat-number">${activeProjects}</div>
                    <div class="stat-trend positive"><i class="fas fa-arrow-up"></i> +5%</div>
                </div>
                <div class="stat-icon"><i class="fas fa-building"></i></div>
            </div>
            <div class="stat-card clickable" data-nav="properties">
                <div class="stat-info">
                    <h4>Properties</h4>
                    <div class="stat-number">${activeProperties}</div>
                    <div class="stat-trend negative"><i class="fas fa-arrow-down"></i> -2%</div>
                </div>
                <div class="stat-icon"><i class="fas fa-home"></i></div>
            </div>
            <div class="stat-card clickable" data-nav="areas">
                <div class="stat-info">
                    <h4>Areas Covered</h4>
                    <div class="stat-number">${totalAreas}</div>
                    <div class="stat-trend positive"><i class="fas fa-arrow-up"></i> +3</div>
                </div>
                <div class="stat-icon"><i class="fas fa-map-marker-alt"></i></div>
            </div>
            <div class="stat-card clickable" data-nav="leads">
                <div class="stat-info">
                    <h4>Hot Leads (7d)</h4>
                    <div class="stat-number">${hotLeads}</div>
                    <div class="stat-trend positive"><i class="fas fa-fire"></i> Active</div>
                </div>
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            </div>
        </div>
        
        <!-- Charts Row (Original pie & bar) -->
        <div class="charts-row">
            <div class="chart-card">
                <h3>Lead Intent Distribution</h3>
                <div class="chart-container"><canvas id="scoreChart"></canvas></div>
            </div>
            <div class="chart-card">
                <h3>Lead Status</h3>
                <div class="chart-container"><canvas id="statusChart"></canvas></div>
            </div>
        </div>
        
        <!-- Recent Activity & Progress -->
        <div class="recent-grid">
            <div class="recent-card">
                <h3>Recent Leads</h3>
                ${recent.map(lead => `
                    <div class="lead-item">
                        <div class="lead-avatar">${(lead.name?.charAt(0) || 'U').toUpperCase()}</div>
                        <div class="lead-details">
                            <div class="lead-name">${escapeHtml(lead.name || 'Unknown')}</div>
                            <div class="lead-meta">${escapeHtml(lead.requirementDetails?.budget || 'No budget')} • ${escapeHtml(lead.requirementDetails?.location || 'Any')}</div>
                        </div>
                        <div class="lead-time"><span class="status-dot"></span> ${new Date(lead.createdAt).toLocaleDateString()}</div>
                    </div>
                `).join('')}
                ${recent.length === 0 ? '<div class="lead-item">No leads yet</div>' : ''}
            </div>
            
            <div class="recent-card">
                <h3>Projects Progress</h3>
                ${projectsWithProgress.map(p => `
                    <div class="project-item">
                        <div class="project-name">${escapeHtml(p.name)}</div>
                        <div class="project-progress"><div class="progress-bar" style="width:${p.progress}%"></div></div>
                        <div class="progress-percent">${p.progress}% complete</div>
                    </div>
                `).join('')}
                ${projectsWithProgress.length === 0 ? '<div class="project-item">No projects yet</div>' : ''}
            </div>
            
            <div class="recent-card">
                <h3>Notifications</h3>
                ${mockNotifications.map(n => `
                    <div class="notification-item">
                        <div class="notification-icon"><i class="fas ${n.icon}"></i></div>
                        <div class="notification-text">${escapeHtml(n.text)}</div>
                        <div class="notification-time">${n.time}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    pageContent.innerHTML = html;
    
    // --- Draw original charts (preserved logic) ---
    const ctx1 = document.getElementById('scoreChart')?.getContext('2d');
    const ctx2 = document.getElementById('statusChart')?.getContext('2d');
    if (ctx1) {
        if (statsChart) statsChart.destroy();
        statsChart = new Chart(ctx1, {
            type: 'pie',
            data: {
                labels: ['High Intent', 'Medium Intent', 'Low Intent'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: ['#C6A43F', '#4A90E2', '#A0AEC0']
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    if (ctx2) {
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['New', 'Contacted', 'Closed'],
                datasets: [{
                    label: 'Leads',
                    data: [newCount, contactedCount, closedCount],
                    backgroundColor: '#C6A43F',
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // --- Attach click handlers for stat cards (original navigation) ---
    document.querySelectorAll('.stat-card.clickable').forEach(card => {
        card.addEventListener('click', () => {
            const navPage = card.dataset.nav;
            if (navPage && typeof window.loadPage === 'function') window.loadPage(navPage);
            else if (navPage && typeof loadPage === 'function') loadPage(navPage);
            else {
                const link = document.querySelector(`.nav-link[data-page="${navPage}"]`);
                if (link) link.click();
            }
        });
    });
}

// Expose globally
if (typeof window.loadPage === 'undefined' && typeof loadPage !== 'undefined') {
    window.loadPage = loadPage;
}