/**
 * DeediX API Client
 * Handles all communication with the backend API
 */

class DeediXAPI {
    constructor() {
        this.baseURL = '/api/v1';
        this.token = null;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // Get token from localStorage
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: error.message || 'Network error occurred'
            };
        }
    }

    // Products
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/products?${params}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async getFeaturedProducts(limit = 8) {
        return this.request(`/products/featured?limit=${limit}`);
    }

    async getPopularProducts(limit = 8) {
        return this.request(`/products/popular?limit=${limit}`);
    }

    async getNewProducts(limit = 8) {
        return this.request(`/products/new?limit=${limit}`);
    }

    async searchProducts(query) {
        return this.request(`/products?search=${encodeURIComponent(query)}`);
    }

    // Authentication
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuth() {
        return this.request('/auth/check');
    }

    // Cart
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    async updateCart(cartId, quantity) {
        return this.request('/cart', {
            method: 'PUT',
            body: JSON.stringify({ cart_id: cartId, quantity })
        });
    }

    async removeFromCart(cartId) {
        return this.request(`/cart?id=${cartId}`, {
            method: 'DELETE'
        });
    }

    async clearCart() {
        return this.request('/cart/clear', {
            method: 'DELETE'
        });
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async trackOrder(orderNumber) {
        return this.request(`/orders/track?number=${orderNumber}`);
    }

    async getMyOrders() {
        return this.request('/orders');
    }
}

// Create global API instance
const api = new DeediXAPI();
