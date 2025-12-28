/**
 * User Authentication State Manager
 * Handles user menu, logout, and authentication state across shop pages
 */

class UserAuth {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('token');
    }

    async init() {
        if (this.token) {
            await this.checkAuth();
        }
        this.updateUI();
    }

    async checkAuth() {
        try {
            const response = await api.checkAuth();
            if (response.success && response.data && response.data.authenticated) {
                // API returns user_id, email, role directly - not in a user object
                this.user = {
                    id: response.data.user_id,
                    email: response.data.email,
                    role: response.data.role,
                    first_name: response.data.email.split('@')[0], // Use email prefix as name
                    last_name: ''
                };
                return true;
            } else {
                this.clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.clearAuth();
            return false;
        }
    }

    updateUI() {
        const authBtn = document.getElementById('authBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!authBtn) return;

        if (this.user) {
            // User is logged in - show dropdown with name
            authBtn.style.display = 'none';

            if (userDropdown) {
                const firstName = this.user.first_name || this.user.name || 'User';
                const lastName = this.user.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const email = this.user.email || '';

                // Create display name: "Hi, FirstName L" (first initial of last name)
                const lastInitial = lastName.charAt(0) ? lastName.charAt(0).toUpperCase() : '';
                const displayName = lastInitial ? `Hi, ${firstName} ${lastInitial}` : `Hi, ${firstName}`;

                // Avatar initials: First initial + Last initial
                const initials = firstName.charAt(0) + (lastName.charAt(0) || firstName.charAt(1) || '');

                userDropdown.innerHTML = `
                    <button class="user-dropdown-trigger" id="userDropdownTrigger">
                        <div class="user-avatar">${initials}</div>
                        <span class="user-name">${displayName}</span>
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </button>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <div class="dropdown-header">
                            <div class="dropdown-header-name">${fullName}</div>
                            <div class="dropdown-header-email">${email}</div>
                        </div>
                        <a href="user-dashboard.html" class="dropdown-item">
                            <i class="fas fa-user-circle"></i>
                            Profile
                        </a>
                        <a href="user-dashboard.html#orders" class="dropdown-item">
                            <i class="fas fa-shopping-bag"></i>
                            My Orders
                        </a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item logout" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                `;

                userDropdown.style.display = 'block';

                const trigger = document.getElementById('userDropdownTrigger');
                const menu = document.getElementById('userDropdownMenu');

                if (trigger && menu) {
                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        trigger.classList.toggle('active');
                        menu.classList.toggle('show');
                    });

                    document.addEventListener('click', (e) => {
                        if (!userDropdown.contains(e.target)) {
                            trigger.classList.remove('active');
                            menu.classList.remove('show');
                        }
                    });
                }

                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.onclick = (e) => {
                        e.preventDefault();
                        this.logout();
                    };
                }
            }
        } else {
            // User is NOT logged in - show user icon with dropdown
            authBtn.style.display = 'none';

            if (userDropdown) {
                userDropdown.innerHTML = `
                    <button class="user-dropdown-trigger" id="guestDropdownTrigger">
                        <i class="fas fa-user"></i>
                    </button>
                    <div class="user-dropdown-menu" id="guestDropdownMenu">
                        <a href="login.html" class="dropdown-item">
                            <i class="fas fa-sign-in-alt"></i>
                            Sign In
                        </a>
                        <a href="register.html" class="dropdown-item">
                            <i class="fas fa-user-plus"></i>
                            Create Account
                        </a>
                    </div>
                `;
                userDropdown.style.display = 'block';

                const trigger = document.getElementById('guestDropdownTrigger');
                const menu = document.getElementById('guestDropdownMenu');

                if (trigger && menu) {
                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        trigger.classList.toggle('active');
                        menu.classList.toggle('show');
                    });

                    document.addEventListener('click', (e) => {
                        if (!userDropdown.contains(e.target)) {
                            trigger.classList.remove('active');
                            menu.classList.remove('show');
                        }
                    });
                }
            }
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            window.location.href = 'index.html';
        }
    }

    clearAuth() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
    }

    getUser() {
        return this.user;
    }

    isLoggedIn() {
        return this.user !== null;
    }
}

window.userAuth = new UserAuth();

document.addEventListener('DOMContentLoaded', () => {
    window.userAuth.init();
});
