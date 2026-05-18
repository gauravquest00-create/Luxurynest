// ==================== PROJECTS MANAGEMENT (GRID + TABLE VIEW WITH DELETE) ====================
const API_BASE = window.location.origin + '/api';
let currentProjectView = localStorage.getItem('projectView') || 'grid';
let selectedProjects = new Set(); // Store selected project IDs for bulk delete

window.renderProjectsPage = function() {
    const filterBarHtml = `
        <div class="search-section">
            <input type="text" id="projectSearch" placeholder="Search projects by name, location, or builder..." class="global-search">
            <button id="projectFilterBtn" class="btn-filter"><i class="fas fa-sliders-h"></i> Filter</button>
            <div class="projects-view-toggle">
                <button class="view-toggle-btn ${currentProjectView === 'grid' ? 'active' : ''}" data-view="grid"><i class="fas fa-th"></i> Grid</button>
                <button class="view-toggle-btn ${currentProjectView === 'table' ? 'active' : ''}" data-view="table"><i class="fas fa-table"></i> Table</button>
            </div>
        </div>
        <div class="bulk-actions-bar" id="bulkActionsBar" style="display: none; margin-bottom: 1rem; padding: 0.75rem; background: #FEFCE8; border-radius: 12px; align-items: center; justify-content: space-between;">
            <span id="selectedCount">0</span> projects selected
            <button id="bulkDeleteBtn" class="btn-danger-sm"><i class="fas fa-trash-alt"></i> Delete Selected</button>
        </div>
        <div id="projectsList"></div>
    `;
    document.getElementById('pageContent').innerHTML = `<h2>Projects Management</h2>${filterBarHtml}`;
    
    document.getElementById('projectSearch').addEventListener('input', renderProjectsList);
    document.getElementById('projectFilterBtn').addEventListener('click', () => openProjectFilterModal());
    
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.style.display = 'inline-flex';
    
    // View toggle listeners
    document.querySelectorAll('.projects-view-toggle .view-toggle-btn').forEach(btn => {
        btn.removeEventListener('click', handleProjectViewToggle);
        btn.addEventListener('click', handleProjectViewToggle);
    });
    
    // Bulk delete listener
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.removeEventListener('click', handleBulkDelete);
        bulkDeleteBtn.addEventListener('click', handleBulkDelete);
    }
    
    renderProjectsList();
};

function updateBulkActionsBar() {
    const bulkBar = document.getElementById('bulkActionsBar');
    if (bulkBar) {
        bulkBar.style.display = selectedProjects.size > 0 ? 'flex' : 'none';
        document.getElementById('selectedCount').innerText = selectedProjects.size;
    }
}

function showConfirmDialog(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal confirm-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h3>Confirm Delete</h3>
            <p>${message}</p>
            <div class="modal-actions" style="justify-content: center;">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn-danger" id="confirmDeleteBtn">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('confirmDeleteBtn').onclick = () => {
        modal.remove();
        onConfirm();
    };
}

async function deleteSingleProject(id, name) {
    showConfirmDialog(`Are you sure you want to delete project "${name}"?`, async () => {
        try {
       const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
});

            if (!res.ok) throw new Error(await res.text());
            showToast('Project deleted successfully');
            const index = projectsData.findIndex(p => p._id === id);
            if (index !== -1) projectsData.splice(index, 1);
            selectedProjects.delete(id);
            renderProjectsList();
        } catch (err) {
            showToast(err.message, true);
        }
    });
}

async function handleBulkDelete() {
    if (selectedProjects.size === 0) return;
    showConfirmDialog(`Delete ${selectedProjects.size} project(s)?`, async () => {
        const ids = Array.from(selectedProjects);
        try {
       const res = await fetch(`${API_BASE}/admin/projects/bulk`, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids })
});
            if (!res.ok) throw new Error(await res.text());
            const result = await res.json();
            showToast(result.message || `${ids.length} project(s) deleted successfully`);
            projectsData = projectsData.filter(p => !ids.includes(p._id));
            selectedProjects.clear();
            renderProjectsList();
        } catch (err) {
            showToast(err.message, true);
        }
    });
}

