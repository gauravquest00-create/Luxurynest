// ==================== PROPERTIES MANAGEMENT (GRID + TABLE VIEW) ====================

let currentPropertyView = localStorage.getItem('propertyView') || 'grid';

window.renderPropertiesPage = function() {
    const filterBarHtml = `
        <div class="search-section">
            <input type="text" id="propertySearch" placeholder="Search properties by name, project, or type..." class="global-search">
            <button id="propertyFilterBtn" class="btn-filter"><i class="fas fa-sliders-h"></i> Filter</button>
            <div class="properties-view-toggle">
                <button class="view-toggle-btn ${currentPropertyView === 'grid' ? 'active' : ''}" data-view="grid"><i class="fas fa-th"></i> Grid</button>
                <button class="view-toggle-btn ${currentPropertyView === 'table' ? 'active' : ''}" data-view="table"><i class="fas fa-table"></i> Table</button>
            </div>
        </div>
        <div id="propertiesList"></div>
    `;
    document.getElementById('pageContent').innerHTML = `<h2>Properties Management</h2><p>Manage all your property listings</p>${filterBarHtml}`;
    
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.style.display = 'inline-flex';
    
    document.getElementById('propertySearch').addEventListener('input', renderPropertiesList);
    document.getElementById('propertyFilterBtn').addEventListener('click', () => openPropertyFilterModal());
    
    // Attach view toggle event listeners
    attachViewToggleListeners();
    
    renderPropertiesList();
};

function attachViewToggleListeners() {
    const gridBtn = document.querySelector('.properties-view-toggle .view-toggle-btn[data-view="grid"]');
    const tableBtn = document.querySelector('.properties-view-toggle .view-toggle-btn[data-view="table"]');
    
    if (gridBtn) {
        const newGridBtn = gridBtn.cloneNode(true);
        gridBtn.parentNode.replaceChild(newGridBtn, gridBtn);
        newGridBtn.addEventListener('click', () => {
            currentPropertyView = 'grid';
            localStorage.setItem('propertyView', 'grid');
            renderPropertiesList();
        });
    }
    
    if (tableBtn) {
        const newTableBtn = tableBtn.cloneNode(true);
        tableBtn.parentNode.replaceChild(newTableBtn, tableBtn);
        newTableBtn.addEventListener('click', () => {
            currentPropertyView = 'table';
            localStorage.setItem('propertyView', 'table');
            renderPropertiesList();
        });
    }
}

