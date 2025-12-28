/**
 * Product Manager
 * Handles product modal, image picker, and bulk upload functionality
 */

let categories = [];
let subcategories = [];
let availableImages = [];
let selectedImagePath = '';

// Initialize product manager
document.addEventListener('DOMContentLoaded', () => {
    initializeProductModal();
    initializeImageUpload();
    initializeBulkUpload();
    loadCategoriesForModal();
});

// ===================================
// Product Modal Management
// ===================================

function initializeProductModal() {
    const modal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelSingleProductBtn');
    const singleProductForm = document.getElementById('singleProductForm');

    // Open modal
    addProductBtn?.addEventListener('click', () => {
        openProductModal();
    });

    // Close modal
    closeBtn?.addEventListener('click', () => {
        closeProductModal();
    });

    cancelBtn?.addEventListener('click', () => {
        closeProductModal();
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProductModal();
        }
    });

    // Modal tabs
    const tabBtns = modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-modal-tab');
            switchModalTab(targetTab);
        });
    });

    // Category change handler
    const categorySelect = document.getElementById('productCategory');
    categorySelect?.addEventListener('change', (e) => {
        updateSubcategoryOptions(parseInt(e.target.value));
    });

    // Auto-generate SKU from product name
    const productName = document.getElementById('productName');
    productName?.addEventListener('blur', (e) => {
        const skuInput = document.getElementById('productSKU');
        if (!skuInput.value && e.target.value) {
            const slug = e.target.value.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            skuInput.value = slug.toUpperCase().substring(0, 20);
        }
    });

    // Form submission
    singleProductForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSingleProductSubmit(e.target);
    });
}

function openProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    resetSingleProductForm();
}

function switchModalTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.modal-tabs .tab-btn');
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-modal-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.modal-tab-content');
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

