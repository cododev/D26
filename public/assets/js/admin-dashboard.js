/**
 * Admin Dashboard JavaScript
 */

let currentAdmin = null;
let products = [];
let orders = [];
let users = [];

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check admin authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadAdminData();
    await loadDashboardStats();
    setupTabNavigation();
    setupEventListeners();
});

/**
 * Load admin data
 */
async function loadAdminData() {
    try {
        const response = await fetch('/api/v1/admin/check', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        const data = await response.json();

        if (data.success && data.data.authenticated) {
            currentAdmin = data.data.admin;
            displayAdminInfo();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to load admin data:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Display admin info
 */
function displayAdminInfo() {
    if (currentAdmin) {
        const name = currentAdmin.name || currentAdmin.full_name || 'Admin';
        document.getElementById('adminName').textContent = name;
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Load products
        const productsResponse = await fetch('/api/v1/admin/products');
        const productsData = await productsResponse.json();
        products = productsData.data || [];

        // Load orders
        const ordersResponse = await fetch('/api/v1/admin/orders');
        const ordersData = await ordersResponse.json();
        orders = ordersData.data || [];

        // Load users
        const usersResponse = await fetch('/api/v1/admin/users');
        const usersData = await usersResponse.json();
        users = usersData.data || [];

        // Calculate stats
        const totalRevenue = orders
            .filter(o => o.status === 'completed' || o.status === 'delivered')
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        // Update stats display
        document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;

        // Display recent orders
        displayRecentOrders();
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Set default values
        document.getElementById('totalRevenue').textContent = '0.00';
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalUsers').textContent = '0';
    }
}

/**
 * Display recent orders
 */
function displayRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    const recentOrders = orders.slice(0, 5);

    if (recentOrders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No orders yet</p>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => {
                    const statusClass = `badge badge-${order.status || 'pending'}`;
                    const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);

                    return `
                        <tr>
                            <td>#${order.order_id || order.id}</td>
                            <td>${order.customer_name || order.user?.name || 'N/A'}</td>
                            <td>₦${formatPrice(order.total || order.total_amount)}</td>
                            <td><span class="${statusClass}">${statusText}</span></td>
                            <td>${formatDate(order.created_at || order.order_date)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
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

            // Load tab-specific data
            if (tabId === 'products') {
                loadProductsTab();
            } else if (tabId === 'orders') {
                loadOrdersTab();
            } else if (tabId === 'users') {
                loadUsersTab();
            }
        });
    });
}

/**
 * Load products tab
 */
function loadProductsTab() {
    const container = document.getElementById('productsList');

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No products found</p>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>
                            <img src="${product.image || '../assets/img/placeholder.jpg'}"
                                 alt="${product.name}"
                                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.category_name || 'N/A'}</td>
                        <td>₦${formatPrice(product.price)}</td>
                        <td>${product.stock || 0}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Edit</button>
                                <button class="btn btn-secondary btn-sm" onclick="deleteProduct(${product.id})" style="background: #ef4444;">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

/**
 * Load orders tab
 */
function loadOrdersTab() {
    const container = document.getElementById('ordersList');

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No orders found</p>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => {
                    const statusClass = `status-${order.status || 'pending'}`;
                    const statusText = (order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1);

                    return `
                        <tr>
                            <td>#${order.order_id || order.id}</td>
                            <td>${order.customer_name || order.user?.name || 'N/A'}</td>
                            <td>${formatDate(order.created_at || order.order_date)}</td>
                            <td>₦${formatPrice(order.total || order.total_amount)}</td>
                            <td><span class="badge badge-${order.status || 'pending'}">${statusText}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-secondary btn-sm" onclick="viewOrder(${order.id})">View</button>
                                    ${order.status === 'pending' ? `
                                        <button class="btn-status btn-process" onclick="updateOrderStatus(${order.id}, 'processing')">Process</button>
                                    ` : ''}
                                    ${order.status === 'processing' ? `
                                        <button class="btn-status btn-complete" onclick="updateOrderStatus(${order.id}, 'completed')">Complete</button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

/**
 * Load users tab
 */
function loadUsersTab() {
    const container = document.getElementById('usersList');

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No users found</p>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${formatDate(user.created_at || user.registered_at)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Product search
    document.getElementById('productSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query))
        );
        displayFilteredProducts(filtered);
    });

    // Order search
    document.getElementById('orderSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = orders.filter(o =>
            (o.order_id && o.order_id.toString().includes(query)) ||
            (o.customer_name && o.customer_name.toLowerCase().includes(query))
        );
        displayFilteredOrders(filtered);
    });

    // Order status filter
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        const status = e.target.value;
        const filtered = status === '' ? orders : orders.filter(o => o.status === status);
        displayFilteredOrders(filtered);
    });
}

/**
 * Display filtered products
 */
function displayFilteredProducts(filtered) {
    const container = document.getElementById('productsTableBody');
    const temp = products;
    products = filtered;
    loadProductsTab();
    products = temp;
}

/**
 * Display filtered orders
 */
function displayFilteredOrders(filtered) {
    const container = document.getElementById('ordersTableBody');
    const temp = orders;
    orders = filtered;
    loadOrdersTab();
    orders = temp;
}

/**
 * Edit product
 */
async function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // TODO: Implement edit modal or navigate to edit page
    alert(`Edit product: ${product.name}\n(Edit functionality to be implemented)`);
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`/api/v1/admin/products/${productId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            alert('Product deleted successfully');
            await loadDashboardStats();
            loadProductsTab();
        } else {
            alert(data.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        alert('Failed to delete product');
    }
}

/**
 * View order details
 */
async function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // TODO: Implement order details modal
    alert(`Order #${order.order_id || order.id}\nCustomer: ${order.customer_name || 'N/A'}\nTotal: ₦${formatPrice(order.total || order.total_amount)}`);
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();

        if (data.success) {
            alert('Order status updated successfully');
            await loadDashboardStats();
            loadOrdersTab();
        } else {
            alert(data.message || 'Failed to update order status');
        }
    } catch (error) {
        console.error('Update order status error:', error);
        alert('Failed to update order status');
    }
}

/**
 * Format date
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
 * Format price
 */
function formatPrice(price) {
    if (!price) return '0.00';
    return price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Logout
 */
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        await fetch('/api/v1/admin/logout', { method: 'POST' });
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});
