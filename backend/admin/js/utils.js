// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = isError ? '#dc3545' : '#1E2A3A';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '40px';
    toast.style.zIndex = '9999';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateStr) {
    let d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function getRelativeTime(dateStr) {
    let now = new Date();
    let then = new Date(dateStr);
    let diff = Math.floor((now - then) / 1000);
    if(diff < 60) return 'just now';
    if(diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if(diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
    return `${Math.floor(diff/86400)} days ago`;
}