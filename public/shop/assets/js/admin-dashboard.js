/**
 * ========================================
 * DEEDIX SHOP - ADMIN DASHBOARD
 * ========================================
 *
 * Consolidated admin dashboard script with JWT authentication
 *
 * Features:
 * - JWT Bearer token authentication
 * - Dashboard statistics and overview
 * - Product management
 * - Order management
 * - User management (customers and admins)
 * - Search and filter functionality
 *
 * Dependencies:
 * - admin-api.js (JWT authentication helper)
 *
 * @version 2.0
 * @date 2025-12-27
 */

// ========================================
// GLOBAL STATE
// ========================================

let currentAdmin = null;    // Currently logged-in admin user
let products = [];          // All products from database
let orders = [];            // All orders from database
let users = [];             // All users for statistics
let customers = [];         // Customer users only
let admins = [];            // Admin users only

// ========================================
// INITIALIZATION
// ========================================

/**
 * Set current year in footer
 */
document.getElementById('currentYear').textContent = new Date().getFullYear();

/**
 * Initialize dashboard on page load
 * - Checks for JWT token
 * - Loads admin data
 * - Loads dashboard statistics
 * - Sets up event listeners
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user has valid JWT token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    await loadAdminData();
    await loadDashboardStats();
    setupTabNavigation();
    setupEventListeners();
    setupUsersSubTabs();
    setupAddAdminModal();
});

/**
 * Load admin data
 */
async function loadAdminData() {
    try {
        const data = await adminAPI.check(); // Uses JWT Bearer token + /api/v1/admin/check

        if (data.success && data.data?.authenticated) {
            currentAdmin = data.data.admin;
            displayAdminInfo();
        } else {
            console.error('Authentication failed:', data.message);
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Failed to load admin data:', error);
        window.location.href = 'admin-login.html';
    }
}

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
        // Products
        const productsData = await adminAPI.getProducts(); // /api/v1/admin/products with JWT
        products = productsData.data || [];

        // Orders
        const ordersData = await adminAPI.getOrders(); // /api/v1/admin/orders with JWT
        orders = ordersData.data || [];

        // Users (stats only)
        const usersData = await adminAPI.getUsers(); // /api/v1/admin/users/all with JWT
        users = usersData.data || [];

        // Stats
        const totalRevenue = orders
            .filter(o => ['completed', 'delivered'].includes(o.status))
            .reduce((sum, o) => sum + parseFloat(o.total || o.total_amount || 0), 0);

        document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue);
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;

        displayRecentOrders();
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

/**
 * Display recent orders
 */
function displayRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    const recentOrders = orders.slice(0, 5);

    if (recentOrders.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No orders yet</p>';
        return;
    }

    container.innerHTML = `
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
                ${recentOrders.map(order => `
                    <tr>
                        <td>#${order.order_id || order.id}</td>
                        <td>${order.customer_name || order.user?.name || 'N/A'}</td>
                        <td>₦${formatPrice(order.total || order.total_amount)}</td>
                        <td><span class="badge badge-${order.status}">${order.status}</span></td>
                        <td>${formatDate(order.created_at)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Tab Navigation
 */
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(t => t.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');

            if (tabId === 'products') loadProductsTab();
            if (tabId === 'orders') loadOrdersTab();
            if (tabId === 'users') loadUsersData();
        });
    });
}

/**
 * Load Users (Customers + Admins)
 */
