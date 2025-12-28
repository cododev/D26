/**
 * cart.js - Shopping Cart Management for DeediX Shop
 * Handles local cart, UI updates, summary calculations, and checkout flow
 */

let cart = [];

// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    loadCart();

    // Attach checkout button listener safely
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});

/**
 * Check user authentication status
 */
async function checkAuthentication() {
    try {
        const response = await api.checkAuth();

        if (response.success && response.data && response.data.authenticated) {
            showUserMenu(response.data);
        }
    } catch (error) {
        console.warn('Auth check failed or user not logged in:', error);
        // Not logged in — that's fine for cart viewing
    }
}

/**
 * Display logged-in user dropdown
 */
function showUserMenu(user) {
    const authBtn = document.getElementById('authBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');

    if (authBtn) authBtn.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'block';
    if (userName) {
        userName.textContent = user.user?.name || user.user_name || user.email || 'User';
    }

    // Attach logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogout() {
    try {
        await api.logout();
        localStorage.removeItem('token'); // Extra safety
        alert('You have been logged out successfully.');
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
    }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
    try {
        const stored = localStorage.getItem('cart');
        cart = stored ? JSON.parse(stored) : [];
        
        // Safety: ensure quantity is at least 1 and valid
        cart = cart.map(item => ({
            ...item,
            quantity: Math.max(1, parseInt(item.quantity) || 1)
        }));
    } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        cart = [];
    }

    updateCartDisplay();
    updateCartCount();
}

/**
 * Render cart items and toggle empty state
 */
function updateCartDisplay() {
    const container = document.getElementById('cartItemsContainer');
    const emptyCart = document.getElementById('emptyCart');
    const itemCount = document.getElementById('cartItemCount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container || !emptyCart || !itemCount) return;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        container.innerHTML = '';
        itemCount.textContent = '0 items in your cart';
        if (checkoutBtn) checkoutBtn.disabled = true;
        updateSummary();
        return;
    }

    emptyCart.style.display = 'none';
    itemCount.textContent = `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`;
    if (checkoutBtn) checkoutBtn.disabled = false;

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image || '../assets/media/placeholder.jpg'}" 
                 alt="${escapeHtml(item.name)}" 
                 class="cart-item-image"
                 loading="lazy">

            <div class="cart-item-details">
                <h3 class="cart-item-title">${escapeHtml(item.name)}</h3>
                <p class="cart-item-price">₦${formatPrice(item.price)}</p>
                ${item.stock < 10 ? `<p class="stock-warning">Only ${item.stock} left in stock!</p>` : ''}
            </div>

            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)" 
                            ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');

    updateSummary();
}

/**
 * Update item quantity
 */
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        if (confirm('Remove this item from your cart?')) {
            removeFromCart(productId);
        }
        return;
    }

    // Optional: respect stock limit
    if (item.stock && newQuantity > item.stock) {
        alert(`Sorry, only ${item.stock} units available!`);
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
    if (confirm('Remove this item from your cart?')) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartDisplay();
        updateCartCount();
    }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Update cart badge count across site
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElement.textContent = totalItems;
    cartCountElement.classList.toggle('hidden', totalItems === 0);
}

/**
 * Calculate and update order summary
 */
function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200000 ? 0 : (subtotal > 0 ? 5000 : 0); // Free over ₦200k
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + shipping + tax;

    const format = (amount) => `₦${formatPrice(amount)}`;

    document.getElementById('subtotal').textContent = format(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : format(shipping);
    document.getElementById('tax').textContent = format(tax);
    document.getElementById('total').textContent = format(total);

    // Update free shipping note
    const note = document.querySelector('.free-shipping-note');
    if (note) {
        if (subtotal >= 200000) {
            note.innerHTML = '<i class="fas fa-check-circle"></i> Congratulations! You qualify for free shipping!';
            note.style.color = '#28a745';
        } else if (subtotal > 0) {
            const remaining = 200000 - subtotal;
            note.innerHTML = `<i class="fas fa-truck"></i> Add ₦${formatPrice(remaining)} more for free shipping`;
            note.style.color = '#007bff';
        }
    }
}

/**
 * Format price in Nigerian Naira
 */
function formatPrice(price) {
    return Number(price).toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * Basic HTML escaping for security
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle checkout button click
 */
function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please sign in to proceed to checkout.');
        window.location.href = 'login.html?returnUrl=cart.html';
        return;
    }

    window.location.href = 'checkout.html';
}