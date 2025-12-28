/**
 * Payment Gateway Integration
 * Handles Paystack, Stripe, and other payment providers
 */

class PaymentGateway {
    constructor() {
        this.paystackPublicKey = 'pk_test_xxxxxxxxxxxxxxxxxxxxx'; // Replace with actual Paystack public key
        this.stripePublicKey = 'pk_test_xxxxxxxxxxxxxxxxxxxxx'; // Replace with actual Stripe public key
        this.stripe = null;
        this.paystack = null;
    }

    /**
     * Initialize payment gateways
     */
    async init() {
        // Load Paystack if available
        if (window.PaystackPop) {
            console.log('Paystack initialized');
        }

        // Load Stripe if available
        if (window.Stripe) {
            this.stripe = Stripe(this.stripePublicKey);
            console.log('Stripe initialized');
        }
    }

    /**
     * Process payment with Paystack
     * @param {Object} orderData - Order details
     * @returns {Promise}
     */
    processPaystackPayment(orderData) {
        return new Promise((resolve, reject) => {
            if (!window.PaystackPop) {
                reject(new Error('Paystack is not loaded. Please add Paystack script to your page.'));
                return;
            }

            const handler = PaystackPop.setup({
                key: this.paystackPublicKey,
                email: orderData.email,
                amount: Math.round(orderData.total * 100), // Convert to kobo (Naira cents)
                currency: 'NGN',
                ref: orderData.reference || this.generateReference(),
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Order ID",
                            variable_name: "order_id",
                            value: orderData.order_id
                        },
                        {
                            display_name: "Customer Name",
                            variable_name: "customer_name",
                            value: `${orderData.first_name} ${orderData.last_name}`
                        }
                    ]
                },
                callback: (response) => {
                    console.log('Payment successful:', response);
                    resolve({
                        success: true,
                        reference: response.reference,
                        transaction: response.transaction,
                        message: response.message
                    });
                },
                onClose: () => {
                    reject(new Error('Payment cancelled by user'));
                }
            });

            handler.openIframe();
        });
    }

    /**
     * Process payment with Stripe
     * @param {Object} orderData - Order details
     * @returns {Promise}
     */
    async processStripePayment(orderData) {
        if (!this.stripe) {
            throw new Error('Stripe is not loaded. Please add Stripe script to your page.');
        }

        try {
            // Create payment intent on your backend first
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: orderData.total,
                    currency: 'ngn',
                    order_id: orderData.order_id,
                    customer: {
                        email: orderData.email,
                        name: `${orderData.first_name} ${orderData.last_name}`
                    }
                })
            });

            const { clientSecret, error } = await response.json();

            if (error) {
                throw new Error(error);
            }

            // Confirm the payment
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: {
                        // Card element would be created in the UI
                    },
                    billing_details: {
                        name: `${orderData.first_name} ${orderData.last_name}`,
                        email: orderData.email,
                        address: {
                            line1: orderData.address,
                            city: orderData.city,
                            state: orderData.state,
                            country: 'NG'
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return {
                success: true,
                paymentIntent: result.paymentIntent
            };
        } catch (error) {
            console.error('Stripe payment error:', error);
            throw error;
        }
    }

    /**
     * Verify payment status
     * @param {string} reference - Payment reference
     * @param {string} provider - Payment provider (paystack/stripe)
     * @returns {Promise}
     */
    async verifyPayment(reference, provider = 'paystack') {
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    reference,
                    provider
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }

    /**
     * Generate unique payment reference
     * @returns {string}
     */
    generateReference() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        return `DDX-${timestamp}-${random}`;
    }

    /**
     * Format amount for display
     * @param {number} amount
     * @returns {string}
     */
    formatAmount(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentGateway;
}

// Make available globally
window.PaymentGateway = PaymentGateway;
