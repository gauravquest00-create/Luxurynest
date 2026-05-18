// ==================== MODAL GLOBALS ====================
let currentAddType = '';
let propertyFormState = { step: 1, data: {}, configs: [] };
let uploadedFiles = [];

// ==================== OPEN MODAL ====================
window.openAddModal = function(type) {
    currentAddType = type;
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) existingModal.remove();
    
    const modalDiv = document.createElement('div');
    modalDiv.id = 'dynamicModal';
    modalDiv.className = 'modal';
    modalDiv.style.display = 'flex';
    modalDiv.innerHTML = `<div class="modal-content"><h3 id="modalTitle">Add New ${type.charAt(0).toUpperCase() + type.slice(1)}</h3><div id="modalBody"></div></div>`;
    document.body.appendChild(modalDiv);
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (type === 'lead') {
        renderLeadForm(modalBody, modalTitle);
    } else if (type === 'project') {
        renderProjectForm(modalBody, modalTitle);
    } else if (type === 'property') {
        modalTitle.innerText = 'Add New Property';
        propertyFormState = { step: 1, data: {}, configs: [] };
        uploadedFiles = [];
        renderPropertyStep(1, modalBody);
    }
};
// ADD data from via categories
// ==================== ADD LEAD FORM ====================
function renderLeadForm(container, titleElem) {
    titleElem.innerText = 'Add New Lead';

    container.innerHTML = `
        <form id="addLeadForm" class="form-grid">

            <div class="form-row full-width">
                <div class="form-group">
                    <label for="lead_name">Full Name <span style="color:red;">*</span></label>
                    <input id="lead_name" name="name" required placeholder="e.g., Rajesh Sharma">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="lead_email">Email</label>
                    <input id="lead_email" name="email" type="email" placeholder="rajesh@example.com">
                </div>
                <div class="form-group">
                    <label for="lead_phone">Phone <span style="color:red;">*</span></label>
                    <input id="lead_phone" name="phone" required placeholder="9876543210">
                </div>
            </div>

            <!-- Project (custom dropdown) -->
            <div class="form-row">
                <div class="form-group">
                    <label>Select Project</label>
                    <div class="custom-select-wrapper" id="customProjectWrapper">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Project</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="">None</li>
                            ${projectsData.map(p => `<li data-value="${p._id}">${escapeHtml(p.name)}</li>`).join('')}
                        </ul>
                    </div>
                    <input type="hidden" name="projectId" id="lead_projectId_hidden" value="">
                </div>
                <div class="form-group">
                    <label>Configuration</label>
                    <div class="custom-select-wrapper" id="customConfigWrapper">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Configuration</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="configOptionsList">
                            <li data-value="">Select project first</li>
                        </ul>
                    </div>
                    <input type="hidden" name="configId" id="lead_configId_hidden" value="">
                </div>
            </div>

            <!-- Purpose (custom dropdown) -->
            <div class="form-row">
                <div class="form-group">
                    <label>Purpose</label>
                    <div class="custom-select-wrapper" id="customPurposeWrapper">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Buying</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="buying">Buying</li>
                            <li data-value="renting">Renting</li>
                            <li data-value="floor">Floor</li>
                            <li data-value="plot">Plot</li>
                        </ul>
                    </div>
                    <input type="hidden" name="purpose" id="lead_purpose_hidden" value="buying">
                </div>
                <div class="form-group">
                    <label for="lead_budget">Budget Range</label>
                    <input id="lead_budget" name="budget" class="lrf-input" placeholder="e.g., 1.5-2 Cr">
                </div>
            </div>

            <!-- Location & Timeline -->
            <div class="form-row">
                <div class="form-group">
                    <label for="lead_location">Preferred Location</label>
                    <input id="lead_location" name="location" placeholder="Sector, area...">
                </div>
                <div class="form-group">
                    <label>Timeline</label>
                    <div class="custom-select-wrapper" id="customTimelineWrapper">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Immediate</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="Immediate">Immediate</li>
                            <li data-value="3 months">3 months</li>
                            <li data-value="6 months">6 months</li>
                            <li data-value="1 year">1 year</li>
                        </ul>
                    </div>
                    <input type="hidden" name="timeline" id="lead_timeline_hidden" value="Immediate">
                </div>
            </div>

            <!-- Message -->
            <div class="form-row full-width">
                <div class="form-group">
                    <label for="lead_message">Message</label>
                    <textarea id="lead_message" name="message" rows="2" placeholder="Additional requirements..."></textarea>
                </div>
            </div>

            <!-- Status (custom dropdown) -->
            <div class="form-row">
                <div class="form-group">
                    <label>Status</label>
                    <div class="custom-select-wrapper" id="customStatusWrapper">
                        <div class="custom-select-trigger">
                            <span class="selected-value">New</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="new">New</li>
                            <li data-value="contacted">Contacted</li>
                            <li data-value="closed">Closed</li>
                        </ul>
                    </div>
                    <input type="hidden" name="status" id="lead_status_hidden" value="new">
                </div>
            </div>

            <input type="hidden" name="source" value="admin_manual">

            <div class="modal-actions full-width">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save Lead</button>
            </div>

        </form>
    `;

    // Initialize all custom dropdowns
   // Initialize all custom dropdowns
initCustomDropdown('customProjectWrapper', 'lead_projectId_hidden');
initCustomDropdown('customConfigWrapper', 'lead_configId_hidden');
initCustomDropdown('customPurposeWrapper', 'lead_purpose_hidden');
initCustomDropdown('customTimelineWrapper', 'lead_timeline_hidden');
initCustomDropdown('customStatusWrapper', 'lead_status_hidden');

    // Update configurations when project changes
    const hiddenProjectInput = document.getElementById('lead_projectId_hidden');
    const configOptionsList = document.getElementById('configOptionsList');
    const configHiddenInput = document.getElementById('lead_configId_hidden');
    const configTriggerText = document.querySelector('#customConfigWrapper .selected-value');

    function updateConfigurations(projectId) {
        const proj = projectsData.find(p => p._id === projectId);
        if (proj && proj.configurations && proj.configurations.length) {
            configOptionsList.innerHTML = '<li data-value="">Select configuration</li>';
            proj.configurations.forEach(cfg => {
                const displayName = cfg.type || `${cfg.bedrooms} BHK`;
                configOptionsList.innerHTML += `<li data-value="${cfg.id || cfg.bedrooms}">${escapeHtml(displayName)}</li>`;
            });
            // Re-attach click events
            attachConfigOptionsEvents();
        } else {
            configOptionsList.innerHTML = '<li data-value="">No configurations available</li>';
        }
        // Reset config selection
        configTriggerText.innerText = 'Select Configuration';
        configHiddenInput.value = '';
    }

    function attachConfigOptionsEvents() {
        configOptionsList.querySelectorAll('li').forEach(option => {
            option.removeEventListener('click', configClickHandler);
            option.addEventListener('click', configClickHandler);
        });
    }

    function configClickHandler(e) {
        const value = this.getAttribute('data-value');
        const text = this.innerText;
        configTriggerText.innerText = text;
        configHiddenInput.value = value;
        document.getElementById('customConfigWrapper').querySelector('.custom-options').classList.remove('open');
    }

    if (hiddenProjectInput) {
        hiddenProjectInput.addEventListener('change', () => {
            updateConfigurations(hiddenProjectInput.value);
        });
        updateConfigurations(hiddenProjectInput.value);
    }

    document.getElementById('addLeadForm').addEventListener('submit', submitLeadForm);
}

// ========== CUSTOM DROPDOWN INITIALIZATION ==========
function initCustomDropdown(wrapperId, hiddenInputId) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const optionsList = wrapper.querySelector('.custom-options');
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (!trigger || !optionsList || !hiddenInput) return;
    
    // Set initial selected text from hidden input
    const initialValue = hiddenInput.value;
    if (initialValue) {
        const selectedOption = optionsList.querySelector(`li[data-value="${initialValue}"]`);
        if (selectedOption) {
            trigger.querySelector('.selected-value').innerText = selectedOption.innerText;
        }
    }
    
    // Remove any existing listeners to avoid duplicates
    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);
    
    const newOptionsList = optionsList.cloneNode(true);
    optionsList.parentNode.replaceChild(newOptionsList, optionsList);
    
    // Toggle dropdown
   // Inside initCustomDropdown, in trigger click event:
newTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.custom-options').forEach(opt => {
        if (opt !== newOptionsList) opt.classList.remove('open');
    });
    newOptionsList.classList.toggle('open');
    
    // 🔥 Force bring to front
   // Inside initCustomDropdown, in trigger click event, add:
if (newOptionsList.classList.contains('open')) {
    newOptionsList.style.zIndex = '9999';
}
});
    
    // Select option
    newOptionsList.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.getAttribute('data-value');
            const text = option.innerText;
            newTrigger.querySelector('.selected-value').innerText = text;
            hiddenInput.value = value;
            newOptionsList.classList.remove('open');
            
            // Trigger change event
            const changeEvent = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(changeEvent);
        });
    });
    
    // Store references back to wrapper
    wrapper.querySelector('.custom-select-trigger').replaceWith(newTrigger);
    wrapper.querySelector('.custom-options').replaceWith(newOptionsList);
}

// Close dropdowns when clicking outside
document.addEventListener('click', function() {
    document.querySelectorAll('.custom-options').forEach(opt => {
        opt.classList.remove('open');
    });
});




// ==================== PROJECT FORM ====================


let projectUploadedFiles = [];

