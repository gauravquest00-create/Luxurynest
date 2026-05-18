// ==================== PROFILE PAGE (PRODUCTION LEVEL UI) ====================
window.renderProfilePage = async function() {
    const container = document.getElementById('pageContent');
    container.innerHTML = '<div class="loading">Loading profile...</div>';
    
    try {
        const res = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const profile = await res.json();
        
        // Hide quick add button on profile page
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) quickAddBtn.style.display = 'none';
        
        let html = `
            <div class="profile-page">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="profile-header-info">
                        <h1>Profile Settings</h1>
                        <p>Manage your account information and security</p>
                    </div>
                </div>
                
                <div class="profile-grid">
                    <!-- Profile Information Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <i class="fas fa-user"></i>
                            <h3>Profile Information</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="fullName" value="${escapeHtml(profile.fullName || profile.name)}" placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" id="phone" value="${escapeHtml(profile.phone || '')}" placeholder="Enter your phone number">
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" id="email" value="${escapeHtml(profile.email)}" readonly disabled>
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <input type="text" value="${escapeHtml(profile.role || 'Administrator')}" readonly disabled>
                            </div>
                            <button class="btn-save" id="saveProfileBtn">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </div>
                    
                    <!-- Security Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <i class="fas fa-lock"></i>
                            <h3>Security</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" id="currentPwd" placeholder="Enter current password">
                            </div>
                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" id="newPwd" placeholder="Enter new password">
                            </div>
                            <div class="form-group">
                                <label>Confirm Password</label>
                                <input type="password" id="confirmPwd" placeholder="Confirm new password">
                            </div>
                            <button class="btn-security" id="changePwdBtn">
                                <i class="fas fa-key"></i> Update Password
                            </button>
                        </div>
                    </div>
                    
                    <!-- Session Card -->
                    <div class="profile-card">
                        <div class="profile-card-header">
                            <i class="fas fa-clock"></i>
                            <h3>Session</h3>
                        </div>
                        <div class="profile-card-body">
                            <div class="session-info">
                                <i class="fas fa-circle"></i>
                                <span>Active Session</span>
                            </div>
                            <div class="session-details">
                                <p><strong>Logged in as:</strong> ${escapeHtml(profile.email)}</p>
                                <p><strong>Session expires:</strong> After inactivity</p>
                            </div>
                            <button class="btn-logout" id="logoutProfileBtn">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        
        // Save profile changes (name & phone)
        document.getElementById('saveProfileBtn').addEventListener('click', async () => {
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            if (!fullName) {
                showToast('Name cannot be empty', true);
                return;
            }
            try {
                const updateRes = await fetch('/api/admin/profile', {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fullName, phone })
                });
                if (!updateRes.ok) throw new Error(await updateRes.text());
                showToast('Profile updated successfully');
                const adminNameSpan = document.getElementById('adminName');
                if (adminNameSpan) adminNameSpan.innerText = fullName;
            } catch (err) {
                showToast(err.message, true);
            }
        });
        
        // Change password
        document.getElementById('changePwdBtn').addEventListener('click', async () => {
            const currentPwd = document.getElementById('currentPwd').value;
            const newPwd = document.getElementById('newPwd').value;
            const confirmPwd = document.getElementById('confirmPwd').value;
            if (!currentPwd || !newPwd) {
                showToast('Please enter current and new password', true);
                return;
            }
            if (newPwd !== confirmPwd) {
                showToast('New password and confirmation do not match', true);
                return;
            }
            try {
                const pwdRes = await fetch('/api/admin/change-password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
                });
                if (!pwdRes.ok) throw new Error(await pwdRes.text());
                showToast('Password changed successfully');
                document.getElementById('currentPwd').value = '';
                document.getElementById('newPwd').value = '';
                document.getElementById('confirmPwd').value = '';
            } catch (err) {
                showToast(err.message, true);
            }
        });
        
        // Logout button
        document.getElementById('logoutProfileBtn').addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            sessionStorage.clear();
            window.location.href = '/luxuryadmin/login.html';
        });
    } catch (err) {
        container.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
};