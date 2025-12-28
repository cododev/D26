/**
 * DeediX Shop Frontend
 * Main shop functionality using API
 */

let currentPage = 1;
let currentFilters = {};
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    await checkAuthentication();
    await loadProducts();
    setupEventListeners();

    // Always update cart count on page load (handles both logged in and guest users)
    updateCartCount();
});

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
    try {
        const response = await api.checkAuth();

        if (response.success && response.data && response.data.authenticated) {
            currentUser = response.data;
            showUserMenu(response.data);
            await updateCartCount();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

/**
 * Show user menu when logged in
 */
function showUserMenu(user) {
    const authBtn = document.getElementById('authBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');

    if (authBtn) authBtn.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'block';
    if (userName) userName.textContent = user.user?.name || user.user_name || 'User';
}

/**
 * Load products from API
 */
async function loadProducts(filters = {}, page = 1) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('productsGrid');

    loading.style.display = 'block';
    grid.innerHTML = '';

    try {
        const response = await api.getProducts({
            ...filters,
            page,
            limit: 20
        });

        if (response.success) {
            displayProducts(response.data.products);
            displayPagination(response.data.pagination);
        }
    } catch (error) {
        grid.innerHTML = `<p class="error">Failed to load products: ${error.message}</p>`;
    } finally {
        loading.style.display = 'none';
    }
}

/**
 * Display products in grid
 */
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');

    if (products.length === 0) {
        grid.innerHTML = '<p class="no-products">No products found</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // Generate badges HTML
        const badges = [];
        if (product.stock === 0 || product.stock === '0') {
            badges.push('<span class="badge badge-out-of-stock">Out of Stock</span>');
        } else {
            if (product.is_new == 1) badges.push('<span class="badge badge-new">New</span>');
            if (product.is_featured == 1) badges.push('<span class="badge badge-featured">Featured</span>');
            if (product.is_popular == 1) badges.push('<span class="badge badge-popular">Popular</span>');
        }

        const badgesHTML = badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : '';

        // Calculate discount percentage if compare price exists
        let discountPercent = '';
        if (product.compare_price && product.compare_price > product.price) {
            const discount = Math.round(((product.compare_price - product.price) / product.compare_price) * 100);
            discountPercent = `<span class="badge badge-sale">-${discount}%</span>`;
        }

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image-wrapper">
                    ${badgesHTML}
                    ${discountPercent ? `<div class="product-badges" style="top: 0.75rem; right: 0.75rem; left: auto;">${discountPercent}</div>` : ''}
                    <img class="product-image"
                         src="${product.primary_image || '../images/placeholder.jpg'}"
                         alt="${product.name}"
                         onerror="this.src='../images/placeholder.jpg'">
                    <button class="quick-view-btn" onclick="quickViewProduct(${product.id}); event.stopPropagation();">
                        Quick View
                    </button>
                </div>

                <div class="product-info">
                    <p class="product-category">${product.category_name || 'Uncategorized'}${product.subcategory_name ? ' • ' + product.subcategory_name : ''}</p>
                    <h3 class="product-name">${product.name}</h3>
                    ${product.short_description ? `<p class="product-description">${product.short_description}</p>` : ''}

                    <div class="product-footer">
                        <div class="product-price-wrapper">
                            ${product.compare_price && product.compare_price > product.price ?
                                `<span class="product-price-old">₦${formatPrice(product.compare_price)}</span>` : ''}
                            <span class="product-price">₦${formatPrice(product.price)}</span>
                        </div>
                        ${product.rating ? `
                            <div class="product-rating">
                                <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                                <span>(${product.rating})</span>
                            </div>
                        ` : ''}
                    </div>

                    <button class="add-to-cart-btn"
                            onclick="addToCart(${product.id}); event.stopPropagation();"
                            ${product.stock === 0 || product.stock === '0' ? 'disabled' : ''}>
                        ${product.stock === 0 || product.stock === '0' ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add click event listeners to product cards for navigation
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const productId = card.dataset.id;
                    viewProduct(productId);
                }
            });
        });
    }, 0);
}

/**
 * Display pagination
 */
