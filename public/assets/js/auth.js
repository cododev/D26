/**
 * Authentication Page JavaScript
 */

// Set current year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Check if already logged in with valid token
async function checkExistingAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await api.checkAuth();
            if (response.success && response.data && response.data.authenticated) {
                window.location.href = 'index.html';
            } else {
                // Token exists but is invalid, clear it
                localStorage.removeItem('token');
            }
        } catch (error) {
            // Auth check failed, clear invalid token
            localStorage.removeItem('token');
        }
    }
}

checkExistingAuth();

// Toggle between login and register forms
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const pageTitle = document.querySelector('.auth-page-title');

showRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Create Your Account';
});

showLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
    if (pageTitle) pageTitle.textContent = 'Sign in to DeediX Shop';
});

// Login Form Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
        const response = await api.login(email, password);

        if (response.success) {
            // Store the token
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert(response.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In<span class="btn-submit-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>';
    }
});

// Register Form Handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating account...<span class="btn-submit-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>';

    try {
        // Split name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const response = await api.register({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            password,
            password_confirmation: confirmPassword
        });

        if (response.success) {
            alert('Registration successful! Please log in with your new account.');
            // Switch to login form
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
            if (pageTitle) pageTitle.textContent = 'Sign in to DeediX Shop';
            // Pre-fill email in login form
            document.getElementById('loginEmail').value = email;
        } else {
            alert(response.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please check your connection and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account<span class="btn-submit-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>';
    }
});
