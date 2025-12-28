/**
 * Registration Page Logic
 * Silicon Valley-level UX with real-time validation
 */

document.getElementById('currentYear').textContent = new Date().getFullYear();

const form = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');

const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumber = document.getElementById('req-number');

const validation = { fullName: false, email: false, password: false, confirmPassword: false };

fullNameInput.addEventListener('blur', () => {
    const value = fullNameInput.value.trim();
    const formGroup = fullNameInput.closest('.form-group');
    if (value.length < 3) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        validation.fullName = false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        validation.fullName = true;
    }
});

emailInput.addEventListener('blur', () => {
    const value = emailInput.value.trim();
    const formGroup = emailInput.closest('.form-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        validation.email = false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        validation.email = true;
    }
});

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    passwordStrength.classList.add('show');
    
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    reqLength.classList.toggle('met', hasLength);
    reqUppercase.classList.toggle('met', hasUppercase);
    reqLowercase.classList.toggle('met', hasLowercase);
    reqNumber.classList.toggle('met', hasNumber);
    
    const metRequirements = [hasLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;
    
    strengthFill.className = 'strength-fill';
    if (metRequirements <= 2) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#ef4444';
        validation.password = false;
    } else if (metRequirements === 3) {
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium strength';
        strengthText.style.color = '#f59e0b';
        validation.password = false;
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#10b981';
        validation.password = true;
    }
    
    const formGroup = passwordInput.closest('.form-group');
    if (validation.password) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    }
});

confirmPasswordInput.addEventListener('input', () => {
    const formGroup = confirmPasswordInput.closest('.form-group');
    if (confirmPasswordInput.value !== passwordInput.value) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        validation.confirmPassword = false;
    } else if (confirmPasswordInput.value.length > 0) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        validation.confirmPassword = true;
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (fullName.length < 3) {
        toast.error('Please enter your full name');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Please enter a valid email address');
        return;
    }
    
    if (!validation.password) {
        toast.error('Password must meet all requirements');
        return;
    }
    
    if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    
    if (!document.getElementById('termsCheckbox').checked) {
        toast.error('Please agree to the Terms & Conditions');
        return;
    }
    
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    try {
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const response = await api.register({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phone || null,
            password,
            password_confirmation: confirmPassword
        });
        
        if (response.success) {
            toast.success('Account created successfully! Redirecting to login...');
            form.reset();
            passwordStrength.classList.remove('show');
            setTimeout(() => {
                window.location.href = 'login.html?registered=true&email=' + encodeURIComponent(email);
            }, 2000);
        } else {
            toast.error(response.message || 'Registration failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Registration error:', error);
        toast.error('An error occurred. Please check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});