function displayPagination(pagination) {
    const container = document.getElementById('pagination');

    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-buttons">';

    // Previous button
    if (pagination.page > 1) {
        html += `<button onclick="changePage(${pagination.page - 1})">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === pagination.pages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button onclick="changePage(${i})">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += '<span>...</span>';
        }
    }

    // Next button
    if (pagination.page < pagination.pages) {
        html += `<button onclick="changePage(${pagination.page + 1})">Next</button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    currentPage = page;
    loadProducts(currentFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * View product details
 */
async function viewProduct(productId) {
    try {
        const response = await api.getProduct(productId);

        if (response.success) {
            showProductModal(response.data);
        }
    } catch (error) {
        alert('Failed to load product details');
    }
}

/**
 * Quick view product (same as viewProduct for now)
 */
async function quickViewProduct(productId) {
    // For now, use the same modal as viewProduct
    // In Phase 2, we can create a separate quick-view modal with minimal details
    await viewProduct(productId);
}

/**
 * Show product modal
 */
function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="product-detail">
            <div class="product-images">
                <img src="${product.images?.[0]?.image_url || '/assets/images/placeholder.png'}"
                     alt="${product.name}">
            </div>

            <div class="product-details">
                <h2>${product.name}</h2>
                <p class="category">${product.category_name} • ${product.subcategory_name}</p>

                <div class="price-section">
                    ${product.compare_price ? `<span class="old-price">₦${formatPrice(product.compare_price)}</span>` : ''}
                    <span class="price">₦${formatPrice(product.price)}</span>
                </div>

                <div class="description">
                    ${product.full_description || product.short_description}
                </div>

                <div class="stock-info">
                    <span class="${product.stock > 0 ? 'in-stock' : 'out-stock'}">
                        ${product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                    </span>
                </div>

                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <input type="number" id="modalQuantity" value="1" min="1" max="${product.stock}">
                </div>

                <button class="btn-add-cart" onclick="addToCartFromModal(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

/**
 * Add to cart
 */
async function addToCart(productId, quantity = 1) {
    // For non-logged in users, use localStorage cart
    if (!currentUser) {
        addToLocalStorageCart(productId, quantity);
        return;
    }

    try {
        await api.addToCart(productId, quantity);
        await updateCartCount();

        // Also sync to localStorage for consistency
        syncApiCartToLocalStorage();

        showNotification('Product added to cart!');
    } catch (error) {
        // Fallback to localStorage if API fails
        console.error('API cart failed, using localStorage:', error);
        addToLocalStorageCart(productId, quantity);
    }
}

/**
 * Add to localStorage cart (fallback for non-authenticated users)
 */
function addToLocalStorageCart(productId, quantity = 1) {
    // Find the product in the products array
    const product = products.find(p => p.id === productId);

    if (!product) {
        alert('Product not found');
        return;
    }

    // Get existing cart from localStorage
    let cart = [];
    try {
        const stored = localStorage.getItem('cart');
        cart = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        cart = [];
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count display
    updateCartCountFromLocalStorage();

    // Show notification
    showNotification('Product added to cart!');

    // Suggest login for better experience
    if (!currentUser) {
        setTimeout(() => {
            if (confirm('Sign in for a better shopping experience and to save your cart?')) {
                localStorage.setItem('returnUrl', window.location.pathname);
                window.location.href = 'login.html';
            }
        }, 1500);
    }
}

/**
 * Sync API cart to localStorage
 */
async function syncApiCartToLocalStorage() {
    try {
        const response = await api.getCart();
        if (response.success && response.data.items) {
            localStorage.setItem('cart', JSON.stringify(response.data.items));
        }
    } catch (error) {
        console.error('Failed to sync cart to localStorage:', error);
    }
}

/**
 * Update cart count from localStorage
 */
function updateCartCountFromLocalStorage() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    try {
        const stored = localStorage.getItem('cart');
        const cart = stored ? JSON.parse(stored) : [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.classList.remove('hidden');
        } else {
            cartCountElement.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
        cartCountElement.classList.add('hidden');
    }
}

/**
 * Add to cart from modal
 */
async function addToCartFromModal(productId) {
    const quantity = parseInt(document.getElementById('modalQuantity').value);
    await addToCart(productId, quantity);
    document.getElementById('productModal').style.display = 'none';
}

/**
 * Update cart count
 */
async function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;

    // If not logged in, use localStorage cart
    if (!currentUser) {
        updateCartCountFromLocalStorage();
        return;
    }

    try {
        const response = await api.getCart();

        if (response.success && response.data.item_count > 0) {
            cartCountElement.textContent = response.data.item_count;
            cartCountElement.classList.remove('hidden');
        } else {
            // Fallback to localStorage
            updateCartCountFromLocalStorage();
        }
    } catch (error) {
        console.error('Failed to update cart count from API, using localStorage');
        updateCartCountFromLocalStorage();
    }
}

/**
 * Show notification
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

/**
 * Format price
 */
function formatPrice(price) {
    return parseFloat(price).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.dataset.filter;

            if (filter === 'all') {
                currentFilters = {};
            } else {
                currentFilters = { [filter]: 1 };
            }

            currentPage = 1;
            await loadProducts(currentFilters, 1);
        });
    });

    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn?.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (query) {
            currentFilters = { search: query };
            currentPage = 1;
            await loadProducts(currentFilters, 1);
        }
    });

    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await api.logout();
            window.location.reload();
        } catch (error) {
            alert('Logout failed');
        }
    });

    // Modal close
    document.querySelector('.close')?.addEventListener('click', () => {
        document.getElementById('productModal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize hero slider
    initHeroSlider();
}

/**
 * Hero Slider Functionality
 */
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicator');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');

    if (!slides.length) return;

    let currentSlide = 0;
    let slideInterval;

    // Change slide function
    function goToSlide(index) {
        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');

        currentSlide = index;
    }

    // Next slide
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        goToSlide(next);
    }

    // Previous slide
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) prev = slides.length - 1;
        goToSlide(prev);
    }

    // Auto advance slides
    function startAutoPlay() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    function stopAutoPlay() {
        clearInterval(slideInterval);
    }

    // Event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay(); // Restart autoplay after manual navigation
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
            stopAutoPlay();
            startAutoPlay();
        });
    });

    // Pause on hover
    const heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
        heroBanner.addEventListener('mouseenter', stopAutoPlay);
        heroBanner.addEventListener('mouseleave', startAutoPlay);
    }

    // Start autoplay
    startAutoPlay();
}
