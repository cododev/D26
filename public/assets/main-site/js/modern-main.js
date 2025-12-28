/**
 * DeediX Technologies - Modern Main JavaScript
 * Advanced yet simple, vanilla ES6+ implementation
 * No external dependencies required
 */

'use strict';

// ==========================================
// DOM Elements
// ==========================================
const DOM = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    backToTop: document.getElementById('backToTop'),
    heroImages: document.querySelectorAll('.hero-image'),
    statNumbers: document.querySelectorAll('.stat-number'),
    testimonialCards: document.querySelectorAll('.testimonial-card'),
    testimonialPrev: document.querySelector('.testimonial-btn.prev'),
    testimonialNext: document.querySelector('.testimonial-btn.next'),
    testimonialDots: document.querySelector('.testimonial-dots')
};

// ==========================================
// State Management
// ==========================================
const state = {
    currentHeroImage: 0,
    currentTestimonial: 0,
    heroImageInterval: null,
    hasAnimatedStats: false,
    isMenuOpen: false
};

// ==========================================
// Utility Functions
// ==========================================
const utils = {
    /**
     * Debounce function to limit function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function execution rate
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Animate number from start to end
     */
    animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
};

// ==========================================
// Navigation Functions
// ==========================================
const navigation = {
    /**
     * Initialize navigation functionality
     */
    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.highlightActiveSection();
    },

    /**
     * Add scroll effect to navbar
     */
    setupScrollEffect() {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                DOM.navbar.classList.add('scrolled');
            } else {
                DOM.navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', utils.throttle(handleScroll, 100));
    },

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        if (!DOM.navToggle || !DOM.navMenu) return;

        DOM.navToggle.addEventListener('click', () => {
            state.isMenuOpen = !state.isMenuOpen;
            DOM.navToggle.classList.toggle('active');
            DOM.navMenu.classList.toggle('active');
            DOM.navToggle.setAttribute('aria-expanded', state.isMenuOpen);
        });

        // Close menu when clicking on a link
        const navLinks = DOM.navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (state.isMenuOpen) {
                    DOM.navToggle.click();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (state.isMenuOpen &&
                !DOM.navMenu.contains(e.target) &&
                !DOM.navToggle.contains(e.target)) {
                DOM.navToggle.click();
            }
        });
    },

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || !href) return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const navHeight = DOM.navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    },

    /**
     * Highlight active section in navigation
     */
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        };

        window.addEventListener('scroll', utils.throttle(handleScroll, 100));
    }
};

// ==========================================
// Hero Section Functions
// ==========================================
const hero = {
    /**
     * Initialize hero section functionality
     */
    init() {
        this.setupImageSlider();
        this.setupStatsAnimation();
    },

    /**
     * Setup automatic image slider
     */
    setupImageSlider() {
        if (!DOM.heroImages.length) return;

        const changeImage = () => {
            DOM.heroImages[state.currentHeroImage].classList.remove('active');
            state.currentHeroImage = (state.currentHeroImage + 1) % DOM.heroImages.length;
            DOM.heroImages[state.currentHeroImage].classList.add('active');
        };

        state.heroImageInterval = setInterval(changeImage, 4000);

        // Pause on hover
        const imageWrapper = document.querySelector('.hero-image-wrapper');
        if (imageWrapper) {
            imageWrapper.addEventListener('mouseenter', () => {
                clearInterval(state.heroImageInterval);
            });

            imageWrapper.addEventListener('mouseleave', () => {
                state.heroImageInterval = setInterval(changeImage, 4000);
            });
        }
    },

    /**
     * Animate statistics numbers
     */
    setupStatsAnimation() {
        if (!DOM.statNumbers.length) return;

        const animateStats = () => {
            if (state.hasAnimatedStats) return;

            const statsSection = document.querySelector('.hero-stats');
            if (!statsSection || !utils.isInViewport(statsSection)) return;

            state.hasAnimatedStats = true;
            DOM.statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                utils.animateNumber(stat, 0, target, 2000);
            });
        };

        window.addEventListener('scroll', utils.throttle(animateStats, 100));
        animateStats(); // Check on load
    }
};

