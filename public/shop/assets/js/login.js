/**
 * Enhanced Login Page with Toast Notifications
 * Handles registration success redirects
 */

// Check URL parameters for registration success
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('registered') === 'true') {
    const email = urlParams.get('email');

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        // Pre-fill email
        if (email) {
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                emailInput.value = decodeURIComponent(email);
            }
        }

        // Show success toast
        if (window.toast) {
            toast.success('Account created successfully! Please sign in to continue.', 6000);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    });
}