async function loadUsersData() {
    try {
        const customersData = await adminAPI.getCustomers(); // /api/v1/admin/users/all with JWT
        const adminsData = await adminAPI.getAdmins();       // /api/v1/admin/users/admin with JWT

        if (customersData.success && adminsData.success) {
            customers = customersData.data || [];
            admins = adminsData.data || [];

            customers = customers.map(u => ({
                ...u,
                name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()
            }));
            admins = admins.map(u => ({
                ...u,
                name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()
            }));

            displayCustomers();
            displayAdmins();
        } else {
            console.error('Failed to load users:', customersData.message || adminsData.message);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

/**
 * Display Customers
 */
function displayCustomers() {
    const container = document.getElementById('customersList');

    if (customers.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No customers found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Orders</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(c => `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.name}</td>
                        <td>${c.email}</td>
                        <td>${c.phone || 'N/A'}</td>
                        <td>${formatDate(c.created_at)}</td>
                        <td>${c.total_orders || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Display Admins
 */
function displayAdmins() {
    const container = document.getElementById('adminsList');

    if (admins.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No admins found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Added</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${admins.map(a => `
                    <tr>
                        <td>${a.id}</td>
                        <td>${a.name}</td>
                        <td>${a.email}</td>
                        <td>${a.phone || 'N/A'}</td>
                        <td>${formatDate(a.created_at)}</td>
                        <td>
                            <button class="action-btn" onclick="deleteAdmin(${a.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Delete Admin
 */
async function deleteAdmin(id) {
    if (!confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;

    const result = await adminAPI.deleteAdmin(id); // Uses JWT + /api/v1/admin/users/admin/{id}

    if (result.success) {
        toast.success('Admin removed successfully');
        loadUsersData();
    } else {
        toast.error(result.message || 'Failed to remove admin');
    }
}

/**
 * Setup Users Sub-Tabs (Customers/Admins)
 * Handles switching between customer and admin views in Users tab
 */
function setupUsersSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active content
            document.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.subtab + '-subtab')?.classList.add('active');
        });
    });
}

/**
 * Add Admin Modal
 * Handles opening/closing modal and creating new admin users
 */
function setupAddAdminModal() {
    const addAdminBtn = document.getElementById('addAdminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminForm = document.getElementById('addAdminForm');

    // Open modal
    addAdminBtn?.addEventListener('click', () => {
        adminModal?.classList.add('active');
    });

    // Close modal
    document.querySelectorAll('#adminModal .modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            adminModal?.classList.remove('active');
            adminForm?.reset();
        });
    });

    // Handle form submission
    adminForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(adminForm);
        const data = Object.fromEntries(formData);

        const submitBtn = adminForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
            const result = await adminAPI.createAdmin(data);

            if (result.success) {
                toast.success('Admin added successfully');
                adminModal.classList.remove('active');
                adminForm.reset();
                loadUsersData(); // Reload users list
            } else {
                toast.error(result.message || 'Failed to add admin');
            }
        } catch (error) {
            console.error('Add admin error:', error);
            toast.error('Error adding admin. Please try again');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Products Tab
 */
function loadProductsTab() {
    const container = document.getElementById('productsList');

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No products found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.image ? `<img src="${p.image}" style="width:50px;height:50px;object-fit:cover;">` : '<span style="color:#9ca3af;">No image</span>'}</td>
                        <td>${p.name}</td>
                        <td>${p.category_name || 'N/A'}</td>
                        <td>₦${formatPrice(p.price)}</td>
                        <td>${p.stock}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Orders Tab
 */
function loadOrdersTab() {
    const container = document.getElementById('ordersList');

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6b7280;">No orders found</p>';
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(o => `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.customer_name}</td>
                        <td>${formatDate(o.created_at)}</td>
                        <td>₦${formatPrice(o.total)}</td>
                        <td>${o.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Setup Event Listeners
 * Adds search and filter functionality for products, orders, customers, and admins
 */
function setupEventListeners() {
    // Product search
    document.getElementById('productSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category_name && p.category_name.toLowerCase().includes(query))
        );
        const temp = products;
        products = filtered;
        loadProductsTab();
        products = temp;
    });

    // Order search
    document.getElementById('orderSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = orders.filter(o =>
            String(o.order_id || o.id).includes(query) ||
            (o.customer_name && o.customer_name.toLowerCase().includes(query))
        );
        const temp = orders;
        orders = filtered;
        loadOrdersTab();
        orders = temp;
    });

    // Order status filter
    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        const status = e.target.value;
        const filtered = status === '' ? orders : orders.filter(o => o.status === status);
        const temp = orders;
        orders = filtered;
        loadOrdersTab();
        orders = temp;
    });

    // Customer search
    document.getElementById('customerSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = customers.filter(c =>
            (c.name && c.name.toLowerCase().includes(query)) ||
            c.email.toLowerCase().includes(query)
        );
        const temp = customers;
        customers = filtered;
        displayCustomers();
        customers = temp;
    });

    // Admin search
    document.getElementById('adminSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = admins.filter(a =>
            (a.name && a.name.toLowerCase().includes(query)) ||
            a.email.toLowerCase().includes(query)
        );
        const temp = admins;
        admins = filtered;
        displayAdmins();
        admins = temp;
    });
}

/**
 * Logout
 */
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
    });

    localStorage.removeItem('token');
    window.location.href = 'admin-login.html';
});

/**
 * Helpers
 */
async function safeJson(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { success: false, message: 'Invalid JSON', raw: text };
    }
}

function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG');
}

function formatPrice(price) {
    return Number(price || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
