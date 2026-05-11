const ACCESS_HASH = "b8f3c2a1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1";

// Global Variables
let uploadedImages = [];
let isAuthenticated = false;
let currentImageIndex = 0;
let isGridView = true;
let totalStorageUsed = 0;

// DOM Elements
let fileInput, uploadBox, galleryGrid, shareLink, modal, modalImage, modalCaption;
let loadingScreen, authOverlay, mainContainer;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Show loading screen
    loadingScreen = document.getElementById('loadingScreen');
    authOverlay = document.getElementById('authOverlay');
    mainContainer = document.getElementById('mainContainer');
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        // Check if already authenticated
        if (sessionStorage.getItem('galleryAccess') === 'granted') {
            showGallery();
        } else {
            authOverlay.style.display = 'flex';
        }
    }, 1000);
    
    // Setup authentication event listeners
    setupAuthListeners();
}

function setupAuthListeners() {
    const accessCodeInput = document.getElementById('accessCode');
    
    // Enter key to submit
    accessCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
    
    // Auto-focus on input
    setTimeout(() => {
        accessCodeInput.focus();
    }, 1200);
}

// SHA-256 Hash Function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Authentication Functions
async function checkAccess() {
    const code = document.getElementById('accessCode').value.trim();
    const errorDiv = document.getElementById('authError');
    const authBtn = document.querySelector('.auth-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    if (!code) {
        showAuthError('Please enter an access code');
        return;
    }
    
    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    authBtn.disabled = true;
    
    try {
        const hash = await sha256(code);
        
        // Simulate network delay for better UX
        setTimeout(() => {
            if (hash === ACCESS_HASH) {
                sessionStorage.setItem('galleryAccess', 'granted');
                showGallery();
                showToast('Welcome to YReddy Gallery! 🎉', 'success');
            } else {
                showAuthError('Invalid access code. Please try again.');
                document.getElementById('accessCode').value = '';
                
                // Reset button state
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
                authBtn.disabled = false;
            }
        }, 800);
        
    } catch (error) {
        showAuthError('Authentication error. Please try again.');
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        authBtn.disabled = false;
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    const accessCodeInput = document.getElementById('accessCode');
    
    errorDiv.textContent = message;
    accessCodeInput.style.borderColor = '#ff6b6b';
    
    // Shake animation
    accessCodeInput.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        errorDiv.textContent = '';
        accessCodeInput.style.borderColor = '#dee2e6';
        accessCodeInput.style.animation = '';
        accessCodeInput.focus();
    }, 3000);
}

function togglePassword() {
    const input = document.getElementById('accessCode');
    const button = document.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function showGallery() {
    authOverlay.style.display = 'none';
    mainContainer.style.display = 'block';
    isAuthenticated = true;
    initializeGallery();
}

function logout() {
    sessionStorage.removeItem('galleryAccess');
    mainContainer.style.display = 'none';
    authOverlay.style.display = 'flex';
    document.getElementById('accessCode').value = '';
    showToast('Logged out successfully', 'info');
}

// Gallery Initialization
function initializeGallery() {
    // Initialize DOM elements
    fileInput = document.getElementById('fileInput');
    uploadBox = document.getElementById('uploadBox');
    galleryGrid = document.getElementById('galleryGrid');
    shareLink = document.getElementById('shareLink');
    modal = document.getElementById('imageModal');
    modalImage = document.getElementById('modalImage');
    modalCaption = document.getElementById('modalCaption');
    
    // Load existing images and setup
    loadImagesFromStorage();
    updateShareLink();
    updateStats();
    setupEventListeners();
    checkEmptyGallery();
}

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    uploadBox.addEventListener('click', () => fileInput.click());
    
    // Modal events
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyboard);
}

// File Upload Functions
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showToast('Please drop image files only', 'warning');
        return;
    }
    
    processFiles(imageFiles);
}

function processFiles(files) {
    if (files.length === 0) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            showToast(`${file.name} is not an image file`, 'warning');
            return false;
        }
        if (file.size > maxSize) {
            showToast(`${file.name} is too large (max 10MB)`, 'warning');
            return false;
        }
        return true;
    });
    
    if (validFiles.length === 0) return;
    
    showUploadProgress();
    let processed = 0;
    
    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                data: e.target.result,
                uploadDate: new Date().toLocaleDateString(),
                uploadTime: new Date().toLocaleTimeString()
            };
            
            uploadedImages.unshift(imageData); // Add to beginning
            processed++;
            
            // Update progress
            const progress = (processed / validFiles.length) * 100;
            updateUploadProgress(progress);
            
            if (processed === validFiles.length) {
                // All files processed
                setTimeout(() => {
                    hideUploadProgress();
                    saveImagesToStorage();
                    refreshGallery();
                    updateStats();
                    showToast(`${validFiles.length} photo(s) uploaded successfully! 📸`, 'success');
                }, 500);
            }
        };
        reader.readAsDataURL(file);
    });
}

function showUploadProgress() {
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.style.display = 'block';
    updateUploadProgress(0);
}

function updateUploadProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = percentage + '%';
    progressText.textContent = Math.round(percentage) + '%';
}

function hideUploadProgress() {
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.style.display = 'none';
}

// Gallery Display Functions
function refreshGallery() {
    galleryGrid.innerHTML = '';
    uploadedImages.forEach((imageData, index) => {
        displayImage(imageData, index);
    });
    checkEmptyGallery();
}