function renderProjectForm(container, titleElem) {
    titleElem.innerText = 'Add New Project';
    container.innerHTML = `
        <div class="paf-modal-body" style="padding:0 20px;">
            <form id="addProjectForm" class="paf-form-grid">
                <!-- Location -->
                <div class="paf-full-width"><h3 style="margin-bottom: 16px;">Location</h3></div>
                
                <!-- Area Custom Dropdown -->
                <div class="paf-form-group">
                    <label class="paf-label">Area <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="areaSelect">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Area</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="areaOptionsList">
                            ${(areasData || []).map(a => `<li data-value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</li>`).join('')}
                        </ul>
                    </div>
                    <input type="hidden" id="areaSelect" value="">
                </div>
                
                <!-- Sector Custom Dropdown -->
                <div class="paf-form-group">
                    <label class="paf-label">Sector (Micro Market) <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="sectorSelect">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Area First</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="sectorOptionsList">
                            <li data-value="">Select area first</li>
                        </ul>
                    </div>
                    <input type="hidden" id="sectorSelect" value="">
                </div>
                
                <div class="paf-full-width" style="font-size:0.9rem; color:#334155; margin-bottom: 12px;">
                    <span id="locationPreview">📍 City: Gurugram | State: Haryana</span>
                </div>
                <input type="hidden" id="cityHidden" value="Gurugram">
                <input type="hidden" id="stateHidden" value="Haryana">
                <input type="hidden" id="liveStatus" value="active">

                <!-- Basic Details -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Basic Details</h3></div>
                <div class="paf-full-width paf-form-group">
                    <label class="paf-label">Project Name <span style="color:red;">*</span></label>
                    <input id="projectName" class="paf-input" required placeholder="e.g., Smartworld Gems">
                </div>
                <div class="paf-full-width paf-form-group">
                    <label class="paf-label">Slug (auto-generated)</label>
                    <input id="slugField" class="paf-input" readonly placeholder="auto">
                </div>
                <div class="paf-form-group"><label class="paf-label">Developer</label><input id="developer" class="paf-input" placeholder="Builder name"></div>
                <div class="paf-form-group"><label class="paf-label">RERA Number (optional)</label><input id="reraNumber" class="paf-input"></div>
                <div class="paf-form-group"><label class="paf-label">License No (optional)</label><input id="licenseNo" class="paf-input"></div>

                <!-- Project Details -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Project Details</h3></div>
                
                <div class="paf-form-group">
                    <label class="paf-label">Project Type</label>
                    <div class="custom-select-wrapper" data-target="projectType">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Apartment</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="apartment">Apartment</li>
                            <li data-value="villa">Villa</li>
                            <li data-value="plot">Plot</li>
                            <li data-value="commercial">Commercial</li>
                        </ul>
                    </div>
                    <input type="hidden" id="projectType" value="apartment">
                </div>
                
                <div class="paf-form-group">
                    <label class="paf-label">Property Category</label>
                    <div class="custom-select-wrapper" data-target="propertyCategory">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Residential</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="residential">Residential</li>
                            <li data-value="commercial">Commercial</li>
                        </ul>
                    </div>
                    <input type="hidden" id="propertyCategory" value="residential">
                </div>
                
                <div class="paf-form-group">
                    <label class="paf-label">Total Floors</label>
                    <input type="number" id="totalFloors" class="paf-input" placeholder="e.g., 15" value="0">
                </div>
                <div class="paf-form-group"><label class="paf-label">Total Towers / Blocks</label><input type="number" id="totalTowers" class="paf-input" placeholder="e.g., 5"></div>
                <div class="paf-form-group"><label class="paf-label">Units per Floor</label><input type="number" id="unitsPerFloor" class="paf-input" placeholder="e.g., 4"></div>

                <!-- Configurations (dynamic) -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Configurations <button type="button" id="addConfigBtn" class="paf-btn-small">+ Add Configuration</button></h3></div>
                <div id="configurationsContainer" class="paf-full-width"></div>

                <!-- Pricing -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Pricing</h3></div>
                <div class="paf-form-group"><label class="paf-label">Min Price (₹)</label><input type="number" id="minPrice" class="paf-input"></div>
                <div class="paf-form-group"><label class="paf-label">Max Price (₹)</label><input type="number" id="maxPrice" class="paf-input"></div>
                <div class="paf-form-group"><label class="paf-label">Price per sq.ft. (₹)</label><input type="number" id="pricePerSqft" class="paf-input"></div>

                <!-- Connectivity -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Connectivity</h3></div>
                <div id="connectivityList" class="paf-full-width" style="display:flex; flex-direction:column; gap:8px;"></div>
                <div class="paf-full-width"><button type="button" id="addConnectivityBtn" class="paf-btn-small">+ Add Custom Connectivity</button></div>

                <!-- Landmarks -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Landmarks <button type="button" id="addLandmarkBtn" class="paf-btn-small">+ Add Custom</button></h3></div>
                <div id="landmarksList" class="paf-full-width"></div>

                <!-- Amenities -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Amenities</h3></div>
                <div id="amenitiesContainer" class="paf-full-width"></div>
                <div class="paf-full-width"><button type="button" id="addCustomAmenityBtn" class="paf-btn-small">+ Add Custom Amenity</button></div>

                <!-- USP -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">USP / Features</h3></div>
                <div id="uspList" class="paf-full-width" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
                <div class="paf-full-width"><button type="button" id="addUSPBtn" class="paf-btn-small">+ Add Custom USP</button></div>

                <!-- Images -->
                <div class="paf-full-width"><h3 style="margin: 16px 0 12px;">Images</h3></div>
                <div class="paf-full-width">
                    <button type="button" class="paf-btn-secondary" onclick="addProjectImages()">+ Add Images</button>
                    <input type="file" id="projectImageInput" multiple accept="image/*" style="display:none">
                </div>
                <div id="projectImageGrid" class="paf-full-width" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;"></div>

                <!-- Submit buttons -->
                <div class="paf-full-width" style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; margin-bottom:20px;">
                    <button type="button" class="paf-btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="paf-btn-primary">Save Project</button>
                </div>
            </form>
        </div>
    `;

    // ========== INITIALIZE CUSTOM DROPDOWNS ==========
    initCustomDropdownByWrapper(document.querySelector('[data-target="areaSelect"]'), 'areaSelect');
    initCustomDropdownByWrapper(document.querySelector('[data-target="sectorSelect"]'), 'sectorSelect');
    initCustomDropdownByWrapper(document.querySelector('[data-target="projectType"]'), 'projectType');
    initCustomDropdownByWrapper(document.querySelector('[data-target="propertyCategory"]'), 'propertyCategory');

    // ========== AREA & SECTOR LOGIC ==========
    const areaHidden = document.getElementById('areaSelect');
    const sectorHidden = document.getElementById('sectorSelect');
    const sectorOptionsList = document.getElementById('sectorOptionsList');
    const sectorTrigger = document.querySelector('[data-target="sectorSelect"] .selected-value');
    const cityHidden = document.getElementById('cityHidden');
    const stateHidden = document.getElementById('stateHidden');
    const locationPreview = document.getElementById('locationPreview');

    function updateSectors() {
        const areaName = areaHidden.value;
        sectorOptionsList.innerHTML = '';
        if (!areaName) {
            sectorOptionsList.innerHTML = '<li data-value="">Select area first</li>';
            sectorTrigger.innerText = 'Select Area First';
            sectorHidden.value = '';
            return;
        }
        const area = areasData.find(a => a.name === areaName);
        if (area && area.microMarkets && area.microMarkets.length) {
            area.microMarkets.forEach(sec => {
                sectorOptionsList.innerHTML += `<li data-value="${escapeHtml(sec)}">${escapeHtml(sec)}</li>`;
            });
            sectorTrigger.innerText = 'Select Sector';
            cityHidden.value = area.city || 'Gurugram';
            stateHidden.value = area.state || 'Haryana';
            locationPreview.innerText = `📍 City: ${cityHidden.value} | State: ${stateHidden.value}`;
            sectorOptionsList.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', () => {
                    const value = li.getAttribute('data-value');
                    const text = li.innerText;
                    sectorTrigger.innerText = text;
                    sectorHidden.value = value;
                    sectorOptionsList.classList.remove('open');
                    updateSlug();
                });
            });
        } else {
            sectorOptionsList.innerHTML = '<li data-value="">No sectors defined</li>';
            sectorTrigger.innerText = 'No sectors';
        }
    }

    areaHidden.addEventListener('change', () => {
        updateSectors();
        updateSlug();
        populateConnectivityAndUsp(areasData.find(a => a.name === areaHidden.value));
    });

    // ========== AUTO SLUG ==========
    const projectNameInput = document.getElementById('projectName');
    const slugField = document.getElementById('slugField');
    function updateSlug() {
        let slug = (projectNameInput.value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const sector = sectorHidden.value ? sectorHidden.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
        if (sector) slug += '-' + sector;
        slugField.value = slug;
    }
    projectNameInput.addEventListener('input', updateSlug);

    // ========== CONNECTIVITY & USP AUTO-FILL ==========
    function addConnectivityItem(name, distance) {
        const container = document.getElementById('connectivityList');
        const div = document.createElement('div');
        div.className = 'paf-list-item';
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.alignItems = 'center';
        div.innerHTML = `
            <input type="text" class="paf-input list-name" value="${escapeHtml(name)}" placeholder="Name" style="flex:2;">
            <input type="text" class="paf-input list-distance" value="${escapeHtml(distance)}" placeholder="Distance" style="flex:1;">
            <button type="button" class="paf-btn-small remove-item">Remove</button>
        `;
        div.querySelector('.remove-item').addEventListener('click', () => div.remove());
        container.appendChild(div);
    }

    function addUspItem(name) {
        const container = document.getElementById('uspList');
        const span = document.createElement('span');
        span.className = 'paf-selected-chip';
        span.style.cssText = 'background:#3b82f6; color:white; padding:5px 12px; border-radius:40px; display:inline-flex; gap:8px; align-items:center; margin:4px;';
        span.innerHTML = `${escapeHtml(name)} <button type="button" class="remove-usp" style="background:none; border:none; color:white; cursor:pointer;">x</button>`;
        span.querySelector('.remove-usp').addEventListener('click', () => span.remove());
        container.appendChild(span);
    }

    function populateConnectivityAndUsp(area) {
        const connectivityContainer = document.getElementById('connectivityList');
        const uspContainer = document.getElementById('uspList');
        connectivityContainer.innerHTML = '';
        uspContainer.innerHTML = '';
        if (!area) return;
        if (area.connectivity && area.connectivity.length) {
            area.connectivity.forEach(conn => {
                const connName = typeof conn === 'string' ? conn : conn.name;
                const connDistance = (typeof conn === 'object' && conn.distance) ? conn.distance : '';
                addConnectivityItem(connName, connDistance);
            });
        }
        if (area.areaUsp && area.areaUsp.length) {
            area.areaUsp.forEach(usp => {
                addUspItem(usp);
            });
        }
    }

    document.getElementById('addConnectivityBtn').addEventListener('click', () => addConnectivityItem('', ''));
    document.getElementById('addUSPBtn').addEventListener('click', () => {
        const custom = prompt("Enter custom USP:");
        if (custom && custom.trim()) addUspItem(custom.trim());
    });

    // ========== LANDMARKS ==========
    function addLandmarkItem(item = { name: '', distance: '', type: '' }) {
        const container = document.getElementById('landmarksList');
        const div = document.createElement('div');
        div.className = 'paf-list-item';
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.alignItems = 'center';
        div.style.marginBottom = '8px';
        div.innerHTML = `
            <input type="text" class="paf-input list-name" value="${escapeHtml(item.name)}" placeholder="Name" style="flex:2;">
            <input type="text" class="paf-input list-distance" value="${escapeHtml(item.distance)}" placeholder="Distance" style="flex:1;">
            <select class="paf-select list-type" style="flex:1;">
                <option ${item.type==='metro'?'selected':''}>metro</option>
                <option ${item.type==='school'?'selected':''}>school</option>
                <option ${item.type==='mall'?'selected':''}>mall</option>
                <option ${item.type==='hospital'?'selected':''}>hospital</option>
                <option ${item.type==='business'?'selected':''}>business</option>
            </select>
            <button type="button" class="paf-btn-small remove-item">Remove</button>
        `;
        div.querySelector('.remove-item').addEventListener('click', () => div.remove());
        container.appendChild(div);
    }
    document.getElementById('addLandmarkBtn').addEventListener('click', () => addLandmarkItem({}));

    // ========== DYNAMIC CONFIGURATIONS ==========
    let configCounter = 0;
    function addConfigurationBlock(data = null) {
        const container = document.getElementById('configurationsContainer');
        const idx = configCounter++;
        const blockId = `config_${idx}`;
        const sizesHtml = (data?.sizes || []).map(sz => `<span class="paf-size-tag">${sz} <button type="button" class="remove-size">x</button></span>`).join('');
        const html = `
            <div class="paf-config-block" id="${blockId}">
                <div class="paf-form-row">
                    <div class="paf-form-group"><label class="paf-label">Configuration Type <span style="color:red;">*</span></label><input name="config_type_${idx}" class="paf-input" value="${data?.type || ''}" placeholder="e.g., 2 BHK, 3 BHK+Study"></div>
                    <div class="paf-form-group"><label class="paf-label">Bedrooms</label><input type="number" step="0.5" name="config_bedrooms_${idx}" class="paf-input" value="${data?.bedrooms || ''}"></div>
                    <div class="paf-form-group"><label class="paf-label">Bathrooms</label><input type="number" step="0.5" name="config_bathrooms_${idx}" class="paf-input" value="${data?.bathrooms || ''}"></div>
                    <div class="paf-form-group"><label class="paf-label">Balconies</label><input type="number" step="0.5" name="config_balconies_${idx}" class="paf-input" value="${data?.balconies || ''}"></div>
                </div>
                <div class="paf-form-group">
                    <label class="paf-label">Sizes (sq.ft.)</label>
                    <div id="sizes_${idx}" class="paf-size-list">${sizesHtml}</div>
                    <div class="paf-add-size-row"><input type="number" id="newSize_${idx}" class="paf-input" placeholder="Add size" step="1"><button type="button" class="paf-btn-small add-size-btn" data-idx="${idx}">+ Add</button></div>
                </div>
                <button type="button" class="paf-btn-small remove-config">Remove Configuration</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        const block = document.getElementById(blockId);
        block.querySelector('.add-size-btn').addEventListener('click', () => addSizeToConfig(idx));
        block.querySelector('.remove-config').addEventListener('click', () => block.remove());
        block.querySelectorAll('.remove-size').forEach(btn => btn.addEventListener('click', function() { this.parentElement.remove(); }));
    }
    
    function addSizeToConfig(idx) {
        const input = document.getElementById(`newSize_${idx}`);
        const val = input.value.trim();
        if (!val) return;
        const sizesContainer = document.getElementById(`sizes_${idx}`);
        const span = document.createElement('span');
        span.className = 'paf-size-tag';
        span.innerHTML = `${val} <button type="button" class="remove-size">x</button>`;
        span.querySelector('.remove-size').addEventListener('click', () => span.remove());
        sizesContainer.appendChild(span);
        input.value = '';
    }
    
    document.getElementById('addConfigBtn').addEventListener('click', () => addConfigurationBlock());
    addConfigurationBlock();

    // ========== AMENITIES ==========
    const allAmenities = ["24/7 Security", "Power Backup", "High-Speed Elevators", "Ample Parking", "Fire Fighting System", "Piped Gas Connection", "Intercom Facility", "Landscaped Gardens", "Kids’ Play Area", "Senior Citizen Park", "Jogging Track", "Gymnasium", "Swimming Pool", "Clubhouse", "Multipurpose Hall", "Indoor Games Room", "Badminton Court", "Half Basketball Court", "Yoga & Meditation Deck", "Library", "Rainwater Harvesting", "Sewage Treatment Plant", "EV Charging Stations", "CCTV Surveillance", "Smart Home Automation", "Video Door Phone", "Co-working Space", "Mini Theatre", "Pet Park", "Cricket Practice Pitch", "Squash Court", "Spa & Sauna", "Infinity Edge Pool", "Sky Lounge", "Rooftop Garden", "Private Elevator", "Concierge Service", "Valet Parking", "Guest Suites", "Temperature Controlled Pool", "Digital Visitor Management", "Smart Parcel Lockers", "Reflexology Track", "Organic Kitchen Garden", "Business Centre"];
    let amenityOffset = 0;
    const PAGE_SIZE = 10;
    const amenitiesContainer = document.getElementById('amenitiesContainer');
    let selectedAmenities = new Set();

    function renderAmenities() {
        const visible = allAmenities.slice(0, amenityOffset + PAGE_SIZE);
        let html = `<div style="display:flex; flex-wrap:wrap; gap:8px;">`;
        visible.forEach(amen => {
            const alreadySelected = selectedAmenities.has(amen);
            html += `<span class="paf-amenity-option ${alreadySelected ? 'selected' : ''}" data-name="${escapeHtml(amen)}" style="background:${alreadySelected ? '#3b82f6' : '#e2e8f0'}; color:${alreadySelected ? 'white' : '#1e293b'}; padding:5px 14px; border-radius:40px; cursor:pointer;">${amen}</span>`;
        });
        html += `</div>`;
        if (amenityOffset + PAGE_SIZE < allAmenities.length) {
            html += `<button type="button" id="loadMoreAmenitiesBtn" class="paf-btn-small" style="margin-top:10px;">+ Load More Amenities</button>`;
        } else {
            html += `<p style="margin-top:10px;">✅ All amenities loaded</p>`;
        }
        let selectedHtml = `<div style="margin-top:15px;"><strong>Selected Amenities:</strong><div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">`;
        selectedAmenities.forEach(amen => {
            selectedHtml += `<span class="paf-selected-chip" style="background:#3b82f6; color:white; padding:5px 12px; border-radius:40px;">${amen} <button type="button" class="paf-remove-chip" data-name="${escapeHtml(amen)}" style="background:none; border:none; color:white; margin-left:6px; cursor:pointer;">x</button></span>`;
        });
        selectedHtml += `</div></div>`;
        amenitiesContainer.innerHTML = html + selectedHtml;
        
        document.querySelectorAll('.paf-amenity-option').forEach(el => {
            el.removeEventListener('click', amenityClickHandler);
            el.addEventListener('click', amenityClickHandler);
        });
        document.querySelectorAll('.paf-remove-chip').forEach(btn => {
            btn.removeEventListener('click', removeHandler);
            btn.addEventListener('click', removeHandler);
        });
        
        function amenityClickHandler(e) {
            const name = e.currentTarget.getAttribute('data-name');
            if (!selectedAmenities.has(name)) { selectedAmenities.add(name); renderAmenities(); }
        }
        function removeHandler(e) {
            e.stopPropagation();
            const name = e.currentTarget.getAttribute('data-name');
            selectedAmenities.delete(name);
            renderAmenities();
        }
        
        const loadMore = document.getElementById('loadMoreAmenitiesBtn');
        if (loadMore) {
            loadMore.removeEventListener('click', loadMoreHandler);
            loadMore.addEventListener('click', loadMoreHandler);
        }
        function loadMoreHandler() { amenityOffset += PAGE_SIZE; renderAmenities(); }
    }
    renderAmenities();
    
    document.getElementById('addCustomAmenityBtn').addEventListener('click', () => {
        const custom = prompt("Enter custom amenity name:");
        if (custom && custom.trim()) {
            const amen = custom.trim();
            if (!selectedAmenities.has(amen)) { selectedAmenities.add(amen); renderAmenities(); }
            else alert("Already added");
        }
    });

    // ========== IMAGE UPLOAD ==========
    const imageInput = document.getElementById('projectImageInput');
    const imageGrid = document.getElementById('projectImageGrid');
    window.addProjectImages = function() { imageInput.click(); };
    function handleProjectImageSelect(event) {
        const files = Array.from(event.target.files);
        projectUploadedFiles.push(...files);
        refreshProjectImageGrid();
    }
    function removeProjectImage(index) {
        projectUploadedFiles.splice(index, 1);
        refreshProjectImageGrid();
    }
    function refreshProjectImageGrid() {
        if (!imageGrid) return;
        imageGrid.innerHTML = '';
        if (projectUploadedFiles.length === 0) {
            imageGrid.innerHTML = '<p class="paf-image-placeholder">No images uploaded yet.</p>';
            return;
        }
        projectUploadedFiles.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'paf-image-item';
                div.style.position = 'relative';
                div.style.display = 'inline-block';
                div.style.margin = '5px';
                div.innerHTML = `<img src="${e.target.result}" alt="preview" style="width:100px; height:100px; object-fit:cover; border-radius:16px;"><button class="paf-remove-img" data-idx="${idx}" style="position:absolute; top:-5px; right:-5px;">×</button>`;
                div.querySelector('.paf-remove-img').addEventListener('click', () => removeProjectImage(idx));
                imageGrid.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }
    imageInput.addEventListener('change', handleProjectImageSelect);
    refreshProjectImageGrid();

    // ========== SUBMIT HANDLER ==========
    async function submitProjectFormUpgraded(e) {
        e.preventDefault();
        
        // Get all values
        const area = areaHidden.value;
        const sector = sectorHidden.value;
        if (!area || !sector) { showToast("Please select Area and Sector", true); return; }
        
        const name = document.getElementById('projectName').value;
        if (!name) { showToast("Project name required", true); return; }
        
        const slug = slugField.value;
        const developer = document.getElementById('developer').value || "";
        const reraNumber = document.getElementById('reraNumber').value || "";
        const licenseNo = document.getElementById('licenseNo').value || "";
        const projectType = document.getElementById('projectType').value;
        const propertyCategory = document.getElementById('propertyCategory').value;
        const totalFloors = document.getElementById('totalFloors').value ? parseInt(document.getElementById('totalFloors').value) : 0;
        const totalTowers = document.getElementById('totalTowers').value ? parseInt(document.getElementById('totalTowers').value) : undefined;
        const unitsPerFloor = document.getElementById('unitsPerFloor').value ? parseInt(document.getElementById('unitsPerFloor').value) : undefined;
        const minPrice = document.getElementById('minPrice').value ? parseInt(document.getElementById('minPrice').value) : 0;
        const maxPrice = document.getElementById('maxPrice').value ? parseInt(document.getElementById('maxPrice').value) : 0;
        const pricePerSqft = document.getElementById('pricePerSqft').value ? parseInt(document.getElementById('pricePerSqft').value) : 0;
        
        // Configurations
        const configurations = [];
        document.querySelectorAll('.paf-config-block').forEach(block => {
            const idMatch = block.id.match(/\d+$/);
            if (idMatch) {
                const idx = idMatch[0];
                const type = document.querySelector(`[name="config_type_${idx}"]`)?.value;
                if (!type) return;
                const bedrooms = parseFloat(document.querySelector(`[name="config_bedrooms_${idx}"]`)?.value) || 0;
                const bathrooms = parseFloat(document.querySelector(`[name="config_bathrooms_${idx}"]`)?.value) || 0;
                const balconies = parseFloat(document.querySelector(`[name="config_balconies_${idx}"]`)?.value) || 0;
                const sizes = Array.from(block.querySelectorAll('.paf-size-tag')).map(tag => parseFloat(tag.innerText.replace('x', '').trim()));
                configurations.push({ type, bedrooms, bathrooms, balconies, sizes });
            }
        });
        
        // Connectivity
        const connectivity = Array.from(document.querySelectorAll('#connectivityList .paf-list-item')).map(item => ({
            name: item.querySelector('.list-name').value,
            distance: item.querySelector('.list-distance')?.value || ''
        })).filter(c => c.name);
        
        // Landmarks
        const landmarks = Array.from(document.querySelectorAll('#landmarksList .paf-list-item')).map(item => ({
            name: item.querySelector('.list-name').value,
            distance: item.querySelector('.list-distance')?.value || '',
            type: item.querySelector('.list-type')?.value || 'other'
        })).filter(l => l.name);
        
        // USP
        const usp = Array.from(document.querySelectorAll('#uspList .paf-selected-chip')).map(chip => {
            const text = chip.childNodes[0]?.textContent?.trim() || '';
            return text;
        }).filter(u => u);
        
        // Amenities
        const amenitiesList = Array.from(selectedAmenities);
        const amenities = {
            sports: amenitiesList.filter(a => ['Gymnasium', 'Swimming Pool', 'Badminton Court', 'Half Basketball Court', 'Squash Court', 'Cricket Practice Pitch', 'Yoga & Meditation Deck'].includes(a)),
            family: amenitiesList.filter(a => ['Kids’ Play Area', 'Clubhouse', 'Multipurpose Hall', 'Indoor Games Room', 'Library', 'Mini Theatre', 'Co-working Space', 'Pet Park', 'Senior Citizen Park', 'Jogging Track', 'Landscaped Gardens'].includes(a)),
            safety: amenitiesList.filter(a => ['24/7 Security', 'Fire Fighting System', 'CCTV Surveillance', 'Video Door Phone', 'Digital Visitor Management', 'Smart Parcel Lockers'].includes(a)),
            environment: amenitiesList.filter(a => ['Power Backup', 'High-Speed Elevators', 'Ample Parking', 'Piped Gas Connection', 'Intercom Facility', 'Rainwater Harvesting', 'Sewage Treatment Plant', 'EV Charging Stations', 'Smart Home Automation', 'Temperature Controlled Pool', 'Reflexology Track', 'Organic Kitchen Garden'].includes(a))
        };
        const allGrouped = [...amenities.sports, ...amenities.family, ...amenities.safety, ...amenities.environment];
        const others = amenitiesList.filter(a => !allGrouped.includes(a));
        if (others.length) amenities.other = others;
        
        // Images
        let imageUrls = [];
        if (projectUploadedFiles.length) {
            const formData = new FormData();
            projectUploadedFiles.forEach(f => formData.append('images', f));
            try {
                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrls = uploadData.urls || [];
                } else {
                    showToast('Image upload failed', true);
                    return;
                }
            } catch (err) {
                showToast('Image upload error', true);
                return;
            }
        }
        
        const payload = {
            name, slug, developer, liveStatus: 'active',
            area, sector,
            location: { city: cityHidden.value, state: stateHidden.value, sector },
            rera: { number: reraNumber, licenseNo },
            totalFloors, totalTowers, unitsPerFloor,
            projectType, propertyCategory,
            configurations,
            pricingMeta: { minPrice, maxPrice, pricePerSqft },
            connectivity, landmarks,
            amenities,
            features: { usp },
            media: { images: imageUrls }
        };
        
        try {
            const res = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            showToast('Project added successfully');
            closeModal();
            if (typeof fetchAllData === 'function') await fetchAllData();
            if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
            else if (window.refreshCurrentPage) window.refreshCurrentPage();
            else location.reload();
        } catch (err) {
            showToast(err.message, true);
        }
    }
    
    document.getElementById('addProjectForm').addEventListener('submit', submitProjectFormUpgraded);
}