async function loadCategoriesForModal() {
    try {
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');

        const response = await fetch('/api/v1/admin/categories', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.success) {
            categories = data.data.categories || [];
            subcategories = data.data.subcategories || [];

            const categorySelect = document.getElementById('productCategory');
            categorySelect.innerHTML = '<option value="">Select Category</option>';

            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function updateSubcategoryOptions(categoryId) {
    const subcategorySelect = document.getElementById('productSubcategory');
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

    if (categoryId) {
        const filteredSubs = subcategories.filter(sub => sub.category_id === categoryId);
        filteredSubs.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            subcategorySelect.appendChild(option);
        });
    }
}

async function handleSingleProductSubmit(form) {
    const submitBtn = document.getElementById('saveSingleProductBtn');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding Product...';

        let imageUrl = '';

        // Upload image first if there's an uploaded file
        if (uploadedImageFile) {
            submitBtn.textContent = 'Uploading Image...';
            imageUrl = await uploadImage(uploadedImageFile);

            if (!imageUrl) {
                throw new Error('Image upload failed');
            }
        }

        submitBtn.textContent = 'Adding Product...';

        const formData = new FormData(form);
        const productData = {
            name: formData.get('name'),
            category_id: formData.get('category_id'),
            subcategory_id: formData.get('subcategory_id') || null,
            sku: formData.get('sku'),
            price: parseFloat(formData.get('price')),
            compare_price: formData.get('compare_price') ? parseFloat(formData.get('compare_price')) : null,
            stock: parseInt(formData.get('stock')),
            short_description: formData.get('short_description'),
            full_description: formData.get('full_description'),
            image: imageUrl,
            is_featured: formData.get('is_featured') ? 1 : 0,
            is_popular: formData.get('is_popular') ? 1 : 0,
            is_new: formData.get('is_new') ? 1 : 0,
            is_active: formData.get('is_active') ? 1 : 0
        };

        const token = localStorage.getItem('token');

        const response = await fetch('/api/v1/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Product added successfully!');
            closeProductModal();

            // Reload products if we're on the products tab
            if (typeof loadDashboardStats === 'function') {
                await loadDashboardStats();
                loadProductsTab();
            }
        } else {
            alert(data.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function uploadImage(file) {
    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/v1/admin/upload-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            console.error('Image upload failed:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

function resetSingleProductForm() {
    const form = document.getElementById('singleProductForm');
    form.reset();

    // Reset image upload
    removeUploadedImage();

    // Reset subcategory options
    const subcategorySelect = document.getElementById('productSubcategory');
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
}

// ===================================
// Image Upload (Direct File Upload)
// ===================================

let uploadedImageFile = null;

function initializeImageUpload() {
    const uploadZone = document.getElementById('imageUploadZone');
    const fileInput = document.getElementById('imageFileInput');
    const uploadPreview = document.getElementById('uploadPreview');

    // Click to upload
    uploadZone?.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone?.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        } else {
            alert('Please drop an image file');
        }
    });
}

function handleImageFile(file) {
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    uploadedImageFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        const uploadPreview = document.getElementById('uploadPreview');
        const fileSize = (file.size / 1024).toFixed(2);

        uploadPreview.className = 'upload-preview has-image';
        uploadPreview.innerHTML = `
            <img src="${e.target.result}" alt="Product image preview">
            <div class="image-info">
                <strong>${file.name}</strong> (${fileSize} KB)
            </div>
            <button type="button" class="remove-image" onclick="removeUploadedImage()">Remove Image</button>
        `;

        // Store file for upload
        document.getElementById('selectedImagePath').value = 'pending_upload';
    };

    reader.readAsDataURL(file);
}

function removeUploadedImage() {
    uploadedImageFile = null;

    const uploadPreview = document.getElementById('uploadPreview');
    uploadPreview.className = 'upload-preview';
    uploadPreview.innerHTML = `
        <span class="upload-icon">🖼️</span>
        <h4>Click or Drag & Drop Image</h4>
        <p>Supports: JPG, PNG, GIF, WEBP (Max 5MB)</p>
    `;

    const fileInput = document.getElementById('imageFileInput');
    fileInput.value = '';
    document.getElementById('selectedImagePath').value = '';
}

// ===================================
// Bulk Upload
// ===================================

function initializeBulkUpload() {
    const dropzone = document.getElementById('bulkUploadDropzone');
    const fileInput = document.getElementById('bulkFileInput');
    const downloadCSVBtn = document.getElementById('downloadCSVTemplateBtn');
    const downloadJSONBtn = document.getElementById('downloadJSONTemplateBtn');
    const closeResultsBtn = document.getElementById('closeResultsBtn');

    // Drag and drop
    dropzone?.addEventListener('click', () => {
        fileInput.click();
    });

    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone?.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });

    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleBulkFile(files[0]);
        }
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleBulkFile(e.target.files[0]);
        }
    });

    // Download templates
    downloadCSVBtn?.addEventListener('click', () => {
        downloadCSVTemplate();
    });

    downloadJSONBtn?.addEventListener('click', () => {
        downloadJSONTemplate();
    });

    // Close results
    closeResultsBtn?.addEventListener('click', () => {
        resetBulkUpload();
    });
}

async function handleBulkFile(file) {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (!['csv', 'json'].includes(fileType)) {
        alert('Please upload a CSV or JSON file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result;
        let products = [];

        try {
            if (fileType === 'csv') {
                products = parseCSV(content);
            } else {
                products = JSON.parse(content);
            }

            await processBulkUpload(products);
        } catch (error) {
            console.error('Failed to parse file:', error);
            alert('Failed to parse file. Please check the format.');
        }
    };

    reader.readAsText(file);
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product = {};

        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });

        products.push(product);
    }

    return products;
}

async function processBulkUpload(products) {
    const progressSection = document.getElementById('uploadProgress');
    const resultsSection = document.getElementById('uploadResults');
    const dropzone = document.getElementById('bulkUploadDropzone');

    // Hide dropzone, show progress
    dropzone.style.display = 'none';
    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const progress = Math.round(((i + 1) / products.length) * 100);

        // Update progress
        updateProgress(progress, i + 1, products.length);

        try {
            // Convert CSV fields to proper format
            const productData = {
                name: product.name || product.product_name,
                category_id: parseInt(product.category_id),
                subcategory_id: product.subcategory_id ? parseInt(product.subcategory_id) : null,
                sku: product.sku,
                price: parseFloat(product.price),
                compare_price: product.compare_price ? parseFloat(product.compare_price) : null,
                stock: parseInt(product.stock || 0),
                short_description: product.short_description || '',
                full_description: product.full_description || product.description || '',
                image: product.image || product.image_url,
                is_featured: parseInt(product.is_featured || 0),
                is_popular: parseInt(product.is_popular || 0),
                is_new: parseInt(product.is_new || 0),
                is_active: parseInt(product.is_active || 1)
            };

            const token = localStorage.getItem('token');

            const response = await fetch('/api/v1/admin/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (data.success) {
                successCount++;
            } else {
                errorCount++;
                errors.push(`Row ${i + 1}: ${data.message || 'Failed to add product'}`);
            }
        } catch (error) {
            errorCount++;
            errors.push(`Row ${i + 1}: ${error.message}`);
        }
    }

    // Show results
    showUploadResults(successCount, errorCount, errors);

    // Reload products
    if (typeof loadProductsTab === 'function') {
        await loadDashboardStats();
        loadProductsTab();
    }
}