function displayImage(imageData, index) {
    const imageCard = document.createElement('div');
    imageCard.className = 'image-card';
    imageCard.onclick = () => openModal(index);
    
    imageCard.innerHTML = `
        <img src="${imageData.data}" alt="${imageData.name}" loading="lazy">
        <div class="image-info">
            <div class="image-name">${truncateFileName(imageData.name, 30)}</div>
            <div class="image-size">${imageData.sizeFormatted} • ${imageData.uploadDate}</div>
        </div>
    `;
    
    // Add entrance animation
    imageCard.style.opacity = '0';
    imageCard.style.transform = 'translateY(20px)';
    galleryGrid.appendChild(imageCard);
    
    // Trigger animation
    setTimeout(() => {
        imageCard.style.transition = 'all 0.5s ease';
        imageCard.style.opacity = '1';
        imageCard.style.transform = 'translateY(0)';
    }, 100);
}

function checkEmptyGallery() {
    const emptyGallery = document.getElementById('emptyGallery');
    if (uploadedImages.length === 0) {
        emptyGallery.style.display = 'block';
        galleryGrid.style.display = 'none';
    } else {
        emptyGallery.style.display = 'none';
        galleryGrid.style.display = 'grid';
    }
}

// Modal Functions
function openModal(index) {
    currentImageIndex = index;
    const imageData = uploadedImages[index];
    
    modal.style.display = 'block';
    modalImage.src = imageData.data;
    modalCaption.textContent = `${imageData.name} (${imageData.sizeFormatted}) - ${imageData.uploadDate} ${imageData.uploadTime}`;
    
    // Add fade-in animation
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }, 10);
}

function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function previousImage() {
    if (currentImageIndex > 0) {
        openModal(currentImageIndex - 1);
    } else {
        openModal(uploadedImages.length - 1); // Loop to last image
    }
}

function nextImage() {
    if (currentImageIndex < uploadedImages.length - 1) {
        openModal(currentImageIndex + 1);
    } else {
        openModal(0); // Loop to first image
    }
}

function downloadImage() {
    const imageData = uploadedImages[currentImageIndex];
    const link = document.createElement('a');
    link.download = imageData.name;
    link.href = imageData.data;
    link.click();
    showToast('Image downloaded! 📥', 'success');
}

function deleteImage() {
    if (confirm('Are you sure you want to delete this image?')) {
        const imageData = uploadedImages[currentImageIndex];
        uploadedImages.splice(currentImageIndex, 1);
        saveImagesToStorage();
        refreshGallery();
        updateStats();
        closeModal();
        showToast(`${imageData.name} deleted`, 'info');
    }
}

// Utility Functions
function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return truncated + '.' + extension;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateTotalStorage() {
    return uploadedImages.reduce((total, image) => total + image.size, 0);
}

function updateStats() {
    const photoCount = document.getElementById('photoCount');
    const storageUsed = document.getElementById('storageUsed');
    
    if (photoCount) photoCount.textContent = uploadedImages.length;
    if (storageUsed) {
        const totalBytes = calculateTotalStorage();
        storageUsed.textContent = (totalBytes / (1024 * 1024)).toFixed(1);
    }
}

// Storage Functions
function saveImagesToStorage() {
    try {
        localStorage.setItem('yreddy-gallery-images', JSON.stringify(uploadedImages));
    } catch (error) {
        console.warn('Storage limit exceeded:', error);
        showToast('Storage limit reached. Please delete some images.', 'warning');
    }
}

function loadImagesFromStorage() {
    try {
        const stored = localStorage.getItem('yreddy-gallery-images');
        if (stored) {
            uploadedImages = JSON.parse(stored);
            refreshGallery();
        }
    } catch (error) {
        console.error('Error loading images:', error);
        showToast('Error loading saved images', 'error');
    }
}

// Gallery Controls
function toggleView() {
    const viewToggle = document.getElementById('viewToggle');
    isGridView = !isGridView;
    
    if (isGridView) {
        galleryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        viewToggle.innerHTML = '<span>⊞</span> Grid View';
    } else {
        galleryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        viewToggle.innerHTML = '<span>▦</span> Compact View';
    }
}

function clearGallery() {
    if (uploadedImages.length === 0) {
        showToast('Gallery is already empty', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${uploadedImages.length} photos? This cannot be undone.`)) {
        uploadedImages = [];
        saveImagesToStorage();
        refreshGallery();
        updateStats();
        showToast('Gallery cleared successfully', 'info');
    }
}

// Navigation Functions
function scrollToUpload() {
    document.getElementById('uploadSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToGallery() {
    document.getElementById('gallerySection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Share Functions
function updateShareLink() {
    if (shareLink) {
        shareLink.value = window.location.href;
    }
}

function copyLink() {
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        const copyBtn = document.querySelector('.copy-btn');
        const copyIcon = document.querySelector('.copy-icon');
        const copyText = document.querySelector('.copy-text');
        
        copyIcon.textContent = '✅';
        copyText.textContent = 'Copied!';
        copyBtn.style.background = '#4ecdc4';
        
        setTimeout(() => {
            copyIcon.textContent = '📋';
            copyText.textContent = 'Copy';
            copyBtn.style.background = '';
        }, 2000);
        
        showToast('Link copied to clipboard! 📋', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy link', 'error');
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Keyboard Navigation
function handleKeyboard(event) {
    if (modal.style.display === 'block') {
        switch(event.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                previousImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'Delete':
                deleteImage();
                break;
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: all 0.3s ease;
        animation: slideInRight 0.3s ease forwards;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .toast-success { background: #4ecdc4; }
    .toast-error { background: #ff6b6b; }
    .toast-warning { background: #feca57; }
    .toast-info { background: #667eea; }
    
    .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
