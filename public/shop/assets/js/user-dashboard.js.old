/**
 * User Dashboard JavaScript
 */

let currentUser = null;
let orders = [];

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadUserData();
    await loadOrders();
    updateCartCount();
    setupTabNavigation();
});

/**
 * Load user data
 */
async function loadUserData() {
    try {
        const response = await api.checkAuth();

        if (response.data.authenticated) {
            currentUser = response.data.user || response.data;
            displayUserInfo();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Display user info
 */
function displayUserInfo() {
    if (currentUser) {
        const name = currentUser.name || 'User';
        const email = currentUser.email || '';
        const initial = name.charAt(0).toUpperCase();

        document.getElementById('userName').textContent = name;
        document.getElementById('userEmail').textContent = email;
        document.getElementById('userInitial').textContent = initial;

        // Prefill profile form
        document.getElementById('profileName').value = name;
        document.getElementById('profileEmail').value = email;
        document.getElementById('profilePhone').value = currentUser.phone || '';
    }
}

/**
 * Load orders
 */
async function loadOrders() {
    try {
        const response = await api.getUserOrders();

        if (response.success) {
            orders = response.data || [];
            displayOrderStats();
            displayRecentOrders();
            displayAllOrders();
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
        orders = [];
        displayOrderStats();
        displayRecentOrders();
        displayAllOrders();
    }
}

/**
 * Display order statistics
 */
function displayOrderStats() {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const completed = orders.filter(o => o.status === 'completed').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('completedOrders').textContent = completed;
}

/**
 * Display recent orders
 */
function displayRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    const recentOrders = orders.slice(0, 3);

    if (recentOrders.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders yet</div>';
        return;
    }

    container.innerHTML = recentOrders.map(order => createOrderCard(order)).join('');
}

/**
 * Display all orders
 */
function displayAllOrders() {
    const container = document.getElementById('allOrdersList');

    if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders yet. <a href="index.html">Start shopping!</a></div>';
        return;
    }

    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

/**
 * Create order card HTML
 */
function createOrderCard(order) {
    const statusClass = `status-${order.status || 'pending'}`;
    const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.order_id || order.id}</div>
                    <div class="order-date">${formatDate(order.created_at || order.order_date)}</div>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>

            <div class="order-items">
                ${(order.items || []).map(item => `
                    <div class="order-item">
                        <span>${item.product_name || item.name} × ${item.quantity}</span>
                        <span>₦${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="order-total">
                <span>Total</span>
                <span>₦${formatPrice(order.total || order.total_amount)}</span>
            </div>
        </div>
    `;
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding tab
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Update cart count
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.classList.remove('hidden');
    } else {
        cartCountElement.classList.add('hidden');
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format price
 */
function formatPrice(price) {
    return price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Profile form submission
 */
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        const response = await api.updateProfile({
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        });

        if (response.success) {
            alert('Profile updated successfully!');
            await loadUserData();
        } else {
            alert(response.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
});

/**
 * Password form submission
 */
document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';

    try {
        const response = await api.changePassword({
            current_password: formData.get('current_password'),
            new_password: newPassword,
            new_password_confirmation: confirmPassword
        });

        if (response.success) {
            alert('Password changed successfully!');
            e.target.reset();
        } else {
            alert(response.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Password change error:', error);
        alert('Failed to change password');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
    }
});

/**
 * Logout
 */
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        await api.logout();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});
