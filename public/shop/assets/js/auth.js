/**
 * Authentication Page JavaScript - Updated for JWT & Role-Based Redirect
 */

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Check if already logged in
async function checkExistingAuth() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const result = await response.json();

        if (result.success && result.data) {
            // Only customers can use shop login
            if (result.data.role === 'admin') {
                // Clear token and show message
                localStorage.removeItem('token');
                toast.warning('Admin users must login through the admin panel', 6000);
            } else {
                // Customer - redirect to shop home
                window.location.href = 'index.html';
            }
        } else {
            localStorage.removeItem('token');
        }
    } catch (error) {
        localStorage.removeItem('token');
    }
}

checkExistingAuth();

// Toggle forms
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const pageTitle = document.querySelector('.auth-page-title');

showRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
    pageTitle.textContent = 'Create Your Account';
});

showLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
    pageTitle.textContent = 'Sign in to DeediX Shop';
});

// Login Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Signing in...';

    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success && result.data && result.data.token) {
            // Only allow customers to login through shop
            if (result.data.user.role === 'admin') {
                toast.warning('Admin users must login through the admin panel');
                return;
            }

            // Save token for customer
            localStorage.setItem('token', result.data.token);
            window.location.href = 'index.html';
        } else {
            toast.error(result.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed. Please check your connection');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In <span class="btn-submit-arrow">→</span>';
    }
});

// Register Handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...';

    try {
        // Split name
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                password,
                password_confirmation: confirmPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            toast.success('Account created successfully! Please sign in');
            // Switch to login
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
            pageTitle.textContent = 'Sign in to DeediX Shop';
            document.getElementById('loginEmail').value = email;
        } else {
            toast.error(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        toast.error('Registration failed. Please try again');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account <span class="btn-submit-arrow">→</span>';
    }
});