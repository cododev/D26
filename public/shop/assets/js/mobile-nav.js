/**
 * Mobile Navigation Menu
 * Handles hamburger menu toggle and mobile navigation
 */

class MobileNav {
    constructor() {
        this.menuToggle = document.getElementById('mobileMenuToggle');
        this.nav = document.getElementById('mainNav');
        this.overlay = null;
        this.isOpen = false;

        this.init();
    }

    init() {
        if (!this.menuToggle || !this.nav) return;

        // Create overlay
        this.createOverlay();

        // Add event listeners
        this.menuToggle.addEventListener('click', () => this.toggle());

        // Close menu when clicking overlay
        this.overlay.addEventListener('click', () => this.close());

        // Close menu when clicking nav links
        const navLinks = this.nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.close(), 150);
            });
        });

        // Close menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(this.overlay);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.menuToggle.classList.add('active');
        this.nav.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.menuToggle.classList.remove('active');
        this.nav.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize mobile navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileNav();
});
