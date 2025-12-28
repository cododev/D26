/**
 * Checkout Page JavaScript
 */

let cart = [];
let currentUser = null;

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to continue with checkout');
        window.location.href = 'login.html';
        return;
    }

    await loadUserData();
    loadCart();
    updateCartCount();
});

/**
 * Load user data
 */
async function loadUserData() {
    try {
        const response = await api.checkAuth();

        if (response.success && response.data && response.data.authenticated) {
            currentUser = response.data.user || response.data;
            prefillForm();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Prefill form with user data
 */
function prefillForm() {
    if (currentUser) {
        const nameParts = (currentUser.name || '').split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
    }
}

/**
 * Load cart from localStorage
 */
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    cart = storedCart ? JSON.parse(storedCart) : [];

    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
    }

    displayOrderSummary();
}

/**
 * Display order summary
 */
function displayOrderSummary() {
    const container = document.getElementById('orderItems');

    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="order-item-price">₦${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');

    updateSummary();
}

/**
 * Update summary totals
 */
function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5000;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `₦${formatPrice(subtotal)}`;
    document.getElementById('shipping').textContent = `₦${formatPrice(shipping)}`;
    document.getElementById('tax').textContent = `₦${formatPrice(tax)}`;
    document.getElementById('total').textContent = `₦${formatPrice(total)}`;
}

/**
 * Update cart count
 */
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.classList.remove('hidden');
    } else {
        cartCountElement.classList.add('hidden');
    }
}

/**
 * Format price
 */
function formatPrice(price) {
    return price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Handle checkout form submission
 */
document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const paymentMethod = formData.get('payment_method');

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5000;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;

    // Prepare order data
    const orderData = {
        items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        })),
        shipping_address: {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state')
        },
        payment_method: paymentMethod,
        notes: formData.get('notes') || '',
        subtotal: subtotal,
        shipping_fee: shipping,
        tax: tax,
        total: total
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const response = await api.createOrder(orderData);

        if (response.success) {
            // Clear cart
            localStorage.removeItem('cart');

            // Show success message
            alert('Order placed successfully! Order ID: ' + response.data.order_id);

            // Redirect based on payment method
            if (paymentMethod === 'card') {
                // Redirect to payment gateway
                window.location.href = response.data.payment_url || 'user-dashboard.html';
            } else {
                // Redirect to user dashboard
                window.location.href = 'user-dashboard.html';
            }
        } else {
            alert(response.message || 'Failed to place order. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to place order. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
    }
});
