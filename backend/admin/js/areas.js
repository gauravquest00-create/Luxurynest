// ==================== AREAS MANAGEMENT (GRID + TABLE VIEW) ====================

let allAreasData = [];
let currentAreaView = 'grid'; // 'grid' or 'table'

window.renderAreasPage = async function() {
    const container = document.getElementById('pageContent');
    container.innerHTML = '<div class="loading">Loading areas...</div>';
    try {
        const res = await fetch('/api/areas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch areas');
        allAreasData = await res.json();
        
        // Hide quick add button on areas page
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) quickAddBtn.style.display = 'none';
        
        // Render search UI + view toggle
        const searchHtml = `
            <div class="search-section">
                <input type="text" id="areaSearch" placeholder="Search by area name or sector..." class="global-search">
                <div class="areas-view-toggle">
                    <button class="view-toggle-btn ${currentAreaView === 'grid' ? 'active' : ''}" data-view="grid"><i class="fas fa-th"></i> Grid</button>
                    <button class="view-toggle-btn ${currentAreaView === 'table' ? 'active' : ''}" data-view="table"><i class="fas fa-table"></i> Table</button>
                </div>
            </div>
            <div id="areasList"></div>
        `;
        container.innerHTML = `<h2>Areas Management</h2>${searchHtml}`;
        
        // Attach search event
        document.getElementById('areaSearch').addEventListener('input', renderAreasList);
        
        // Attach view toggle event listeners
        document.querySelectorAll('.areas-view-toggle .view-toggle-btn').forEach(btn => {
            btn.removeEventListener('click', handleAreaViewToggle);
            btn.addEventListener('click', handleAreaViewToggle);
        });
        
        renderAreasList();
    } catch (err) {
        container.innerHTML = `<div class="error">Error loading areas: ${err.message}</div>`;
    }
};

function handleAreaViewToggle(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;
    if (view === 'grid') {
        currentAreaView = 'grid';
    } else if (view === 'table') {
        currentAreaView = 'table';
    }
    renderAreasList();
    
    // Update active class on toggle buttons
    document.querySelectorAll('.areas-view-toggle .view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    btn.classList.add('active');
}

function renderAreasList() {
    const searchTerm = (document.getElementById('areaSearch')?.value || '').toLowerCase();
    let filtered = allAreasData.filter(area => {
        if (!searchTerm) return true;
        // Search by name or any microMarket (sector)
        const matchesName = area.name.toLowerCase().includes(searchTerm);
        const matchesSector = area.microMarkets?.some(sector => sector.toLowerCase().includes(searchTerm));
        return matchesName || matchesSector;
    });
    
    const container = document.getElementById('areasList');
    if (!filtered.length) {
        container.innerHTML = '<p class="no-data">No areas found.</p>';
        return;
    }
    
    let html = `<div style="margin-bottom: 1rem;">Showing ${filtered.length} areas</div>`;
    
    if (currentAreaView === 'grid') {
        // ========== GRID VIEW (CARDS) ==========
        html += '<div class="areas-grid">';
        filtered.forEach(area => {
            // Show first 3 microMarkets (sectors)
            const sectors = area.microMarkets || [];
            const sectorsPreview = sectors.slice(0, 3).join(', ') + (sectors.length > 3 ? '...' : '');
            const sectorsHtml = sectors.length ? `<div class="card-meta">📍 ${escapeHtml(sectorsPreview)}</div>` : '';
            
            html += `
                <div class="area-card">
                    <div class="area-card-header">
                        <h3 class="area-name">${escapeHtml(area.name)}</h3>
                        ${area.tags && area.tags.length ? `<span class="area-tag">${escapeHtml(area.tags[0])}</span>` : ''}
                    </div>
                    <div class="area-location">📍 ${escapeHtml(area.city || '')}, ${escapeHtml(area.state || '')}</div>
                    ${sectorsHtml}
                    <div class="card-actions">
                        <button class="btn-view-details" onclick="window.location.href='detail.html?type=area&id=${area._id}'">
                            View Details →
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        // ========== TABLE VIEW ==========
        html += `
            <div class="areas-table-wrapper">
                <table class="areas-table">
                    <thead>
                        <tr>
                            <th>Area Name</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Sectors</th>
                            <th>Tags</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        filtered.forEach(area => {
            const sectors = area.microMarkets || [];
            const sectorsDisplay = sectors.slice(0, 2).join(', ') + (sectors.length > 2 ? '...' : '');
            const tagsDisplay = area.tags ? area.tags.slice(0, 2).join(', ') + (area.tags.length > 2 ? '...' : '') : '-';
            
            html += `
                <tr>
                    <td><strong>${escapeHtml(area.name)}</strong></td>
                    <td>${escapeHtml(area.city || '-')}</td>
                    <td>${escapeHtml(area.state || '-')}</td>
                    <td>${escapeHtml(sectorsDisplay)}</td>
                    <td>${escapeHtml(tagsDisplay)}</td>
                    <td class="table-actions">
                        <button class="btn-view" onclick="window.location.href='detail.html?type=area&id=${area._id}'">View</button>
                    </td>
                </tr>
            `;
        });
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Re-attach view toggle listeners after render
    document.querySelectorAll('.areas-view-toggle .view-toggle-btn').forEach(btn => {
        btn.removeEventListener('click', handleAreaViewToggle);
        btn.addEventListener('click', handleAreaViewToggle);
    });
}

// Add area modal stub (you can implement later)
window.openAddAreaModal = function() {
    alert('Add area functionality coming soon');
};

// Expose globally
window.renderAreasPage = renderAreasPage;