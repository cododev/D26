/**
 * Admin API Helper
 * Handles JWT-based authentication for admin endpoints
 */

class AdminAPI {
    /**
     * Make authenticated request to admin API
     */
    async request(endpoint, options = {}) {
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');

        // Ensure endpoint starts with /api/v1 prefix
        if (!endpoint.startsWith('/api/v1')) {
            endpoint = '/api/v1' + endpoint;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(endpoint, config);

            // Handle non-JSON responses (HTML errors, 401 pages, etc.)
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return {
                    success: false,
                    message: 'Invalid JSON response from server',
                    raw: text
                };
            }

        } catch (error) {
            console.error('Admin API Error:', error);
            return {
                success: false,
                message: error.message || 'Network error occurred'
            };
        }
    }

    // -------------------------
    // AUTH ENDPOINTS
    // -------------------------

    async check() {
        return this.request('/admin/check'); // You may need to add this route
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // -------------------------
    // USER MANAGEMENT
    // -------------------------

    async getCustomers() {
        // Backend does NOT support filtering; frontend must filter manually
        return this.request('/admin/users/all');
    }

    async getAdmins() {
        return this.request('/admin/users/admin');
    }

    async getUsers() {
        return this.request('/admin/users/all');
    }

    async createAdmin(data) {
        return this.request('/admin/users/admin', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteAdmin(id) {
        return this.request(`/admin/users/admin/${id}`, {
            method: 'DELETE'
        });
    }

    async updateUserStatus(id, isActive) {
        // Your backend does NOT support this route — leaving placeholder
        return {
            success: false,
            message: "updateUserStatus endpoint not implemented in backend"
        };
    }

    // -------------------------
    // PRODUCTS
    // -------------------------

    async getProducts() {
        return this.request('/admin/products');
    }

    async getProduct(id) {
        return this.request(`/admin/products/${id}`);
    }

    async createProduct(data) {
        return this.request('/admin/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateProduct(id, data) {
        return this.request(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteProduct(id) {
        return this.request(`/admin/products/${id}`, {
            method: 'DELETE'
        });
    }

    // -------------------------
    // ORDERS
    // -------------------------

    async getOrders() {
        return this.request('/admin/orders');
    }

    async getOrder(id) {
        return this.request(`/admin/orders/${id}`);
    }

    async updateOrderStatus(id, status) {
        return this.request(`/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}

// Create global instance
window.adminAPI = new AdminAPI();