function renderProjectsList() {
    const search = (document.getElementById('projectSearch')?.value || '').toLowerCase();
    let filtered = projectsData.filter(p => {
        return (!search || 
            p.name.toLowerCase().includes(search) ||
            (p.location?.address || '').toLowerCase().includes(search) ||
            (p.developer || '').toLowerCase().includes(search));
    });
    
    const saved = JSON.parse(sessionStorage.getItem('projectFilters') || '{}');
    if (saved.status) filtered = filtered.filter(p => p.liveStatus === saved.status);
    if (saved.sector) filtered = filtered.filter(p => p.location?.sector === saved.sector);
    if (saved.location) filtered = filtered.filter(p => (p.area === saved.location) || (p.microMarket === saved.location));
    
    const container = document.getElementById('projectsList');
    if (!filtered.length) {
        container.innerHTML = '<p>No projects found.</p>';
        updateBulkActionsBar();
        return;
    }
    
    updateBulkActionsBar();
    
    let html = `<div style="margin-bottom: 1rem;">Showing ${filtered.length} projects</div>`;
    
    if (currentProjectView === 'grid') {
        // ========== GRID VIEW (CARDS) WITH DELETE ==========
        html += '<div class="project-card-grid">';
        filtered.forEach(p => {
            const imageUrl = p.media?.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image';
            const statusClass = p.liveStatus === 'active' ? 'active' : 'inactive';
            const isChecked = selectedProjects.has(p._id);
            
            html += `
                <div class="project-card" data-project-id="${p._id}">
                    <div class="project-card-image" style="background-image: url('${imageUrl}');"></div>
                    <div class="project-card-content">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 class="project-card-title">${escapeHtml(p.name)}</h3>
                            <input type="checkbox" class="project-select-checkbox" data-id="${p._id}" ${isChecked ? 'checked' : ''}>
                        </div>
                        <p class="project-card-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(p.location?.address || p.area || 'N/A')}</p>
                        <p class="project-card-developer"><i class="fas fa-building"></i> ${escapeHtml(p.developer || 'Unknown')}</p>
                        <span class="project-status ${statusClass}">${escapeHtml(p.liveStatus)}</span>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <button class="btn-view" onclick="window.location.href='detail.html?type=project&id=${p._id}'">View Details</button>
                            <button class="btn-delete" onclick="deleteSingleProject('${p._id}', '${escapeHtml(p.name)}')"><i class="fas fa-trash-alt"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        // ========== TABLE VIEW WITH DELETE ==========
        html += `
            <div class="projects-table-wrapper">
                <table class="projects-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAllCheckbox"></th>
                            <th>Name</th>
                            <th>Developer</th>
                            <th>Location</th>
                            <th>Sector</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        filtered.forEach(p => {
            const statusClass = p.liveStatus === 'active' ? 'active' : 'inactive';
            const isChecked = selectedProjects.has(p._id);
            
            html += `
                <tr>
                    <td><input type="checkbox" class="project-select-checkbox" data-id="${p._id}" ${isChecked ? 'checked' : ''}></td>
                    <td><strong>${escapeHtml(p.name)}</strong></td>
                    <td>${escapeHtml(p.developer || '-')}</td>
                    <td>${escapeHtml(p.location?.address || p.area || '-')}</td>
                    <td>${escapeHtml(p.location?.sector || '-')}</td>
                    <td><span class="table-status ${statusClass}">${escapeHtml(p.liveStatus)}</span></td>
                    <td class="table-actions" style="display: flex; gap: 0.5rem;">
                        <button class="btn-view" onclick="window.location.href='detail.html?type=project&id=${p._id}'">View</button>
                        <button class="btn-delete" onclick="deleteSingleProject('${p._id}', '${escapeHtml(p.name)}')"><i class="fas fa-trash-alt"></i></button>
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
    
    // Attach checkbox event listeners
    document.querySelectorAll('.project-select-checkbox').forEach(cb => {
        cb.removeEventListener('change', handleCheckboxChange);
        cb.addEventListener('change', handleCheckboxChange);
    });
    
    // Select All functionality
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener('change', handleSelectAll);
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Attach view toggle event listeners
    document.querySelectorAll('.projects-view-toggle .view-toggle-btn').forEach(btn => {
        btn.removeEventListener('click', handleProjectViewToggle);
        btn.addEventListener('click', handleProjectViewToggle);
    });
}

function handleCheckboxChange(e) {
    const cb = e.currentTarget;
    const id = cb.dataset.id;
    if (cb.checked) {
        selectedProjects.add(id);
    } else {
        selectedProjects.delete(id);
    }
    updateBulkActionsBar();
    
    const selectAll = document.getElementById('selectAllCheckbox');
    if (selectAll) {
        const allCheckboxes = document.querySelectorAll('.project-select-checkbox');
        const allChecked = allCheckboxes.length === document.querySelectorAll('.project-select-checkbox:checked').length;
        selectAll.checked = allChecked;
    }
}

function handleSelectAll(e) {
    const isChecked = e.currentTarget.checked;
    document.querySelectorAll('.project-select-checkbox').forEach(cb => {
        cb.checked = isChecked;
        const id = cb.dataset.id;
        if (isChecked) {
            selectedProjects.add(id);
        } else {
            selectedProjects.delete(id);
        }
    });
    updateBulkActionsBar();
}

function handleProjectViewToggle(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;
    if (view === 'grid') {
        currentProjectView = 'grid';
    } else if (view === 'table') {
        currentProjectView = 'table';
    }
    localStorage.setItem('projectView', currentProjectView);
    renderProjectsList();
}

//////////////////////////////////////////////////////////////
// FILTER MODAL (unchanged)
//////////////////////////////////////////////////////////////

function openProjectFilterModal() {
    document.querySelector('.modal')?.remove();
    
    const sectors = [...new Set(projectsData.map(p => p.location?.sector).filter(Boolean))];
    const locations = [...new Set(projectsData.map(p => p.area || p.location?.address).filter(Boolean))];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <h3>Filter Projects</h3>
            <div class="form-group"><label>Status</label>
                <div class="custom-dropdown" data-id="filterProjStatus">
                    <div class="dropdown-selected">All</div>
                    <div class="dropdown-menu">
                        <div class="dropdown-item" data-value="">All</div>
                        <div class="dropdown-item" data-value="active">Active</div>
                        <div class="dropdown-item" data-value="inactive">Inactive</div>
                    </div>
                    <input type="hidden" id="filterProjStatus" value="">
                </div>
            </div>
            <div class="form-group"><label>Sector</label>
                <div class="custom-dropdown" data-id="filterProjSector">
                    <div class="dropdown-selected">All</div>
                    <div class="dropdown-menu">
                        <div class="dropdown-item" data-value="">All</div>
                        ${sectors.map(s => `<div class="dropdown-item" data-value="${escapeHtml(s)}">${escapeHtml(s)}</div>`).join('')}
                    </div>
                    <input type="hidden" id="filterProjSector" value="">
                </div>
            </div>
            <div class="form-group"><label>Location</label>
                <div class="custom-dropdown" data-id="filterProjLocation">
                    <div class="dropdown-selected">All</div>
                    <div class="dropdown-menu">
                        <div class="dropdown-item" data-value="">All</div>
                        ${locations.map(l => `<div class="dropdown-item" data-value="${escapeHtml(l)}">${escapeHtml(l)}</div>`).join('')}
                    </div>
                    <input type="hidden" id="filterProjLocation" value="">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="clearProjectFiltersAndClose()">Clear All</button>
                <button class="btn-primary" onclick="applyProjectFilters()">Apply</button>
                <button class="btn-secondary" onclick="closeProjectFilterModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    initFilterDropdowns();
    
    const saved = JSON.parse(sessionStorage.getItem('projectFilters') || '{}');
    setFilterDropdownValue("filterProjStatus", saved.status);
    setFilterDropdownValue("filterProjSector", saved.sector);
    setFilterDropdownValue("filterProjLocation", saved.location);
}

function initFilterDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(drop => {
        const selected = drop.querySelector('.dropdown-selected');
        const menu = drop.querySelector('.dropdown-menu');
        const input = drop.querySelector('input');
        
        const newSelected = selected.cloneNode(true);
        selected.parentNode.replaceChild(newSelected, selected);
        
        newSelected.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            menu.style.display = 'block';
        };
        
        menu.querySelectorAll('.dropdown-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.onclick = (e) => {
                e.stopPropagation();
                newSelected.innerText = newItem.innerText;
                input.value = newItem.dataset.value;
                menu.style.display = 'none';
            };
        });
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
        }
    });
}

function setFilterDropdownValue(id, value) {
    if (!value) return;
    const drop = document.querySelector(`.custom-dropdown[data-id="${id}"]`);
    if (!drop) return;
    const item = drop.querySelector(`.dropdown-item[data-value="${value}"]`);
    if (item) {
        drop.querySelector('.dropdown-selected').innerText = item.innerText;
        drop.querySelector('input').value = value;
    }
}

window.applyProjectFilters = function() {
    const filters = {
        status: document.getElementById('filterProjStatus')?.value || '',
        sector: document.getElementById('filterProjSector')?.value || '',
        location: document.getElementById('filterProjLocation')?.value || ''
    };
    sessionStorage.setItem('projectFilters', JSON.stringify(filters));
    document.querySelector('.modal')?.remove();
    renderProjectsList();
};

window.clearProjectFiltersAndClose = function() {
    sessionStorage.removeItem('projectFilters');
    document.querySelector('.modal')?.remove();
    renderProjectsList();
};

window.closeProjectFilterModal = function() {
    document.querySelector('.modal')?.remove();
};

// Expose globally
window.renderProjectsPage = renderProjectsPage;
window.applyProjectFilters = applyProjectFilters;
window.clearProjectFiltersAndClose = clearProjectFiltersAndClose;
window.closeProjectFilterModal = closeProjectFilterModal;
window.deleteSingleProject = deleteSingleProject;