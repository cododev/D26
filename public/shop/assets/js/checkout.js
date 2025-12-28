/**
 * Checkout Page JavaScript
 */

let cart = [];
let currentUser = null;
let paymentGateway = null;

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize payment gateway
if (typeof PaymentGateway !== 'undefined') {
    paymentGateway = new PaymentGateway();
    paymentGateway.init().catch(err => console.warn('Payment gateway initialization failed:', err));
}

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
 * Handle payment method change - show/hide bank transfer details
 */
document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const bankTransferDetails = document.getElementById('bankTransferDetails');
        if (e.target.value === 'bank_transfer') {
            bankTransferDetails.style.display = 'block';
        } else {
            bankTransferDetails.style.display = 'none';
        }
    });
});

/**
 * Copy account number to clipboard
 */
function copyAccountNumber() {
    const accountNumber = '0123456789';

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accountNumber)
            .then(() => {
                showCopySuccess();
            })
            .catch(() => {
                fallbackCopy(accountNumber);
            });
    } else {
        fallbackCopy(accountNumber);
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        alert('Failed to copy. Please copy manually: ' + text);
    }

    document.body.removeChild(textarea);
}

/**
 * Show copy success feedback
 */
function showCopySuccess() {
    const copyBtn = document.querySelector('.copy-btn');
    const originalHTML = copyBtn.innerHTML;

    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.style.background = '#10b981';
    copyBtn.style.borderColor = '#10b981';

    setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.background = '';
        copyBtn.style.borderColor = '';
    }, 2000);
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
            const orderId = response.data.order_id;

            // Handle payment based on method
            if (paymentMethod === 'card' && paymentGateway) {
                try {
                    // Process payment with Paystack
                    const paymentData = {
                        email: formData.get('email'),
                        first_name: formData.get('first_name'),
                        last_name: formData.get('last_name'),
                        total: total,
                        order_id: orderId
                    };

                    const paymentResult = await paymentGateway.processPaystackPayment(paymentData);

                    if (paymentResult.success) {
                        // Verify payment on backend
                        await paymentGateway.verifyPayment(paymentResult.reference, 'paystack');

                        // Clear cart
                        localStorage.removeItem('cart');

                        // Show success and redirect
                        alert('Payment successful! Order ID: ' + orderId);
                        window.location.href = 'user-dashboard.html?order=' + orderId;
                    }
                } catch (paymentError) {
                    console.error('Payment error:', paymentError);
                    alert('Payment failed: ' + paymentError.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Place Order';
                }
            } else {
                // For bank transfer and cash on delivery
                localStorage.removeItem('cart');

                if (paymentMethod === 'bank_transfer') {
                    alert('Order placed successfully! Order ID: ' + orderId + '\n\nPlease transfer the payment and send proof to shop@deedixtech.com or WhatsApp: +234 807 438-7880');
                } else {
                    alert('Order placed successfully! Order ID: ' + orderId);
                }

                window.location.href = 'user-dashboard.html?order=' + orderId;
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