function renderPropertiesList() {
    const search = (document.getElementById('propertySearch')?.value || '').toLowerCase();
    let filtered = propertiesData.filter(p => {
        return (!search || 
            p.title.toLowerCase().includes(search) ||
            (p.projectId?.name || '').toLowerCase().includes(search) ||
            (p.unitDetails?.type || '').toLowerCase().includes(search) ||
            (p.purpose || '').toLowerCase().includes(search));
    });
    
    // Apply saved filters
    const saved = JSON.parse(sessionStorage.getItem('propertyFilters') || '{}');
    
    if (saved.purpose) filtered = filtered.filter(p => p.purpose === saved.purpose);
    
    if (saved.type) {
        let actualType = saved.type;
        if (saved.type === 'apartment') actualType = 'resale';
        else if (saved.type === 'builderfloor') actualType = 'floor';
        else if (saved.type === 'plot') actualType = 'plot';
        else if (saved.type === 'rent') actualType = 'rent';
        filtered = filtered.filter(p => p.unitDetails?.type === actualType);
    }
    
    if (saved.status) filtered = filtered.filter(p => p.liveStatus === saved.status);
    if (saved.projectId) filtered = filtered.filter(p => p.projectId?._id === saved.projectId);
    if (saved.bedrooms) filtered = filtered.filter(p => p.unitDetails?.bedrooms?.toString() === saved.bedrooms);
    if (saved.featured !== undefined && saved.featured !== '') {
        const isFeatured = saved.featured === 'true';
        filtered = filtered.filter(p => p.featured === isFeatured);
    }
    
    const container = document.getElementById('propertiesList');
    if (!filtered.length) {
        container.innerHTML = '<p>No properties found.</p>';
        return;
    }
    
    let html = `<div style="margin-bottom: 1rem;">Showing ${filtered.length} properties</div>`;
    
    // Update toggle buttons active state
    const gridBtn = document.querySelector('.properties-view-toggle .view-toggle-btn[data-view="grid"]');
    const tableBtn = document.querySelector('.properties-view-toggle .view-toggle-btn[data-view="table"]');
    if (gridBtn && tableBtn) {
        if (currentPropertyView === 'grid') {
            gridBtn.classList.add('active');
            tableBtn.classList.remove('active');
        } else {
            gridBtn.classList.remove('active');
            tableBtn.classList.add('active');
        }
    }
    
    if (currentPropertyView === 'grid') {
        // ========== GRID VIEW (CARDS) ==========
        html += '<div class="property-grid">';
        filtered.forEach(prop => {
            const title = prop.title || '-';
            const projectName = prop.projectId?.name || '-';
            const bedrooms = prop.unitDetails?.bedrooms ? prop.unitDetails.bedrooms + ' BHK' : '-';
            const size = prop.unitDetails?.sqft ? prop.unitDetails.sqft + ' sqft' : '-';
            let typeLabel = prop.unitDetails?.type || '-';
            if (typeLabel === 'resale') typeLabel = 'Apartment';
            else if (typeLabel === 'floor') typeLabel = 'Builder Floor';
            else if (typeLabel === 'plot') typeLabel = 'Plot';
            else if (typeLabel === 'rent') typeLabel = 'Rent';
            const price = prop.unitDetails?.price || prop.pricing?.expectedPrice || '-';
            const status = prop.liveStatus === 'active' ? 'available' : 'unavailable';
            const img = prop.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image';
            const featuredBadge = prop.featured ? '<span class="featured-badge">Featured</span>' : '';
            
            html += `
                <div class="property-card">
                    <div class="property-image" style="background-image: url('${img}');"></div>
                    <div class="property-content">
                        <div class="property-title">${escapeHtml(title)} ${featuredBadge}</div>
                        <div class="property-meta">${escapeHtml(projectName)}</div>
                        <div class="property-details">
                            <span>${escapeHtml(bedrooms)}</span>
                            <span>${escapeHtml(size)}</span>
                            <span>${escapeHtml(typeLabel)}</span>
                        </div>
                        <div class="property-price">${escapeHtml(price)}</div>
                        <div class="property-status ${status}">${status}</div>
                        <button class="btn-view" onclick="window.location.href='detail.html?type=property&id=${prop._id}'">View Details</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        // ========== TABLE VIEW ==========
        html += `
            <div class="properties-table-wrapper">
                <table class="properties-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Project</th>
                            <th>Type</th>
                            <th>BHK</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        filtered.forEach(prop => {
            let typeLabel = prop.unitDetails?.type || '-';
            if (typeLabel === 'resale') typeLabel = 'Apartment';
            else if (typeLabel === 'floor') typeLabel = 'Builder Floor';
            else if (typeLabel === 'plot') typeLabel = 'Plot';
            else if (typeLabel === 'rent') typeLabel = 'Rent';
            
            const statusClass = prop.liveStatus === 'active' ? 'active' : 'inactive';
            const price = prop.unitDetails?.price || prop.pricing?.expectedPrice || '-';
            const bedrooms = prop.unitDetails?.bedrooms || '-';
            const size = prop.unitDetails?.sqft ? prop.unitDetails.sqft + ' sqft' : '-';
            
            html += `
                <tr>
                    <td><strong>${escapeHtml(prop.title || '-')}</strong></td>
                    <td>${escapeHtml(prop.projectId?.name || '-')}</td>
                    <td>${escapeHtml(typeLabel)}</td>
                    <td>${escapeHtml(bedrooms)}</td>
                    <td>${escapeHtml(size)}</td>
                    <td>${escapeHtml(price)}</td>
                    <td><span class="table-status ${statusClass}">${prop.liveStatus}</span></td>
                    <td class="table-actions">
                        <button class="btn-view" onclick="window.location.href='detail.html?type=property&id=${prop._id}'">View</button>
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
    
    // Re-attach view toggle listeners after render (because innerHTML replaced them)
    attachViewToggleListeners();
}

// Helper: Update Type dropdown options based on selected Purpose
function updatePropertyTypeOptions() {
    const purposeSelect = document.getElementById('filterPropPurpose');
    const typeSelect = document.getElementById('filterPropType');
    if (!purposeSelect || !typeSelect) return;
    
    const purpose = purposeSelect.value;
    let options = '<option value="">All</option>';
    
    if (purpose === 'sell') {
        options += '<option value="apartment">Apartment</option>';
        options += '<option value="builderfloor">Builder Floor</option>';
        options += '<option value="plot">Plot</option>';
    } else if (purpose === 'rent') {
        options += '<option value="apartment">Apartment</option>';
        options += '<option value="builderfloor">Builder Floor</option>';
    } else {
        options += '<option value="apartment">Apartment</option>';
        options += '<option value="builderfloor">Builder Floor</option>';
        options += '<option value="plot">Plot</option>';
        options += '<option value="rent">Rent</option>';
    }
    typeSelect.innerHTML = options;
    
    const saved = JSON.parse(sessionStorage.getItem('propertyFilters') || '{}');
    if (saved.type && typeSelect.querySelector(`option[value="${saved.type}"]`)) {
        typeSelect.value = saved.type;
    }
}

function openPropertyFilterModal() {
    document.querySelector('.modal')?.remove();
    
    const projectOptions = projectsData.map(p => `<option value="${p._id}">${escapeHtml(p.name)}</option>`).join('');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <h3>Filter Properties</h3>
            <div class="form-group"><label>Purpose</label>
                <select id="filterPropPurpose">
                    <option value="">All</option>
                    <option value="sell">For Sale (Resale)</option>
                    <option value="rent">For Rent</option>
                </select>
            </div>
            <div class="form-group"><label>Type</label>
                <select id="filterPropType"><option value="">All</option></select>
            </div>
            <div class="form-group"><label>Status</label>
                <select id="filterPropStatus">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="form-group"><label>Project</label>
                <select id="filterPropProject"><option value="">All</option>${projectOptions}</select>
            </div>
            <div class="form-group"><label>Bedrooms</label>
                <select id="filterPropBeds">
                    <option value="">Any</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                </select>
            </div>
            <div class="form-group"><label>Featured</label>
                <select id="filterPropFeatured">
                    <option value="">All</option>
                    <option value="true">Featured</option>
                    <option value="false">Not Featured</option>
                </select>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="clearPropertyFiltersAndClose()">Clear All</button>
                <button class="btn-primary" onclick="applyPropertyFilters()">Apply</button>
                <button class="btn-secondary" onclick="closePropertyFilterModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const saved = JSON.parse(sessionStorage.getItem('propertyFilters') || '{}');
    const purposeSelect = document.getElementById('filterPropPurpose');
    const typeSelect = document.getElementById('filterPropType');
    
    if (saved.purpose) purposeSelect.value = saved.purpose;
    else purposeSelect.value = '';
    
    updatePropertyTypeOptions();
    purposeSelect.addEventListener('change', updatePropertyTypeOptions);
    
    if (saved.status) document.getElementById('filterPropStatus').value = saved.status;
    if (saved.projectId) document.getElementById('filterPropProject').value = saved.projectId;
    if (saved.bedrooms) document.getElementById('filterPropBeds').value = saved.bedrooms;
    if (saved.featured) document.getElementById('filterPropFeatured').value = saved.featured;
}

window.closePropertyFilterModal = function() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
};

window.applyPropertyFilters = function() {
    const filters = {
        purpose: document.getElementById('filterPropPurpose')?.value || '',
        type: document.getElementById('filterPropType')?.value || '',
        status: document.getElementById('filterPropStatus')?.value || '',
        projectId: document.getElementById('filterPropProject')?.value || '',
        bedrooms: document.getElementById('filterPropBeds')?.value || '',
        featured: document.getElementById('filterPropFeatured')?.value || ''
    };
    sessionStorage.setItem('propertyFilters', JSON.stringify(filters));
    document.querySelector('.modal')?.remove();
    renderPropertiesList();
};

window.clearPropertyFiltersAndClose = function() {
    sessionStorage.removeItem('propertyFilters');
    document.querySelector('.modal')?.remove();
    renderPropertiesList();
};

// Expose globally
window.renderPropertiesPage = renderPropertiesPage;
window.applyPropertyFilters = applyPropertyFilters;
window.clearPropertyFiltersAndClose = clearPropertyFiltersAndClose;
window.closePropertyFilterModal = closePropertyFilterModal;