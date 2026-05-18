// ==================== LEADS MANAGEMENT (GRID + TABLE VIEW WITH DELETE) ====================

let currentLeadView = localStorage.getItem('leadView') || 'grid';
let selectedLeads = new Set(); // Store selected lead IDs for bulk delete

window.renderLeadsPage = function() {
    const filterBarHtml = `
        <div class="search-section">
            <input type="text" id="leadSearch" placeholder="Search leads by name or phone..." class="global-search">
            <button id="leadFilterBtn" class="btn-filter"><i class="fas fa-sliders-h"></i> Filter</button>
            <div class="leads-view-toggle">
                <button class="view-toggle-btn ${currentLeadView === 'grid' ? 'active' : ''}" data-view="grid"><i class="fas fa-th"></i> Grid</button>
                <button class="view-toggle-btn ${currentLeadView === 'table' ? 'active' : ''}" data-view="table"><i class="fas fa-table"></i> Table</button>
            </div>
        </div>
        <div class="bulk-actions-bar" id="bulkActionsBar" style="display: none; margin-bottom: 1rem; padding: 0.75rem; background: #FEFCE8; border-radius: 12px; align-items: center; justify-content: space-between;">
            <span id="selectedCount">0</span> leads selected
            <button id="bulkDeleteBtn" class="btn-danger-sm"><i class="fas fa-trash-alt"></i> Delete Selected</button>
        </div>
        <div id="leadsList"></div>
    `;
    document.getElementById('pageContent').innerHTML = `<h2>Leads Management</h2>${filterBarHtml}`;

    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.style.display = 'inline-flex';

    document.getElementById('leadSearch').addEventListener('input', renderLeadsList);
    document.getElementById('leadFilterBtn').addEventListener('click', () => openLeadFilterModal());

    // View toggle listeners
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.removeEventListener('click', handleViewToggle);
        btn.addEventListener('click', handleViewToggle);
    });

    // Bulk delete listener
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.removeEventListener('click', handleBulkDelete);
        bulkDeleteBtn.addEventListener('click', handleBulkDelete);
    }

    renderLeadsList();
};

function formatRequirement(lead) {
    const req = lead.requirementDetails || {};
    const parts = [];
    if (req.bedrooms) parts.push(`${req.bedrooms} BHK`);
    if (req.budget) parts.push(`Budget: ${req.budget}`);
    if (req.purpose) parts.push(`Purpose: ${req.purpose}`);
    if (req.timeline) parts.push(`Timeline: ${req.timeline}`);
    if (req.message) parts.push(`Msg: ${req.message.substring(0, 40)}`);
    return parts.join(' • ') || 'No requirements';
}