function updateProgress(percent, current, total) {
    const progressFill = document.getElementById('uploadProgressFill');
    const progressText = document.getElementById('uploadProgressText');
    const progressDetails = document.getElementById('uploadProgressDetails');

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
    progressDetails.textContent = `Processing ${current} of ${total} products...`;
}

function showUploadResults(successCount, errorCount, errors) {
    const progressSection = document.getElementById('uploadProgress');
    const resultsSection = document.getElementById('uploadResults');
    const summaryDiv = document.getElementById('uploadResultsSummary');
    const errorsDiv = document.getElementById('uploadResultsErrors');

    // Hide progress, show results
    progressSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Summary
    summaryDiv.innerHTML = `
        <p><strong>Total Processed:</strong> ${successCount + errorCount}</p>
        <p><strong>Successful:</strong> ${successCount}</p>
        <p><strong>Failed:</strong> ${errorCount}</p>
    `;

    // Errors
    if (errors.length > 0) {
        errorsDiv.classList.add('show');
        errorsDiv.innerHTML = `
            <h5>Errors:</h5>
            <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
        `;
    } else {
        errorsDiv.classList.remove('show');
    }
}

function resetBulkUpload() {
    const progressSection = document.getElementById('uploadProgress');
    const resultsSection = document.getElementById('uploadResults');
    const dropzone = document.getElementById('bulkUploadDropzone');
    const fileInput = document.getElementById('bulkFileInput');

    dropzone.style.display = 'block';
    progressSection.style.display = 'none';
    resultsSection.style.display = 'none';
    fileInput.value = '';

    // Reset progress
    document.getElementById('uploadProgressFill').style.width = '0%';
    document.getElementById('uploadProgressText').textContent = '0%';
    document.getElementById('uploadProgressDetails').textContent = '';
}

function downloadCSVTemplate() {
    const template = `name,sku,category_id,subcategory_id,price,compare_price,stock,short_description,full_description,image,is_featured,is_popular,is_new,is_active
iPhone 15 Pro Max,IPHONE-15PM-256,1,1,1250000,1350000,10,Latest iPhone with A17 Pro chip,Premium smartphone with advanced features,../images/smartphones/iphone-15-pro.jpg,1,1,1,1
Samsung Galaxy S24 Ultra,SAMSUNG-S24U-512,1,2,1150000,1250000,15,Flagship Samsung phone,Top-tier Android smartphone,../images/smartphones/samsung-s24-ultra.jpg,1,1,0,1`;

    downloadFile('product-template.csv', template, 'text/csv');
}

function downloadJSONTemplate() {
    const template = [
        {
            name: "iPhone 15 Pro Max",
            sku: "IPHONE-15PM-256",
            category_id: 1,
            subcategory_id: 1,
            price: 1250000,
            compare_price: 1350000,
            stock: 10,
            short_description: "Latest iPhone with A17 Pro chip",
            full_description: "Premium smartphone with advanced features",
            image: "../images/smartphones/iphone-15-pro.jpg",
            is_featured: 1,
            is_popular: 1,
            is_new: 1,
            is_active: 1
        },
        {
            name: "Samsung Galaxy S24 Ultra",
            sku: "SAMSUNG-S24U-512",
            category_id: 1,
            subcategory_id: 2,
            price: 1150000,
            compare_price: 1250000,
            stock: 15,
            short_description: "Flagship Samsung phone",
            full_description: "Top-tier Android smartphone",
            image: "../images/smartphones/samsung-s24-ultra.jpg",
            is_featured: 1,
            is_popular: 1,
            is_new: 0,
            is_active: 1
        }
    ];

    downloadFile('product-template.json', JSON.stringify(template, null, 2), 'application/json');
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