function initCustomDropdownByWrapper(wrapper, hiddenInputId) {
    if (!wrapper) return;
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const optionsList = wrapper.querySelector('.custom-options');
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!trigger || !optionsList || !hiddenInput) return;
    
    const initialValue = hiddenInput.value;
    if (initialValue) {
        const selectedOption = optionsList.querySelector(`li[data-value="${initialValue}"]`);
        if (selectedOption) {
            trigger.querySelector('.selected-value').innerText = selectedOption.innerText;
        }
    }
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-options').forEach(opt => {
            if (opt !== optionsList) opt.classList.remove('open');
        });
        optionsList.classList.toggle('open');
    });
    
    optionsList.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.innerText;
            trigger.querySelector('.selected-value').innerText = text;
            hiddenInput.value = value;
            optionsList.classList.remove('open');
            const changeEvent = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(changeEvent);
        });
    });
}

document.addEventListener('click', () => {
    document.querySelectorAll('.custom-options').forEach(opt => {
        opt.classList.remove('open');
    });
});



// ==================== PROPERTY WIZARD (STEP 1: PURPOSE & TYPE, RENT hides PLOT) ====================
function renderPropertyStep(step, container) {
    if (step === 1) {
        // Step 1: Purpose & Property Type with custom dropdowns
        container.innerHTML = `
            <div class="step-indicator"><div class="step active">Step 1</div><div class="step">Step 2</div><div class="step">Step 3</div></div>
            <form id="propertyStep1Form" class="form-grid">
                <div class="form-group">
                    <label>Purpose <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="propPurpose">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Purpose</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="sell">Sell</li>
                            <li data-value="rent">Rent</li>
                        </ul>
                    </div>
                    <input type="hidden" name="purpose" id="propPurpose" value="">
                </div>
                <div class="form-group">
                    <label>Property Type <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="propType">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Property Type</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="propTypeOptions">
                            <li data-value="">Select purpose first</li>
                        </ul>
                    </div>
                    <input type="hidden" name="propertyType" id="propType" value="">
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="button" class="btn-primary" id="propStep1Next">Next</button>
                </div>
            </form>
        `;

        // Initialize custom dropdowns
        initCustomDropdownByWrapper(document.querySelector('#propertyStep1Form .custom-select-wrapper[data-target="propPurpose"]'), 'propPurpose');
        initCustomDropdownByWrapper(document.querySelector('#propertyStep1Form .custom-select-wrapper[data-target="propType"]'), 'propType');

        const purposeHidden = document.getElementById('propPurpose');
        const typeOptions = document.getElementById('propTypeOptions');
        const typeTrigger = document.querySelector('#propertyStep1Form .custom-select-wrapper[data-target="propType"] .selected-value');
        const typeHidden = document.getElementById('propType');

        function updateTypeOptions() {
            const purpose = purposeHidden.value;
            typeOptions.innerHTML = '';
            if (purpose === 'sell') {
                typeOptions.innerHTML = `
                    <li data-value="apartment">Apartment</li>
                    <li data-value="builderfloor">Builder Floor</li>
                    <li data-value="plot">Plot</li>
                `;
            } else if (purpose === 'rent') {
                typeOptions.innerHTML = `
                    <li data-value="apartment">Apartment</li>
                    <li data-value="builderfloor">Builder Floor</li>
                `;
            } else {
                typeOptions.innerHTML = '<li data-value="">Select purpose first</li>';
            }
            typeOptions.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', () => {
                    const value = li.getAttribute('data-value');
                    const text = li.innerText;
                    typeTrigger.innerText = text;
                    typeHidden.value = value;
                    typeOptions.classList.remove('open');
                });
            });
        }

        purposeHidden.addEventListener('change', updateTypeOptions);
        updateTypeOptions();

        document.getElementById('propStep1Next').addEventListener('click', (e) => {
            e.preventDefault();
            const purpose = purposeHidden.value;
            const propertyType = typeHidden.value;
            if (!purpose || !propertyType) {
                showToast('Please select both purpose and property type', true);
                return;
            }
            propertyFormState.data = { purpose, propertyType };
            renderPropertyStep(2, container);
        });
        return;
    }
    else if (step === 2) {
        const data = propertyFormState.data;
        const propertyType = data.propertyType;
        const purpose = data.purpose;

        let html = `<div class="step-indicator"><div class="step" onclick="renderPropertyStep(1, document.getElementById('modalBody'))">Step 1</div><div class="step active">Step 2</div><div class="step">Step 3</div></div>`;
        html += `<form id="propertyStep2Form" class="form-grid">`;

        // --------------------------------------------------------------
        // APARTMENT
        if (propertyType === 'apartment') {
            const areaOptions = areasData.map(a => `<li data-value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</li>`).join('');
            html += `
                <div class="form-group">
                    <label>Area <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="propArea">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select Area</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">${areaOptions}</ul>
                    </div>
                    <input type="hidden" name="area" id="propArea" value="${data.area || ''}">
                </div>
                <div class="form-group">
                    <label>Project <span style="color:red;">*</span></label>
                    <div class="custom-select-wrapper" data-target="propProject">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select area first</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="projectOptionsList">
                            <li data-value="">Select area first</li>
                        </ul>
                    </div>
                    <input type="hidden" name="projectId" id="propProject" value="">
                </div>
                <div class="form-group">
                    <label>Configuration</label>
                    <div class="custom-select-wrapper" data-target="propConfig">
                        <div class="custom-select-trigger">
                            <span class="selected-value">Select configuration</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options" id="configOptionsList">
                            <li data-value="">Select project first</li>
                        </ul>
                    </div>
                    <input type="hidden" name="configuration" id="propConfig" value="">
                </div>
                <div class="form-group"><label>Bedrooms</label><input name="bedrooms" type="number" step="0.5" readonly value="${data.bedrooms || ''}"></div>
                <div class="form-group"><label>Bathrooms</label><input name="bathrooms" type="number" readonly value="${data.bathrooms || ''}"></div>
                <div class="form-group"><label>Balconies</label><input name="balconies" type="number" readonly value="${data.balconies || ''}"></div>
                <div id="apartmentSizeContainer" class="form-group">
                    <label>Size (sqft) <span style="color:red;">*</span></label>
                    <select id="apartmentSizeSelect" class="paf-input" disabled>
                        <option value="">Select configuration first</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Furnishing</label>
                    <div class="custom-select-wrapper" data-target="propFurnishing">
                        <div class="custom-select-trigger">
                            <span class="selected-value">${data.furnishing || 'Semi-furnished'}</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <ul class="custom-options">
                            <li data-value="Unfurnished">Unfurnished</li>
                            <li data-value="Semi-furnished">Semi-furnished</li>
                            <li data-value="Fully furnished">Fully furnished</li>
                        </ul>
                    </div>
                    <input type="hidden" name="furnishing" id="propFurnishing" value="${data.furnishing || 'Semi-furnished'}">
                </div>
                <div class="form-group"><label>Covered Parking</label><input name="coveredParking" type="number" value="${data.coveredParking || '1'}"></div>
                <div class="form-group"><label>Open Parking</label><input name="openParking" type="number" value="${data.openParking || '0'}"></div>
                <div class="form-group"><label>Total Floors</label><input name="totalFloors" type="number" readonly value="${data.totalFloors || ''}"></div>
                <div class="form-group"><label>Current Floor</label><input name="floor" type="number" placeholder="e.g., 3" value="${data.floor || ''}"></div>`;
            if (purpose === 'sell') {
                html += `<div class="form-group">
                            <label>Availability Status</label>
                            <div class="custom-select-wrapper" data-target="propAvailability">
                                <div class="custom-select-trigger">
                                    <span class="selected-value">${data.availabilityStatus || 'ready_to_move'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <ul class="custom-options">
                                    <li data-value="ready_to_move">Ready to move</li>
                                    <li data-value="under_construction">Under construction</li>
                                </ul>
                            </div>
                            <input type="hidden" name="availabilityStatus" id="propAvailability" value="${data.availabilityStatus || 'ready_to_move'}">
                        </div>
                        <div class="form-group"><label>Age (years)</label><input name="age" type="number" step="0.5" value="${data.age || ''}"></div>`;
            } else {
                html += `<div class="form-group"><label>Available From</label><input type="date" name="availableFrom" value="${data.availableFrom || ''}"></div>
                         <div class="form-group"><label>Age (years)</label><input name="age" type="number" step="0.5" value="${data.age || ''}"></div>`;
            }
        }
        // --------------------------------------------------------------
        // BUILDER FLOOR (custom dropdowns)
        else if (propertyType === 'builderfloor') {
            const areaOptions = areasData.map(a => `<li data-value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</li>`).join('');
            const structureOptions = ['2 floor', '2+Stilt', '3 floor', '3+Stilt', '4 floor', '4+stilt', '4+'];
            let structHtml = '';
            structureOptions.forEach(opt => structHtml += `<li data-value="${opt}">${opt}</li>`);
            
            html += `
                <div class="form-row">
                    <div class="form-group">
                        <label>Area <span style="color:red;">*</span></label>
                        <div class="custom-select-wrapper" data-target="propAreaBF">
                            <div class="custom-select-trigger">
                                <span class="selected-value">${data.area || 'Select Area'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="custom-options">${areaOptions}</ul>
                        </div>
                        <input type="hidden" name="area" id="propAreaBF" value="${data.area || ''}">
                    </div>
                    <div class="form-group"><label>Society / Building Name <span style="color:red;">*</span></label><input name="societyName" required placeholder="e.g., Sunrise Apartments" value="${escapeHtml(data.societyName || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Bedrooms <span style="color:red;">*</span></label><input name="bedrooms" type="number" step="1" required placeholder="e.g., 3" value="${escapeHtml(data.bedrooms || '')}"></div>
                    <div class="form-group"><label>Bathrooms <span style="color:red;">*</span></label><input name="bathrooms" type="number" step="1" required placeholder="e.g., 3" value="${escapeHtml(data.bathrooms || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Size (sqyd) <span style="color:red;">*</span></label><input name="size" type="number" step="any" required placeholder="Size in square yards" value="${escapeHtml(data.size || '')}"></div>
                    <div class="form-group">
                        <label>Building Structure</label>
                        <div class="custom-select-wrapper" data-target="propStructure">
                            <div class="custom-select-trigger">
                                <span class="selected-value">${data.buildingStructure || '2 floor'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="custom-options">${structHtml}</ul>
                        </div>
                        <input type="hidden" name="buildingStructure" id="propStructure" value="${data.buildingStructure || '2 floor'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Total Floors in Building <span style="color:red;">*</span></label><input name="totalFloors" type="number" required placeholder="e.g., 5" value="${escapeHtml(data.totalFloors || '')}"></div>
                    <div class="form-group"><label>Unit Floor Number <span style="color:red;">*</span></label><input name="floorNumber" type="number" required placeholder="e.g., 3" value="${escapeHtml(data.floorNumber || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Age (years)</label><input name="age" type="number" step="0.5" placeholder="e.g., 5" value="${escapeHtml(data.age || '')}"></div>
                    <div class="form-group"><label>Expected Price (₹) <span style="color:red;">*</span></label><input name="expectedPrice" type="number" required placeholder="e.g., 8500000" value="${escapeHtml(data.expectedPrice || '')}"></div>
                </div>`;
            if (purpose === 'sell') {
                html += `<div class="form-row">
                            <div class="form-group">
                                <label>Negotiable?</label>
                                <div class="custom-select-wrapper" data-target="propNegotiable">
                                    <div class="custom-select-trigger">
                                        <span class="selected-value">${data.negotiable || 'No'}</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </div>
                                    <ul class="custom-options">
                                        <li data-value="No">No</li>
                                        <li data-value="Yes">Yes</li>
                                    </ul>
                                </div>
                                <input type="hidden" name="negotiable" id="propNegotiable" value="${data.negotiable || 'No'}">
                            </div>
                            <div class="form-group"><label>Exact Price (if negotiable)</label><input name="exactPrice" placeholder="₹" value="${escapeHtml(data.exactPrice || '')}"></div>
                        </div>`;
            } else {
                html += `<div class="form-row">
                            <div class="form-group"><label>Security Amount (₹)</label><input name="securityAmount" type="number" placeholder="e.g., 100000" value="${escapeHtml(data.securityAmount || '')}"></div>
                            <div class="form-group"><label>Available From</label><input type="date" name="availableFrom" value="${escapeHtml(data.availableFrom || '')}"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Notice Period (months)</label>
                                <div class="custom-select-wrapper" data-target="propNoticePeriod">
                                    <div class="custom-select-trigger">
                                        <span class="selected-value">${data.noticePeriod || '1'}</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </div>
                                    <ul class="custom-options">
                                        <li data-value="1">1</li>
                                        <li data-value="2">2</li>
                                        <li data-value="3">3</li>
                                    </ul>
                                </div>
                                <input type="hidden" name="noticePeriod" id="propNoticePeriod" value="${data.noticePeriod || '1'}">
                            </div>
                            <div class="form-group">
                                <label>Rent Duration (months)</label>
                                <div class="custom-select-wrapper" data-target="propRentDuration">
                                    <div class="custom-select-trigger">
                                        <span class="selected-value">${data.rentDuration || '12'}</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </div>
                                    <ul class="custom-options">
                                        ${[...Array(24)].map((_, i) => `<li data-value="${i+1}">${i+1}</li>`).join('')}
                                    </ul>
                                </div>
                                <input type="hidden" name="rentDuration" id="propRentDuration" value="${data.rentDuration || '12'}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Negotiable?</label>
                                <div class="custom-select-wrapper" data-target="propNegotiableRent">
                                    <div class="custom-select-trigger">
                                        <span class="selected-value">${data.negotiable || 'No'}</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </div>
                                    <ul class="custom-options">
                                        <li data-value="No">No</li>
                                        <li data-value="Yes">Yes</li>
                                    </ul>
                                </div>
                                <input type="hidden" name="negotiable" id="propNegotiableRent" value="${data.negotiable || 'No'}">
                            </div>
                        </div>`;
            }
        }
        // --------------------------------------------------------------
        // PLOT (custom dropdowns)
        else if (propertyType === 'plot') {
            const areaOptions = areasData.map(a => `<li data-value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</li>`).join('');
            html += `
                <div class="form-row">
                    <div class="form-group">
                        <label>Area <span style="color:red;">*</span></label>
                        <div class="custom-select-wrapper" data-target="propAreaPlot">
                            <div class="custom-select-trigger">
                                <span class="selected-value">${data.area || 'Select Area'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="custom-options">${areaOptions}</ul>
                        </div>
                        <input type="hidden" name="area" id="propAreaPlot" value="${data.area || ''}">
                    </div>
                    <div class="form-group"><label>Society / Project Name (optional)</label><input name="societyName" placeholder="e.g., Green Valley" value="${escapeHtml(data.societyName || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Plot Area (sqyd) <span style="color:red;">*</span></label><input type="number" name="plotArea" step="any" required placeholder="e.g., 300" value="${escapeHtml(data.plotArea || '')}"></div>
                    <div class="form-group"><label>Floors Allowed</label><input type="number" name="floorsAllowed" placeholder="e.g., 2" value="${escapeHtml(data.floorsAllowed || '')}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Boundary Wall</label>
                        <div class="custom-select-wrapper" data-target="propBoundary">
                            <div class="custom-select-trigger">
                                <span class="selected-value">${data.boundary || 'Yes'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="custom-options">
                                <li data-value="Yes">Yes</li>
                                <li data-value="No">No</li>
                            </ul>
                        </div>
                        <input type="hidden" name="boundary" id="propBoundary" value="${data.boundary || 'Yes'}">
                    </div>
                    <div class="form-group">
                        <label>Open Sides</label>
                        <div class="custom-select-wrapper" data-target="propOpenSides">
                            <div class="custom-select-trigger">
                                <span class="selected-value">${data.openSides || '1'}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <ul class="custom-options">
                                <li data-value="1">1</li>
                                <li data-value="2">2</li>
                                <li data-value="3">3</li>
                                <li data-value="4">4</li>
                            </ul>
                        </div>
                        <input type="hidden" name="openSides" id="propOpenSides" value="${data.openSides || '1'}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Expected Price (₹) <span style="color:red;">*</span></label><input type="number" name="expectedPrice" step="any" required placeholder="e.g., 25000000" value="${escapeHtml(data.expectedPrice || '')}"></div>
                    <div class="form-group"><label>Price per sqyd (₹)</label><input type="text" id="pricePerSqyd" readonly placeholder="Auto-calculated"></div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width"><label>Age (years)</label><input type="number" name="age" step="0.5" placeholder="e.g., 5" value="${escapeHtml(data.age || '')}"></div>
                </div>`;
        }

        html += `<div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button><button type="button" class="btn-secondary" onclick="renderPropertyStep(1, document.getElementById('modalBody'))">Back</button><button type="submit" class="btn-primary">Next</button></div></form>`;
        container.innerHTML = html;

        // Initialize all custom dropdowns for step 2
        document.querySelectorAll('#propertyStep2Form .custom-select-wrapper').forEach(wrapper => {
            const targetId = wrapper.getAttribute('data-target');
            const hiddenInputId = `${targetId}`;
            initCustomDropdownByWrapper(wrapper, hiddenInputId);
        });

        // Attach events
        if (propertyType === 'apartment') {
            attachApartmentEventsCustom();
        } else if (propertyType === 'plot') {
            // Price per sqyd calculation
            const plotPriceInput = document.querySelector('input[name="expectedPrice"]');
            const plotAreaInput = document.querySelector('input[name="plotArea"]');
            const pricePerSqyd = document.getElementById('pricePerSqyd');
            if (plotPriceInput && plotAreaInput && pricePerSqyd) {
                const updatePricePerSqyd = () => {
                    const price = parseFloat(plotPriceInput.value);
                    const area = parseFloat(plotAreaInput.value);
                    if (!isNaN(price) && !isNaN(area) && area !== 0) {
                        pricePerSqyd.value = Math.round(price / area).toLocaleString();
                    } else {
                        pricePerSqyd.value = '';
                    }
                };
                plotPriceInput.addEventListener('input', updatePricePerSqyd);
                plotAreaInput.addEventListener('input', updatePricePerSqyd);
            }
        }

        document.getElementById('propertyStep2Form').addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            for (let [k, v] of fd.entries()) propertyFormState.data[k] = v;
            renderPropertyStep(3, container);
        });
        return;
    }
    else if (step === 3) {
        const data = propertyFormState.data;
        const propertyType = data.propertyType;
        const purpose = data.purpose;
        let html = `<div class="step-indicator"><div class="step" onclick="renderPropertyStep(1, document.getElementById('modalBody'))">Step 1</div><div class="step" onclick="renderPropertyStep(2, document.getElementById('modalBody'))">Step 2</div><div class="step active">Step 3</div></div>`;
        html += `<form id="propertyStep3Form" class="form-grid">`;
        html += `<div class="full-width form-group"><label>Images</label><div class="image-grid" id="imageGrid"></div><button type="button" class="btn-secondary" onclick="addImages()">+ Add Images</button><input type="file" id="hiddenFileInput" multiple accept="image/*" style="display:none" onchange="handleFileSelect(event)"></div>`;

        if (propertyType === 'apartment') {
            const isSell = purpose === 'sell';
            html += `<div class="form-group"><label>${isSell ? 'Expected Price (₹)' : 'Expected Rent (₹/month)'} <span style="color:red;">*</span></label><input name="expectedPrice" type="number" required step="any" value="${escapeHtml(data.expectedPrice || '')}"></div>`;
            if (isSell) {
                html += `<div class="form-group"><label>Price per sqft</label><input name="pricePerSqft" readonly></div>
                         <div class="form-group">
                            <label>Negotiable?</label>
                            <div class="custom-select-wrapper" data-target="propNegotiableStep3">
                                <div class="custom-select-trigger">
                                    <span class="selected-value">${data.negotiable || 'No'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <ul class="custom-options">
                                    <li data-value="No">No</li>
                                    <li data-value="Yes">Yes</li>
                                </ul>
                            </div>
                            <input type="hidden" name="negotiable" id="propNegotiableStep3" value="${data.negotiable || 'No'}">
                         </div>
                         <div class="form-group"><label>Exact Price</label><input name="exactPrice" value="${escapeHtml(data.exactPrice || '')}"></div>`;
            } else {
                html += `<div class="form-group"><label>Security Amount (₹)</label><input name="securityAmount" type="number" required value="${escapeHtml(data.securityAmount || '')}"></div>
                         <div class="form-group">
                            <label>Notice Period (months)</label>
                            <div class="custom-select-wrapper" data-target="propNoticePeriodStep3">
                                <div class="custom-select-trigger">
                                    <span class="selected-value">${data.noticePeriod || '1'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <ul class="custom-options">
                                    <li data-value="1">1</li>
                                    <li data-value="2">2</li>
                                    <li data-value="3">3</li>
                                </ul>
                            </div>
                            <input type="hidden" name="noticePeriod" id="propNoticePeriodStep3" value="${data.noticePeriod || '1'}">
                         </div>
                         <div class="form-group">
                            <label>Rent Duration (months)</label>
                            <div class="custom-select-wrapper" data-target="propRentDurationStep3">
                                <div class="custom-select-trigger">
                                    <span class="selected-value">${data.rentDuration || '12'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <ul class="custom-options">
                                    ${[...Array(24)].map((_, i) => `<li data-value="${i+1}">${i+1}</li>`).join('')}
                                </ul>
                            </div>
                            <input type="hidden" name="rentDuration" id="propRentDurationStep3" value="${data.rentDuration || '12'}">
                         </div>
                         <div class="form-group">
                            <label>Negotiable?</label>
                            <div class="custom-select-wrapper" data-target="propNegotiableStep3Rent">
                                <div class="custom-select-trigger">
                                    <span class="selected-value">${data.negotiable || 'No'}</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <ul class="custom-options">
                                    <li data-value="No">No</li>
                                    <li data-value="Yes">Yes</li>
                                </ul>
                            </div>
                            <input type="hidden" name="negotiable" id="propNegotiableStep3Rent" value="${data.negotiable || 'No'}">
                         </div>`;
            }
        } else if (propertyType === 'builderfloor') {
            html += `<div class="full-width form-group"><label>Additional Notes</label><textarea name="notes" rows="2"></textarea></div>`;
        } else if (propertyType === 'plot') {
            html += `<div class="full-width form-group"><label>Additional Notes</label><textarea name="notes" rows="2"></textarea></div>`;
        }

        html += `<div class="modal-actions"><button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button><button type="button" class="btn-secondary" onclick="renderPropertyStep(2, document.getElementById('modalBody'))">Back</button><button type="submit" class="btn-primary">Save Property</button></div></form>`;
        container.innerHTML = html;
        
        // Initialize step 3 custom dropdowns
        document.querySelectorAll('#propertyStep3Form .custom-select-wrapper').forEach(wrapper => {
            const targetId = wrapper.getAttribute('data-target');
            const hiddenInputId = `${targetId}`;
            initCustomDropdownByWrapper(wrapper, hiddenInputId);
        });
        
        refreshImageGrid();
        document.getElementById('propertyStep3Form').addEventListener('submit', handlePropertySubmit);
        return;
    }
}