function updateBulkActionsBar() {
    const bulkBar = document.getElementById('bulkActionsBar');
    if (bulkBar) {
        bulkBar.style.display = selectedLeads.size > 0 ? 'flex' : 'none';
        document.getElementById('selectedCount').innerText = selectedLeads.size;
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

async function deleteSingleLead(id, name) {
    showConfirmDialog(`Are you sure you want to delete lead "${name}"?`, async () => {
        try {
            const res = await fetch(`/api/admin/leads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(await res.text());
            showToast('Lead deleted successfully');
            const index = leadsData.findIndex(l => l._id === id);
            if (index !== -1) leadsData.splice(index, 1);
            selectedLeads.delete(id);
            renderLeadsList();
        } catch (err) {
            showToast(err.message, true);
        }
    });
}

async function handleBulkDelete() {
    if (selectedLeads.size === 0) return;
    showConfirmDialog(`Delete ${selectedLeads.size} lead(s)?`, async () => {
        const ids = Array.from(selectedLeads);
        try {
            const res = await fetch(`/api/admin/leads/bulk`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids })
            });
            if (!res.ok) throw new Error(await res.text());
            const result = await res.json();
            showToast(result.message || `${ids.length} lead(s) deleted successfully`);
            leadsData = leadsData.filter(l => !ids.includes(l._id));
            selectedLeads.clear();
            renderLeadsList();
        } catch (err) {
            showToast(err.message, true);
        }
    });
}

function handleViewToggle(e) {
    const btn = e.currentTarget;
    const view = btn.dataset.view;
    if (view === 'grid') {
        currentLeadView = 'grid';
    } else if (view === 'table') {
        currentLeadView = 'table';
    }
    localStorage.setItem('leadView', currentLeadView);
    renderLeadsList();
}

function renderLeadsList() {
    const searchTerm = (document.getElementById('leadSearch')?.value || '').toLowerCase();

    let filtered = leadsData.filter(lead => {
        return (!searchTerm || 
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.phone.includes(searchTerm));
    });

    const savedFilters = JSON.parse(sessionStorage.getItem('leadFilters') || '{}');
    if (savedFilters.status) filtered = filtered.filter(l => l.status === savedFilters.status);
    if (savedFilters.source) filtered = filtered.filter(l => l.source === savedFilters.source);
    if (savedFilters.projectId) filtered = filtered.filter(l => l.requirementDetails?.projectId === savedFilters.projectId);

    const container = document.getElementById('leadsList');
    if (!filtered.length) {
        container.innerHTML = '<p>No leads found.</p>';
        updateBulkActionsBar();
        return;
    }

    updateBulkActionsBar();

    let html = `<div style="margin-bottom: 1rem;">Showing ${filtered.length} leads</div>`;

    if (currentLeadView === 'grid') {
        // ========== GRID VIEW WITH DELETE ==========
        html += '<div class="card-grid">';
        filtered.forEach(lead => {
            const requirementText = formatRequirement(lead);
            const sourceLabel = lead.source ? lead.source.replace(/_/g, ' ') : '—';
            const isChecked = selectedLeads.has(lead._id);

            html += `
                <div class="lead-card" data-lead-id="${lead._id}">
                    <div class="lead-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 class="lead-name">${escapeHtml(lead.name)}</h3>
                        <input type="checkbox" class="lead-select-checkbox" data-id="${lead._id}" ${isChecked ? 'checked' : ''}>
                    </div>
                    <div class="lead-card-body">
                        <div class="lead-contact">
                            <div><i class="fas fa-phone-alt"></i> ${escapeHtml(lead.phone)}</div>
                            <div><i class="fas fa-tag"></i> Source: ${escapeHtml(sourceLabel)}</div>
                        </div>
                        <div class="lead-requirement">
                            <strong>Requirement:</strong> <span>${escapeHtml(requirementText)}</span>
                        </div>
                    </div>
                    <div class="lead-card-footer" style="display: flex; gap: 0.5rem; justify-content: space-between;">
                        <button class="btn-view" onclick="window.location.href='detail.html?type=lead&id=${lead._id}'">View Details</button>
                        <button class="btn-delete" onclick="deleteSingleLead('${lead._id}', '${escapeHtml(lead.name)}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        // ========== TABLE VIEW WITH DELETE ==========
        html += `
            <div class="leads-table-wrapper">
                <table class="leads-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAllCheckbox"></th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Requirement</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        filtered.forEach(lead => {
            const requirementText = formatRequirement(lead);
            const sourceLabel = lead.source ? lead.source.replace(/_/g, ' ') : '—';
            const statusClass = lead.status === 'new' ? 'new' : (lead.status === 'contacted' ? 'contacted' : 'closed');
            const isChecked = selectedLeads.has(lead._id);

            html += `
                <tr>
                    <td><input type="checkbox" class="lead-select-checkbox" data-id="${lead._id}" ${isChecked ? 'checked' : ''}></td>
                    <td><strong>${escapeHtml(lead.name)}</strong></td>
                    <td>${escapeHtml(lead.phone)}</td>
                    <td>${escapeHtml(sourceLabel)}</td>
                    <td><span class="table-status ${statusClass}">${escapeHtml(lead.status)}</span></td>
                    <td>${escapeHtml(requirementText)}</td>
                    <td class="table-actions" style="display: flex; gap: 0.5rem;">
                        <button class="btn-view" onclick="window.location.href='detail.html?type=lead&id=${lead._id}'">View</button>
                        <button class="btn-delete" onclick="deleteSingleLead('${lead._id}', '${escapeHtml(lead.name)}')"><i class="fas fa-trash-alt"></i></button>
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
    document.querySelectorAll('.lead-select-checkbox').forEach(cb => {
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
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.removeEventListener('click', handleViewToggle);
        btn.addEventListener('click', handleViewToggle);
    });
}

function handleCheckboxChange(e) {
    const cb = e.currentTarget;
    const id = cb.dataset.id;
    if (cb.checked) {
        selectedLeads.add(id);
    } else {
        selectedLeads.delete(id);
    }
    updateBulkActionsBar();
    
    const selectAll = document.getElementById('selectAllCheckbox');
    if (selectAll) {
        const allCheckboxes = document.querySelectorAll('.lead-select-checkbox');
        const allChecked = allCheckboxes.length === document.querySelectorAll('.lead-select-checkbox:checked').length;
        selectAll.checked = allChecked;
    }
}

function handleSelectAll(e) {
    const isChecked = e.currentTarget.checked;
    document.querySelectorAll('.lead-select-checkbox').forEach(cb => {
        cb.checked = isChecked;
        const id = cb.dataset.id;
        if (isChecked) {
            selectedLeads.add(id);
        } else {
            selectedLeads.delete(id);
        }
    });
    updateBulkActionsBar();
}

//////////////////////////////////////////////////////////////
// CUSTOM DROPDOWN FILTER MODAL (unchanged)
//////////////////////////////////////////////////////////////

function createDropdown(label, id, options) {
    return `
        <div class="form-group">
            <label>${label}</label>
            <div class="custom-dropdown" data-id="${id}">
                <div class="dropdown-selected">Select</div>
                <div class="dropdown-menu">
                    ${options.map(opt => `
                        <div class="dropdown-item" data-value="${opt.value}">
                            ${opt.label}
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="${id}" value="">
            </div>
        </div>
    `;
}

function initCustomDropdowns() {
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
}

function setDropdownValue(id, value) {
    if (!value) return;
    const drop = document.querySelector(`.custom-dropdown[data-id="${id}"]`);
    if (!drop) return;
    const item = drop.querySelector(`.dropdown-item[data-value="${value}"]`);
    if (item) {
        drop.querySelector('.dropdown-selected').innerText = item.innerText;
        drop.querySelector('input').value = value;
    }
}

function openLeadFilterModal() {
    document.querySelector('.modal')?.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <h3>Filter Leads</h3>

            ${createDropdown("Status", "filterStatus", [
                {value:"", label:"All"},
                {value:"new", label:"New"},
                {value:"contacted", label:"Contacted"},
                {value:"closed", label:"Closed"}
            ])}

            ${createDropdown("Source", "filterSource", [
                {value:"", label:"All"},
                {value:"property_detail", label:"Property Detail"},
                {value:"advisor_page", label:"Advisor Page"},
                {value:"deal_match", label:"Deal Match"},
                {value:"contact_form", label:"Contact Form"},
                {value:"admin_manual", label:"Admin Manual"}
            ])}

            ${createDropdown("Project", "filterProject", [
                {value:"", label:"All"},
                ...projectsData.map(p => ({
                    value: p._id,
                    label: escapeHtml(p.name)
                }))
            ])}

            <div class="modal-actions">
                <button class="btn-secondary" onclick="clearLeadFiltersAndClose()">Clear All</button>
                <button class="btn-primary" onclick="applyLeadFilters()">Apply</button>
                <button class="btn-secondary" onclick="closeLeadFilterModal()">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    initCustomDropdowns();

    const saved = JSON.parse(sessionStorage.getItem('leadFilters') || '{}');
    setDropdownValue("filterStatus", saved.status);
    setDropdownValue("filterSource", saved.source);
    setDropdownValue("filterProject", saved.projectId);
}

window.closeLeadFilterModal = function() {
    document.querySelector('.modal')?.remove();
};

window.applyLeadFilters = function() {
    const filters = {
        status: document.getElementById('filterStatus')?.value || '',
        source: document.getElementById('filterSource')?.value || '',
        projectId: document.getElementById('filterProject')?.value || ''
    };
    sessionStorage.setItem('leadFilters', JSON.stringify(filters));
    document.querySelector('.modal')?.remove();
    renderLeadsList();
};

window.clearLeadFiltersAndClose = function() {
    sessionStorage.removeItem('leadFilters');
    document.querySelector('.modal')?.remove();
    renderLeadsList();
};

// Expose globally
window.renderLeadsPage = renderLeadsPage;
window.applyLeadFilters = applyLeadFilters;
window.clearLeadFiltersAndClose = clearLeadFiltersAndClose;
window.closeLeadFilterModal = closeLeadFilterModal;
window.deleteSingleLead = deleteSingleLead;