// ==========================================
// Testimonials Functions
// ==========================================
const testimonials = {
    /**
     * Initialize testimonials slider
     */
    init() {
        if (!DOM.testimonialCards.length) return;

        this.createDots();
        this.setupControls();
        this.setupAutoPlay();
    },

    /**
     * Create navigation dots
     */
    createDots() {
        if (!DOM.testimonialDots) return;

        DOM.testimonialCards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('testimonial-dot');
            dot.setAttribute('type', 'button');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => this.goToSlide(index));
            DOM.testimonialDots.appendChild(dot);
        });

        // Add dot styles dynamically
        this.addDotStyles();
    },

    /**
     * Add styles for dots
     */
    addDotStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .testimonial-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #d1d5db;
                transition: all 0.3s ease;
            }
            .testimonial-dot.active {
                width: 30px;
                border-radius: 5px;
                background: linear-gradient(135deg, #0066ff, #6c63ff);
            }
            .testimonial-dot:hover {
                background: #9ca3af;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Setup previous/next controls
     */
    setupControls() {
        if (DOM.testimonialPrev) {
            DOM.testimonialPrev.addEventListener('click', () => this.previousSlide());
        }

        if (DOM.testimonialNext) {
            DOM.testimonialNext.addEventListener('click', () => this.nextSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    },

    /**
     * Setup auto-play
     */
    setupAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 6000);

        // Pause on hover
        const slider = document.querySelector('.testimonials-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                clearInterval(this.autoPlayInterval);
            });

            slider.addEventListener('mouseleave', () => {
                this.autoPlayInterval = setInterval(() => this.nextSlide(), 6000);
            });
        }
    },

    /**
     * Go to specific slide
     */
    goToSlide(index) {
        DOM.testimonialCards[state.currentTestimonial].classList.remove('active');
        const dots = document.querySelectorAll('.testimonial-dot');
        if (dots[state.currentTestimonial]) {
            dots[state.currentTestimonial].classList.remove('active');
        }

        state.currentTestimonial = index;
        DOM.testimonialCards[state.currentTestimonial].classList.add('active');
        if (dots[state.currentTestimonial]) {
            dots[state.currentTestimonial].classList.add('active');
        }
    },

    /**
     * Go to next slide
     */
    nextSlide() {
        const next = (state.currentTestimonial + 1) % DOM.testimonialCards.length;
        this.goToSlide(next);
    },

    /**
     * Go to previous slide
     */
    previousSlide() {
        const prev = state.currentTestimonial === 0
            ? DOM.testimonialCards.length - 1
            : state.currentTestimonial - 1;
        this.goToSlide(prev);
    }
};

// ==========================================
// Scroll Animations
// ==========================================
const scrollAnimations = {
    /**
     * Initialize scroll reveal animations
     */
    init() {
        this.setupScrollReveal();
    },

    /**
     * Setup scroll reveal for elements
     */
    setupScrollReveal() {
        const revealElements = document.querySelectorAll(`
            .service-card,
            .client-card,
            .section-header
        `);

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
};

// ==========================================
// Back to Top Button
// ==========================================
const backToTop = {
    /**
     * Initialize back to top functionality
     */
    init() {
        if (!DOM.backToTop) return;

        this.setupVisibility();
        this.setupClick();
    },

    /**
     * Show/hide button based on scroll position
     */
    setupVisibility() {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                DOM.backToTop.classList.add('visible');
            } else {
                DOM.backToTop.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', utils.throttle(handleScroll, 100));
    },

    /**
     * Setup click handler
     */
    setupClick() {
        DOM.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ==========================================
// Performance Optimizations
// ==========================================
const performance = {
    /**
     * Initialize performance optimizations
     */
    init() {
        this.lazyLoadImages();
        this.prefetchLinks();
    },

    /**
     * Lazy load images
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('loading' in HTMLImageElement.prototype) {
            // Browser supports native lazy loading
            return;
        }

        // Fallback for browsers that don't support lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    /**
     * Prefetch important links
     */
    prefetchLinks() {
        const importantLinks = document.querySelectorAll('a[href$=".html"]');

        const linkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                    linkObserver.unobserve(link);
                }
            });
        });

        importantLinks.forEach(link => linkObserver.observe(link));
    }
};

// ==========================================
// Form Enhancements (if contact forms exist)
// ==========================================
const forms = {
    /**
     * Initialize form enhancements
     */
    init() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => this.enhanceForm(form));
    },

    /**
     * Enhance individual form
     */
    enhanceForm(form) {
        // Add floating label effect
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement?.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement?.classList.remove('focused');
                }
            });
        });

        // Add real-time validation
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                this.showValidationErrors(form);
            }
        });
    },

    /**
     * Show validation errors
     */
    showValidationErrors(form) {
        const invalidInputs = form.querySelectorAll(':invalid');
        invalidInputs.forEach(input => {
            input.classList.add('error');
            const errorMsg = input.validationMessage;
            console.log(`Validation error: ${errorMsg}`);
        });
    }
};

// ==========================================
// Auto-Update Year
// ==========================================
const autoUpdateYear = () => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
};

// ==========================================
// Initialize Everything
// ==========================================
const app = {
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },

    start() {
        console.log('🚀 DeediX Technologies - Website Initialized');

        // Update year in footer
        autoUpdateYear();

        // Initialize all modules
        navigation.init();
        hero.init();
        testimonials.init();
        scrollAnimations.init();
        backToTop.init();
        performance.init();
        forms.init();

        // Add loaded class to body for CSS animations
        document.body.classList.add('loaded');
    }
};

// Start the application
app.init();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, navigation, hero, testimonials, utils };
}
