// FAQ Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Category Tab Switching
    const categoryTabs = document.querySelectorAll('.faq-tab');
    const categoryContents = document.querySelectorAll('.faq-category-content');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all category contents
            categoryContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show selected category content
            const activeContent = document.querySelector(`.faq-category-content[data-category="${category}"]`);
            if (activeContent) {
                activeContent.classList.add('active');
            }

            // Close all FAQ items when switching categories
            const allFaqItems = document.querySelectorAll('.faq-item');
            allFaqItems.forEach(item => item.classList.remove('active'));
        });
    });

    // FAQ Accordion Functionality
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items in the current category
            const currentCategory = faqItem.closest('.faq-category-content');
            const itemsInCategory = currentCategory.querySelectorAll('.faq-item');
            itemsInCategory.forEach(item => item.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Update current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // URL hash handling - open specific FAQ category from URL
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tab = document.querySelector(`.faq-tab[data-category="${hash}"]`);
            if (tab) {
                tab.click();
            }
        }
    }

    // Check hash on page load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
});