function initCustomDropdownByWrapper(wrapper, hiddenInputId) {
    if (!wrapper) return;
    
    const trigger = wrapper.querySelector('.custom-select-trigger');
    const optionsList = wrapper.querySelector('.custom-options');
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (!trigger || !optionsList || !hiddenInput) return;
    
    const initialValue = hiddenInput.value;
    if (initialValue) {
        const selectedOption = optionsList.querySelector(`li[data-value="${initialValue}"]`);
        if (selectedOption) {
            trigger.querySelector('.selected-value').innerText = selectedOption.innerText;
        }
    }
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-options').forEach(opt => {
            if (opt !== optionsList) opt.classList.remove('open');
        });
        optionsList.classList.toggle('open');
    });
    
    optionsList.querySelectorAll('li').forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.innerText;
            trigger.querySelector('.selected-value').innerText = text;
            hiddenInput.value = value;
            optionsList.classList.remove('open');
            
            const changeEvent = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(changeEvent);
        });
    });
}

document.addEventListener('click', () => {
    document.querySelectorAll('.custom-options').forEach(opt => {
        opt.classList.remove('open');
    });
});

// Apartment dynamic events (area -> project -> config -> size dropdown)
function attachApartmentEventsCustom() {
    const areaHidden = document.getElementById('propArea');
    const projectHidden = document.getElementById('propProject');
    const configHidden = document.getElementById('propConfig');
    const projectOptionsList = document.getElementById('projectOptionsList');
    const configOptionsList = document.getElementById('configOptionsList');
    const projectTrigger = document.querySelector('#propertyStep2Form .custom-select-wrapper[data-target="propProject"] .selected-value');
    const configTrigger = document.querySelector('#propertyStep2Form .custom-select-wrapper[data-target="propConfig"] .selected-value');
    let selectedProject = null;

    function getSizeContainer() {
        let container = document.getElementById('apartmentSizeContainer');
        if (!container) {
            const form = document.getElementById('propertyStep2Form');
            const modalActions = form?.querySelector('.modal-actions');
            container = document.createElement('div');
            container.className = 'form-group';
            container.id = 'apartmentSizeContainer';
            container.innerHTML = `<label>Size (sqft) <span style="color:red;">*</span></label>`;
            if (modalActions) form.insertBefore(container, modalActions);
            else form.appendChild(container);
        }
        return container;
    }

    function createSizeDropdown(sizes) {
        const container = getSizeContainer();
        container.innerHTML = `
            <label>Size (sqft) <span style="color:red;">*</span></label>
            <select id="apartmentSizeSelect" name="size" class="paf-input" required>
                <option value="">Select size</option>
                ${sizes.map(sz => `<option value="${sz}">${sz} sqft</option>`).join('')}
            </select>
        `;
    }

    function createSizeInput() {
        const container = getSizeContainer();
        container.innerHTML = `
            <label>Size (sqft) <span style="color:red;">*</span></label>
            <input type="number" id="apartmentSizeSelect" name="size" class="paf-input" placeholder="Enter size in sqft" step="any" required>
        `;
    }

    function resetSizeField() {
        const container = getSizeContainer();
        container.innerHTML = `
            <label>Size (sqft) <span style="color:red;">*</span></label>
            <select id="apartmentSizeSelect" class="paf-input" disabled>
                <option value="">Select project and configuration first</option>
            </select>
        `;
    }

    function updateProjects() {
        const area = areaHidden.value;
        if (!area) {
            projectOptionsList.innerHTML = '<li data-value="">Select area first</li>';
            return;
        }
        const filtered = projectsData.filter(p => p.area === area);
        projectOptionsList.innerHTML = '';
        if (filtered.length) {
            filtered.forEach(p => {
                projectOptionsList.innerHTML += `<li data-value="${p._id}">${escapeHtml(p.name)}</li>`;
            });
        } else {
            projectOptionsList.innerHTML = '<li data-value="">No projects in this area</li>';
        }
        projectOptionsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const value = li.getAttribute('data-value');
                const text = li.innerText;
                projectTrigger.innerText = text;
                projectHidden.value = value;
                projectOptionsList.classList.remove('open');
                const changeEvent = new Event('change', { bubbles: true });
                projectHidden.dispatchEvent(changeEvent);
            });
        });
    }

    function updateConfigs() {
        const projectId = projectHidden.value;
        if (!projectId) {
            configOptionsList.innerHTML = '<li data-value="">Select project first</li>';
            // Reset total floors field
            const totalFloorsInput = document.querySelector('input[name="totalFloors"]');
            if (totalFloorsInput) totalFloorsInput.value = '';
            return;
        }
        selectedProject = projectsData.find(p => p._id === projectId);
        
        // ✅ FIX: Set total floors from project
        const totalFloorsInput = document.querySelector('input[name="totalFloors"]');
        if (totalFloorsInput && selectedProject?.totalFloors) {
            totalFloorsInput.value = selectedProject.totalFloors;
        } else if (totalFloorsInput) {
            totalFloorsInput.value = '';
        }
        
        if (selectedProject?.configurations?.length) {
            configOptionsList.innerHTML = '';
            selectedProject.configurations.forEach(cfg => {
                const displayName = cfg.type || `${cfg.bedrooms} BHK`;
                configOptionsList.innerHTML += `<li data-value="${cfg.id || cfg.bedrooms}">${escapeHtml(displayName)}</li>`;
            });
        } else {
            configOptionsList.innerHTML = '<li data-value="">No configurations available</li>';
        }
        configOptionsList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const value = li.getAttribute('data-value');
                const text = li.innerText;
                configTrigger.innerText = text;
                configHidden.value = value;
                configOptionsList.classList.remove('open');
                
                const cfg = selectedProject?.configurations?.find(c => (c.id === value) || (c.bedrooms == value));
                if (cfg) {
                    document.querySelector('input[name="bedrooms"]').value = cfg.bedrooms || '';
                    document.querySelector('input[name="bathrooms"]').value = cfg.bathrooms || '';
                    document.querySelector('input[name="balconies"]').value = cfg.balconies || '';
                    
                    if (cfg.sizes && cfg.sizes.length) {
                        createSizeDropdown(cfg.sizes);
                    } else {
                        createSizeInput();
                    }
                }
            });
        });
    }

    if (areaHidden) areaHidden.addEventListener('change', updateProjects);
    if (projectHidden) projectHidden.addEventListener('change', updateConfigs);
    
    updateProjects();
    resetSizeField();
}


