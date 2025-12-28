/**
 * DeediX Technologies - Training Page JavaScript
 * Filter and interaction handling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get filter elements
    const roleFilter = document.getElementById('roleFilter');
    const levelFilter = document.getElementById('levelFilter');
    const productFilter = document.getElementById('productFilter');
    const trainingCards = document.querySelectorAll('.learning-path-card');

    // Filter function
    function filterTrainingCards() {
        const selectedRole = roleFilter.value;
        const selectedLevel = levelFilter.value;
        const selectedProduct = productFilter.value;

        trainingCards.forEach(card => {
            const cardRole = card.getAttribute('data-role');
            const cardLevel = card.getAttribute('data-level');

            // Check if card matches filters
            const matchesRole = selectedRole === 'all' || cardRole === selectedRole || cardRole === 'all';
            const matchesLevel = selectedLevel === 'all' || cardLevel === selectedLevel || cardLevel === 'all';

            // Show or hide card based on filters
            if (matchesRole && matchesLevel) {
                card.style.display = 'flex';
                // Add fade-in animation
                card.style.animation = 'fadeInUp 0.4s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });

        // Check if no cards are visible
        const visibleCards = Array.from(trainingCards).filter(card => card.style.display !== 'none');

        if (visibleCards.length === 0) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
        }
    }

    // Show "no results" message
    function showNoResultsMessage() {
        // Check if message already exists
        let noResultsMsg = document.querySelector('.no-results-message');

        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.5rem; color: #64748b; margin-bottom: 0.5rem;">No training paths found</h3>
                    <p style="color: #94a3b8;">Try adjusting your filters to see more results</p>
                </div>
            `;
            document.querySelector('.training-grid').appendChild(noResultsMsg);
        }

        noResultsMsg.style.display = 'block';
    }

    // Hide "no results" message
    function hideNoResultsMessage() {
        const noResultsMsg = document.querySelector('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }

    // Add event listeners to filters
    if (roleFilter) {
        roleFilter.addEventListener('change', filterTrainingCards);
    }

    if (levelFilter) {
        levelFilter.addEventListener('change', filterTrainingCards);
    }

    if (productFilter) {
        productFilter.addEventListener('change', filterTrainingCards);
    }

    // Smooth scroll for hero CTA
    const browseCTA = document.querySelector('a[href="#browse-trainings"]');
    if (browseCTA) {
        browseCTA.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.getElementById('browse-trainings');
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Add card click analytics (optional - for future use)
    trainingCards.forEach(card => {
        const enrollLink = card.querySelector('.btn-link');
        if (enrollLink) {
            enrollLink.addEventListener('click', function(e) {
                const cardTitle = card.querySelector('.learning-path-title').textContent;
                console.log('User clicked on training:', cardTitle);
                // You can add analytics tracking here
            });
        }
    });

    // Add hover effect enhancement for topic pills
    const topicPills = document.querySelectorAll('.topic-pill');
    topicPills.forEach(pill => {
        pill.addEventListener('click', function() {
            // Optional: Add click functionality to topic pills
            // For example, you could filter by topic or show more info
            console.log('Topic clicked:', this.textContent);
        });
    });
});
