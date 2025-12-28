/**
 * User Dashboard JavaScript
 * Handles loading user data, orders, profile update, and navigation
 */

let currentUser = null;
let orders = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data and orders
    await loadCurrentUser();
    await loadUserOrders();

    // Setup event listeners
    setupTabNavigation();
    setupProfileForm();
    setupPasswordForm();
    setupOrderFilters();
    setupPasswordToggles();

    // Handle hash navigation (for direct links)
    handleHashNavigation();
});

/**
 * Load current authenticated user
 */
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success && result.data) {
            currentUser = result.data;
            displayUserInfo();
            populateProfileForm();
        } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

/**
 * Display user info in header
 */
function displayUserInfo() {
    if (!currentUser) return;

    const firstName = currentUser.first_name || currentUser.name || 'User';

    // Update welcome message
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome back, ${firstName}! Manage your profile and track your orders.`;
    }
}

/**
 * Populate profile form with current data
 */
function populateProfileForm() {
    if (!currentUser) return;

    document.getElementById('firstName').value = currentUser.first_name || '';
    document.getElementById('lastName').value = currentUser.last_name || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
}

/**
 * Load user's orders
 */
async function loadUserOrders() {
    try {
        const response = await fetch('/api/v1/orders', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        const result = await response.json();

        if (result.success) {
            orders = result.data || [];
            displayOrderStats();
            displayRecentOrders();
            displayAllOrders();
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        document.getElementById('recentOrdersList').innerHTML = '<p>Error loading orders</p>';
        document.getElementById('allOrdersList').innerHTML = '<p>Error loading orders</p>';
    }
}

/**
 * Display order statistics
 */
function displayOrderStats() {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => ['completed', 'delivered'].includes(o.status)).length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('completedOrders').textContent = completed;
}

/**
 * Display recent orders in overview tab
 */
function displayRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    const recent = orders.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No orders yet. Start shopping!</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    recent.forEach(order => {
        const statusClass = `badge badge-${order.status || 'pending'}`;
        const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);
        const itemCount = order.items ? order.items.length : 'N/A';

        html += `
            <tr>
                <td>#${order.order_id || order.id}</td>
                <td>${formatDate(order.created_at || order.order_date)}</td>
                <td>${itemCount}</td>
                <td>₦${formatPrice(order.total || order.total_amount)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

/**
 * Display all orders in orders tab
 */
function displayAllOrders() {
    const container = document.getElementById('allOrdersList');

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No orders found</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        const statusClass = `badge badge-${order.status || 'pending'}`;
        const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);
        const itemCount = order.items ? order.items.length : 'N/A';

        html += `
            <tr>
                <td>#${order.order_id || order.id}</td>
                <td>${formatDate(order.created_at || order.order_date)}</td>
                <td>${itemCount}</td>
                <td>₦${formatPrice(order.total || order.total_amount)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    document.querySelectorAll('.dashboard-tab[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        });
    });
}

/**
 * Switch to a specific tab
 */
function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.dashboard-tab[data-tab="${tabId}"]`)?.classList.add('active');

    // Show tab content (using .tab-pane class from user-dashboard.html)
    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');

    // Update hash
    window.location.hash = tabId;
}

/**
 * Handle hash navigation for direct links
 */
function handleHashNavigation() {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash && ['overview', 'orders', 'profile'].includes(hash)) {
        switchTab(hash);
    }
}

// Listen for hash changes (for browser back/forward)
window.addEventListener('hashchange', () => {
    handleHashNavigation();
});

/**
 * Setup profile form submission
 */
function setupProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            phone: formData.get('phone')
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const response = await fetch('/api/v1/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Profile updated successfully!');
                loadCurrentUser(); // Refresh display
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Error updating profile. Please try again');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Setup password form submission
 */
function setupPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const currentPassword = formData.get('current_password');
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('confirm_password');

        // Validation
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        try {
            const response = await fetch('/api/v1/auth/password', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Password updated successfully!');
                form.reset();
            } else {
                toast.error(result.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password update error:', error);
            toast.error('Error updating password. Please try again');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Setup order filters
 */
function setupOrderFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter orders
            const filter = btn.dataset.filter;
            filterOrders(filter);
        });
    });
}

/**
 * Filter orders by status
 */
function filterOrders(status) {
    const container = document.getElementById('allOrdersList');

    let filteredOrders = orders;
    if (status !== 'all') {
        filteredOrders = orders.filter(o => o.status === status);
    }

    if (filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No ${status === 'all' ? '' : status.charAt(0).toUpperCase() + status.slice(1)} Orders Found</h3>
                <p>You don't have any ${status === 'all' ? '' : status} orders.</p>
                <a href="index.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredOrders.forEach(order => {
        const statusClass = `order-status ${order.status || 'pending'}`;
        const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);
        const itemCount = order.items ? order.items.length : 'N/A';

        html += `
            <tr>
                <td>#${order.order_id || order.id}</td>
                <td>${formatDate(order.created_at || order.order_date)}</td>
                <td>${itemCount}</td>
                <td>₦${formatPrice(order.total || order.total_amount)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

/**
 * Setup password visibility toggles
 */
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * Helper: Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Helper: Format price
 */
function formatPrice(price) {
    if (!price) return '0.00';
    return Number(price).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Make switchTab globally accessible for inline onclick
window.switchTab = switchTab;