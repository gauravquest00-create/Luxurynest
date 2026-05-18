function renderNotificationsPage() {
    const dummyNotifications = [
        { message: 'New Lead Received: Ajrun Reddy, Medium Intent - Budget ₹50L-70L', time: '2024-02-20T08:00:00', read: false },
        { message: 'Lead Status Changed: Kavita Singh moved to Negotiation stage', time: '2024-02-20T07:30:00', read: false },
        { message: 'Property Added: New property in ACE Verde - 3BHK Premium Apartment', time: '2024-02-19T23:00:00', read: true },
        { message: 'Site Visit Scheduled: Rajesh Sharma - tomorrow 11 AM', time: '2024-02-19T18:00:00', read: true }
    ];
     // Hide quick add button on dashboard (as per original)
    const quickAddBtn = document.getElementById('quickAddBtn');
    if (quickAddBtn) quickAddBtn.style.display = 'none';
    
    const unreadCount = dummyNotifications.filter(n => !n.read).length;
    let html = `<h2>Notifications ${unreadCount ? `<span class="badge">${unreadCount} new</span>` : ''}</h2>
                <div class="notifications-list">`;
    dummyNotifications.forEach(n => {
        html += `<div class="card" style="margin-bottom:1rem; padding:1rem; background:${n.read ? 'white' : '#FFF9E6'}">
                    <div class="card-meta">${escapeHtml(n.message)}</div>
                    <div class="card-meta" style="font-size:0.7rem;">${getRelativeTime(n.time)}</div>
                </div>`;
    });
    html += `</div>`;
    pageContent.innerHTML = html;
}