// ========== IMAGE HANDLING ==========
function addImages() { document.getElementById('hiddenFileInput')?.click(); }
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    uploadedFiles.push(...files);
    refreshImageGrid();
}






function removeImage(index) {
    uploadedFiles.splice(index, 1);
    refreshImageGrid();
}



function refreshImageGrid() {
    const grid = document.getElementById('imageGrid');
    if (!grid) return;
    if (uploadedFiles.length === 0) {
        grid.innerHTML = '<p class="image-placeholder">No images uploaded yet.</p>';
        return;
    }
    grid.innerHTML = '';
    uploadedFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.innerHTML = `<img src="${e.target.result}" alt="preview"><button class="remove-img" onclick="removeImage(${idx})">×</button>`;
            grid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// ========== HANDLE PROPERTY SUBMIT (APARTMENT, BUILDERFLOOR, PLOT) ==========
async function handlePropertySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formDataObj = new FormData(form);
    for (let [k, v] of formDataObj.entries()) propertyFormState.data[k] = v;
    const data = propertyFormState.data;
    const propertyType = data.propertyType;
    const purpose = data.purpose;

    console.log('🔥 PURPOSE:', purpose);
    console.log('🔥 PROPERTY TYPE:', propertyType);

    let title = '';
    let slug = '';
    let payload = {};

    // ========== APARTMENT ==========
    if (propertyType === 'apartment') {
        let selectedSize = null;
        const sizeElement = document.getElementById('apartmentSizeSelect');
        if (sizeElement) selectedSize = sizeElement.value;
        if (!selectedSize && data.size) selectedSize = data.size;
        if (!selectedSize) {
            showToast('Please select or enter a size for this configuration', true);
            return;
        }
        const selectedProject = projectsData.find(p => p._id === data.projectId);
        const projectName = selectedProject?.name || 'Property';
        const bedrooms = data.bedrooms || '';
        title = `${bedrooms} BHK in ${projectName}`;
        slug = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${bedrooms}-${Date.now()}`;

        // 🔥 CRITICAL FIX – FORCE type based on purpose
        let finalType = '';
        if (purpose === 'sell') finalType = 'resale';
        else if (purpose === 'rent') finalType = 'rent';
        else finalType = 'resale'; // fallback
        console.log('📌 APARTMENT – Setting unitDetails.type to:', finalType);

        payload = {
            title, slug,
            projectId: data.projectId,
            liveStatus: 'active',
            purpose: purpose,
            propertyType: 'apartment',
            area: data.area,
            location: { area: data.area },
            unitDetails: {
                bedrooms: parseFloat(data.bedrooms),
                bathrooms: parseInt(data.bathrooms),
                sqft: parseFloat(selectedSize),
                floor: data.floor,
                furnishing: data.furnishing,
                type: finalType,   // ✅ YAHI MAIN LINE HAI
                price: data.expectedPrice,
                priceValue: parseFloat(data.expectedPrice)
            },
            pricing: { expectedPrice: parseFloat(data.expectedPrice) },
            availability: purpose === 'sell' ? { status: data.availabilityStatus, age: data.age } : { status: 'ready_to_move', availableFrom: data.availableFrom, age: data.age },
            gatedInfo: { isNegotiable: data.negotiable === 'Yes', exactPrice: data.exactPrice }
        };
    }
    // ========== BUILDER FLOOR ==========
    else if (propertyType === 'builderfloor') {
        if (!data.bathrooms || !data.size || !data.totalFloors || !data.floorNumber) {
            showToast('Please fill all required fields: Bathrooms, Size (sqyd), Total Floors, Floor Number', true);
            return;
        }
        title = `${data.bedrooms} BHK Builder Floor in ${data.societyName}`;
        slug = `${data.societyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${data.bedrooms}-${Date.now()}`;

        let finalType = '';
        if (purpose === 'sell') finalType = 'floor';
        else if (purpose === 'rent') finalType = 'rent';
        else finalType = 'floor';
        console.log('📌 BUILDER FLOOR – Setting unitDetails.type to:', finalType);

        payload = {
            title, slug,
            liveStatus: 'active',
            purpose: purpose,
            propertyType: 'builderfloor',
            area: data.area,
            societyName: data.societyName,
            buildingStructure: data.buildingStructure,
            unitDetails: {
                type: finalType,
                bedrooms: parseInt(data.bedrooms),
                bathrooms: parseInt(data.bathrooms),
                size: parseFloat(data.size),
                sizeUnit: 'sqyd',
                totalFloors: parseInt(data.totalFloors),
                floorNumber: parseInt(data.floorNumber),
                price: data.expectedPrice,
                priceValue: parseFloat(data.expectedPrice),
                age: data.age ? parseFloat(data.age) : 0
            },
            pricing: { expectedPrice: parseFloat(data.expectedPrice) }
        };
        if (purpose === 'sell') {
            payload.gatedInfo = { isNegotiable: data.negotiable === 'Yes', exactPrice: data.exactPrice };
        } else {
            payload.availability = { availableFrom: data.availableFrom };
            payload.pricing.securityAmount = parseFloat(data.securityAmount);
            payload.pricing.noticePeriod = data.noticePeriod;
            payload.pricing.rentDuration = data.rentDuration;
        }
    }
    // ========== PLOT ==========
    else if (propertyType === 'plot') {
        const plotArea = parseFloat(data.plotArea);
        if (!plotArea || plotArea <= 0) {
            showToast('Please enter a valid plot area', true);
            return;
        }
        const expectedPrice = parseFloat(data.expectedPrice);
        if (!expectedPrice) {
            showToast('Please enter expected price', true);
            return;
        }
        title = `Plot in ${data.area || 'Unknown Area'}`;
        slug = `plot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        payload = {
            title, slug,
            liveStatus: 'active',
            purpose: 'sell',
            propertyType: 'plot',
            area: data.area,
            societyName: data.societyName || null,
            unitDetails: {
                type: 'plot',
                plotArea: plotArea,
                floorsAllowed: data.floorsAllowed ? parseInt(data.floorsAllowed) : null,
                boundary: data.boundary,
                openSides: parseInt(data.openSides),
                age: data.age ? parseFloat(data.age) : 0,
                price: expectedPrice,
                priceValue: expectedPrice,
                size: plotArea,
                sizeUnit: 'sqyd'
            },
            pricing: { expectedPrice: expectedPrice },
            gatedInfo: { isNegotiable: data.negotiable === 'Yes', exactPrice: data.exactPrice }
        };
    }

    console.log('✅ FINAL PAYLOAD unitDetails.type:', payload.unitDetails?.type);

    const submitData = new FormData();
    submitData.append('data', JSON.stringify(payload));
    uploadedFiles.forEach(f => submitData.append('images', f));
    try {
        const res = await fetch('/api/admin/properties', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: submitData
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Property added successfully');
        closeModal();
        if (typeof fetchAllData === 'function') await fetchAllData();
        if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
        else if (window.refreshCurrentPage) window.refreshCurrentPage();
        else location.reload();
    } catch(err) {
        showToast(err.message, true);
    }
}



// ==================== LEAD/PROJECT SUBMIT ====================
async function submitLeadForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const configId = formData.get('configId');
    let bedrooms = '';
    if (configId) {
        const proj = projectsData.find(p => p._id === formData.get('projectId'));
        const cfg = proj?.configurations?.find(c => (c.id === configId) || (c.bedrooms == configId));
        if (cfg) bedrooms = cfg.bedrooms;
    }
    const payload = {
        name: formData.get('name'),
        email: formData.get('email') || '',
        phone: formData.get('phone'),
        source: 'admin_manual',
        status: formData.get('status'),
        requirementDetails: {
            projectId: formData.get('projectId') || null,
            purpose: formData.get('purpose'),
            bedrooms: bedrooms || formData.get('bedrooms'),
            budget: formData.get('budget'),
            location: formData.get('location'),
            timeline: formData.get('timeline'),
            message: formData.get('message'),
        }
    };
    try {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Lead added');
        closeModal();
        if (typeof fetchAllData === 'function') await fetchAllData();
        if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
        else if (window.refreshCurrentPage) window.refreshCurrentPage();
    } catch(err) { showToast(err.message, true); }
}

async function submitProjectForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 🔥 Variables define karo pehle
    const totalTowers = document.getElementById('totalTowers')?.value ? parseInt(document.getElementById('totalTowers').value) : 0;
    const unitsPerFloor = document.getElementById('unitsPerFloor')?.value ? parseInt(document.getElementById('unitsPerFloor').value) : 0;
    const totalFloors = document.getElementById('totalFloors')?.value ? parseInt(document.getElementById('totalFloors').value) : 0;
    
    const payload = {
        name: formData.get('name'),
        slug: formData.get('slug') || undefined,
        developer: formData.get('developer'),
        location: {
            address: formData.get('address'),
            city: formData.get('city'),
            sector: formData.get('sector')
        },
        totalTowers: totalTowers,
        unitsPerFloor: unitsPerFloor,
        totalFloors: totalFloors,
        liveStatus: formData.get('liveStatus')
    };
    
    try {
        const res = await fetch('/api/admin/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Project added');
        closeModal();
        if (typeof fetchAllData === 'function') await fetchAllData();
        if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
        else if (window.refreshCurrentPage) window.refreshCurrentPage();
    } catch(err) { showToast(err.message, true); }
}

// ==================== CLOSE MODAL ====================
window.closeModal = function() {
    const modal = document.getElementById('dynamicModal');
    if (modal) modal.remove();
    propertyFormState = { step: 1, data: {}, configs: [] };
    uploadedFiles = [];
};