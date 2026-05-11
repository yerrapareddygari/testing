
const ACCESS_HASH = "cf63879d89e66cb1ad96bbddad28766050d24c8fcd648d70fc2af01e517836ec";

// Global Variables
let uploadedMedia = [];
let isAuthenticated = false;
let currentMediaIndex = 0;
let isGridView = true;
let currentFilter = 'all';
let totalStorageUsed = 0;

// DOM Elements
let fileInput, uploadBox, galleryGrid, shareLink, modal, modalMediaContainer, modalCaption;
let loadingScreen, authOverlay, mainContainer;

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/flv', 'video/wmv'];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadingScreen = document.getElementById('loadingScreen');
    authOverlay = document.getElementById('authOverlay');
    mainContainer = document.getElementById('mainContainer');
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        if (sessionStorage.getItem('galleryAccess') === 'granted') {
            showGallery();
        } else {
            authOverlay.style.display = 'flex';
        }
    }, 1000);
    
    setupAuthListeners();
}

function setupAuthListeners() {
    const accessCodeInput = document.getElementById('accessCode');
    
    accessCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
    
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
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    authBtn.disabled = true;
    
    try {
        const hash = await sha256(code);
        
        setTimeout(() => {
            if (hash === ACCESS_HASH) {
                sessionStorage.setItem('galleryAccess', 'granted');
                showGallery();
                showToast('Welcome to YReddy Gallery! 🎉', 'success');
            } else {
                showAuthError('Invalid access code. Please try again.');
                document.getElementById('accessCode').value = '';
                
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
                authBtn.disabled = false;
            }
        }, 800);
        
    } catch (error) {
        console.error('Hash error:', error);
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
    fileInput = document.getElementById('fileInput');
    uploadBox = document.getElementById('uploadBox');
    galleryGrid = document.getElementById('galleryGrid');
    shareLink = document.getElementById('shareLink');
    modal = document.getElementById('imageModal');
    modalMediaContainer = document.getElementById('modalMediaContainer');
    modalCaption = document.getElementById('modalCaption');
    
    // Ensure file input is properly configured
    if (fileInput) {
        fileInput.multiple = true;
        fileInput.accept = 'image/*,video/*';
        console.log('File input configured:', fileInput);
    } else {
        console.error('File input not found!');
    }
    
    loadMediaFromStorage();
    updateShareLink();
    updateStats();
    setupEventListeners();
    checkEmptyGallery();
}

function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    
    // Enhanced mobile support for drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    
    // Mobile-specific touch events
    uploadBox.addEventListener('touchstart', handleTouchStart, { passive: false });
    uploadBox.addEventListener('touchmove', handleTouchMove, { passive: false });
    uploadBox.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Enhanced click handling for upload box
    uploadBox.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Upload box clicked - triggering file input');
        
        // Direct file input trigger - works on both desktop and mobile
        fileInput.click();
    });
    
    // Prevent event bubbling on file input
    fileInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Mobile file input focus fix
    fileInput.addEventListener('focus', () => {
        console.log('File input focused');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', handleKeyboard);
}

// Mobile Detection and Upload Functions
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
}

function triggerMobileUpload() {
    console.log('Triggering mobile upload');
    
    // Remove any existing mobile inputs
    const existingInputs = document.querySelectorAll('.mobile-file-input');
    existingInputs.forEach(input => input.remove());
    
    // Create new mobile-optimized file input
    const mobileInput = document.createElement('input');
    mobileInput.type = 'file';
    mobileInput.multiple = true;
    mobileInput.accept = 'image/*,video/*';
    mobileInput.className = 'mobile-file-input';
    mobileInput.style.cssText = `
        position: fixed;
        top: -1000px;
        left: -1000px;
        opacity: 0;
        pointer-events: none;
    `;
    
    // Handle file selection
    mobileInput.addEventListener('change', function(event) {
        console.log('Mobile input changed:', event.target.files.length);
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            showToast(`Selected ${files.length} file(s)`, 'info');
            processFiles(files);
        }
        // Clean up after a delay
        setTimeout(() => {
            if (mobileInput.parentNode) {
                mobileInput.parentNode.removeChild(mobileInput);
            }
        }, 1000);
    });
    
    // Add to DOM
    document.body.appendChild(mobileInput);
    
    // Trigger with delay for mobile browsers
    setTimeout(() => {
        try {
            mobileInput.click();
            console.log('Mobile input clicked');
        } catch (error) {
            console.error('Mobile input click failed:', error);
            showToast('Upload not supported on this device', 'error');
        }
    }, 100);
}

// Mobile Upload Functions
function triggerFileInput(source) {
    console.log('Mobile upload button clicked:', source);
    
    if (source === 'camera') {
        // Create input with camera capture
        const cameraInput = document.createElement('input');
        cameraInput.type = 'file';
        cameraInput.accept = 'image/*,video/*';
        cameraInput.capture = 'environment';
        cameraInput.style.display = 'none';
        
        cameraInput.onchange = function(event) {
            const files = Array.from(event.target.files);
            if (files.length > 0) {
                processFiles(files);
            }
            document.body.removeChild(cameraInput);
        };
        
        document.body.appendChild(cameraInput);
        cameraInput.click();
    } else {
        // Use the main file input for gallery
        fileInput.click();
    }
}

// Mobile Touch Event Handlers
let isDragging = false;

function handleTouchStart(event) {
    event.preventDefault();
    isDragging = true;
    uploadBox.classList.add('dragover');
    console.log('Touch start - mobile drag detected');
}

function handleTouchMove(event) {
    event.preventDefault();
    if (isDragging) {
        // Visual feedback for mobile drag
        uploadBox.style.transform = 'scale(1.02)';
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    isDragging = false;
    uploadBox.classList.remove('dragover');
    uploadBox.style.transform = 'scale(1)';
    
    // Check if files were dropped (for mobile browsers that support it)
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        processFiles(Array.from(event.dataTransfer.files));
    } else {
        // Fallback: trigger file input for mobile
        setTimeout(() => {
            fileInput.click();
        }, 100);
    }
    console.log('Touch end - triggering file input');
}

// File Upload Functions
function handleFileSelect(event) {
    console.log('=== FILE SELECTION DEBUG ===');
    console.log('Event triggered:', event.type);
    console.log('Files selected:', event.target.files.length);
    console.log('File input element:', event.target);
    
    const files = Array.from(event.target.files);
    
    if (files.length === 0) {
        console.log('No files selected - user cancelled');
        return;
    }
    
    // Log file details
    files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size)
        });
    });
    
    // Clear the input for re-selection
    setTimeout(() => {
        event.target.value = '';
    }, 100);
    
    processFiles(files);
    console.log('=== END FILE SELECTION DEBUG ===');
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
    processFiles(files);
}

function processFiles(files) {
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
        const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
        const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
        
        if (!isImage && !isVideo) {
            showToast(`${file.name} is not a supported file type`, 'warning');
            return false;
        }
        return true;
    });
    
    if (validFiles.length === 0) {
        showToast('No valid media files selected', 'warning');
        return;
    }
    
    showUploadProgress();
    let processed = 0;
    const totalFiles = validFiles.length;
    
    validFiles.forEach((file, index) => {
        const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type);
        
        if (isVideo) {
            processVideoFile(file, () => {
                processed++;
                updateUploadProgress((processed / totalFiles) * 100, `Processing ${processed}/${totalFiles} files...`);
                
                if (processed === totalFiles) {
                    finishUpload(totalFiles);
                }
            });
        } else {
            processImageFile(file, () => {
                processed++;
                updateUploadProgress((processed / totalFiles) * 100, `Processing ${processed}/${totalFiles} files...`);
                
                if (processed === totalFiles) {
                    finishUpload(totalFiles);
                }
            });
        }
    });
}

function processImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const mediaData = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: 'image',
            mimeType: file.type,
            size: file.size,
            sizeFormatted: formatFileSize(file.size),
            data: e.target.result,
            uploadDate: new Date().toLocaleDateString(),
            uploadTime: new Date().toLocaleTimeString(),
            thumbnail: e.target.result
        };
        
        uploadedMedia.unshift(mediaData);
        callback();
    };
    reader.readAsDataURL(file);
}

function processVideoFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const video = document.createElement('video');
        video.src = e.target.result;
        video.currentTime = 1;
        
        video.onloadeddata = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 320;
            canvas.height = (video.videoHeight / video.videoWidth) * 320;
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            
            const mediaData = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: 'video',
                mimeType: file.type,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                data: e.target.result,
                uploadDate: new Date().toLocaleDateString(),
                uploadTime: new Date().toLocaleTimeString(),
                thumbnail: thumbnail,
                duration: video.duration
            };
            
            uploadedMedia.unshift(mediaData);
            callback();
        };
        
        video.onerror = function() {
            const mediaData = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: 'video',
                mimeType: file.type,
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                data: e.target.result,
                uploadDate: new Date().toLocaleDateString(),
                uploadTime: new Date().toLocaleTimeString(),
                thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjNjY3ZWVhIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn46lPC90ZXh0Pgo8L3N2Zz4K'
            };
            
            uploadedMedia.unshift(mediaData);
            callback();
        };
    };
    reader.readAsDataURL(file);
}

function finishUpload(fileCount) {
    setTimeout(() => {
        hideUploadProgress();
        saveMediaToStorage();
        refreshGallery();
        updateStats();
        showToast(`${fileCount} file(s) uploaded successfully! 🎉`, 'success');
    }, 500);
}

function showUploadProgress() {
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.style.display = 'block';
    updateUploadProgress(0, 'Starting upload...');
}

function updateUploadProgress(percentage, status = 'Processing files...') {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadStatus = document.getElementById('uploadStatus');
    
    progressFill.style.width = percentage + '%';
    progressText.textContent = Math.round(percentage) + '%';
    uploadStatus.textContent = status;
}

function hideUploadProgress() {
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.style.display = 'none';
}

// Gallery Display Functions
function refreshGallery() {
    galleryGrid.innerHTML = '';
    const filteredMedia = getFilteredMedia();
    
    filteredMedia.forEach((mediaData, index) => {
        displayMedia(mediaData, uploadedMedia.indexOf(mediaData));
    });
    checkEmptyGallery();
}

function getFilteredMedia() {
    switch(currentFilter) {
        case 'images':
            return uploadedMedia.filter(media => media.type === 'image');
        case 'videos':
            return uploadedMedia.filter(media => media.type === 'video');
        default:
            return uploadedMedia;
    }
}

function displayMedia(mediaData, originalIndex) {
    const mediaCard = document.createElement('div');
    mediaCard.className = 'image-card media-card';
    mediaCard.onclick = () => openModal(originalIndex);
    
    const typeIcon = mediaData.type === 'video' ? '🎥' : '📷';
    const duration = mediaData.duration ? formatDuration(mediaData.duration) : '';
    
    mediaCard.innerHTML = `
        <div class="media-thumbnail">
            <img src="${mediaData.thumbnail}" alt="${mediaData.name}" loading="lazy">
            <div class="media-type-indicator">${typeIcon}</div>
            ${duration ? `<div class="video-duration">${duration}</div>` : ''}
        </div>
        <div class="image-info">
            <div class="image-name">${truncateFileName(mediaData.name, 30)}</div>
            <div class="image-size">${mediaData.sizeFormatted} • ${mediaData.uploadDate}</div>
        </div>
    `;
    
    mediaCard.style.opacity = '0';
    mediaCard.style.transform = 'translateY(20px)';
    galleryGrid.appendChild(mediaCard);
    
    setTimeout(() => {
        mediaCard.style.transition = 'all 0.5s ease';
        mediaCard.style.opacity = '1';
        mediaCard.style.transform = 'translateY(0)';
    }, 100);
}

function checkEmptyGallery() {
    const emptyGallery = document.getElementById('emptyGallery');
    const filteredMedia = getFilteredMedia();
    
    if (filteredMedia.length === 0) {
        emptyGallery.style.display = 'block';
        galleryGrid.style.display = 'none';
    } else {
        emptyGallery.style.display = 'none';
        galleryGrid.style.display = 'grid';
    }
}

// Modal Functions with Better Mobile Support
function openModal(index) {
    currentMediaIndex = index;
    const mediaData = uploadedMedia[index];
    
    modal.style.display = 'block';
    modalMediaContainer.innerHTML = '';
    
    if (mediaData.type === 'video') {
        const video = document.createElement('video');
        video.src = mediaData.data;
        video.controls = true;
        video.autoplay = false;
        video.preload = 'metadata';
        video.className = 'modal-content modal-video';
        
        // Better mobile video handling
        if (isMobileDevice()) {
            video.style.cssText = `
                max-width: 100vw;
                max-height: 80vh;
                width: auto;
                height: auto;
                object-fit: contain;
            `;
        }
        
        modalMediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = mediaData.data;
        img.className = 'modal-content modal-image';
        
        // Better mobile image handling
        if (isMobileDevice()) {
            img.style.cssText = `
                max-width: 100vw;
                max-height: 80vh;
                width: auto;
                height: auto;
                object-fit: contain;
                touch-action: pan-x pan-y pinch-zoom;
            `;
        }
        
        // Add pinch-to-zoom for mobile
        if (isMobileDevice()) {
            addPinchZoom(img);
        }
        
        modalMediaContainer.appendChild(img);
    }
    
    modalCaption.textContent = `${mediaData.name} (${mediaData.sizeFormatted}) - ${mediaData.uploadDate} ${mediaData.uploadTime}`;
    
    // Better modal animation
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }, 10);
}

// Add pinch-to-zoom functionality for mobile images
function addPinchZoom(img) {
    let scale = 1;
    let startDistance = 0;
    let startScale = 1;
    
    img.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            startDistance = getDistance(e.touches[0], e.touches[1]);
            startScale = scale;
        }
    }, { passive: false });
    
    img.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            scale = startScale * (currentDistance / startDistance);
            scale = Math.max(0.5, Math.min(scale, 3)); // Limit zoom
            img.style.transform = `scale(${scale})`;
        }
    }, { passive: false });
    
    img.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            // Reset if zoomed out too much
            if (scale < 1) {
                scale = 1;
                img.style.transform = 'scale(1)';
            }
        }
    });
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        
        const videos = modalMediaContainer.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }, 300);
}

function previousMedia() {
    if (currentMediaIndex > 0) {
        openModal(currentMediaIndex - 1);
    } else {
        openModal(uploadedMedia.length - 1);
    }
}

function nextMedia() {
    if (currentMediaIndex < uploadedMedia.length - 1) {
        openModal(currentMediaIndex + 1);
    } else {
        openModal(0);
    }
}

function downloadMedia() {
    const mediaData = uploadedMedia[currentMediaIndex];
    const link = document.createElement('a');
    link.download = mediaData.name;
    link.href = mediaData.data;
    link.click();
    showToast(`${mediaData.name} downloaded! 📥`, 'success');
}

function deleteMedia() {
    if (confirm('Are you sure you want to delete this file?')) {
        const mediaData = uploadedMedia[currentMediaIndex];
        uploadedMedia.splice(currentMediaIndex, 1);
        saveMediaToStorage();
        refreshGallery();
        updateStats();
        closeModal();
        showToast(`${mediaData.name} deleted`, 'info');
    }
}

// Filter Functions
function filterMedia(type) {
    currentFilter = type;
    
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = type === 'all' ? 'filterAll' : 
                     type === 'images' ? 'filterImages' : 'filterVideos';
    document.getElementById(activeBtn).classList.add('active');
    
    refreshGallery();
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function calculateTotalStorage() {
    return uploadedMedia.reduce((total, media) => total + media.size, 0);
}

function updateStats() {
    const mediaCount = document.getElementById('mediaCount');
    const storageUsed = document.getElementById('storageUsed');
    
    if (mediaCount) mediaCount.textContent = uploadedMedia.length;
    if (storageUsed) {
        const totalBytes = calculateTotalStorage();
        storageUsed.textContent = (totalBytes / (1024 * 1024)).toFixed(1);
    }
    
    // Show sync status
    showSyncStatus();
}

function showSyncStatus() {
    const deviceId = getDeviceId();
    const deviceType = isMobileDevice() ? 'Mobile' : 'Desktop';
    const lastUpdate = localStorage.getItem('yreddy-gallery-shared');
    
    if (uploadedMedia.length > 0) {
        showToast(`${deviceType} - ${uploadedMedia.length} files loaded`, 'info');
    }
}

// Storage Functions with Cross-Device Sync
function saveMediaToStorage() {
    try {
        const dataToStore = uploadedMedia.map(media => ({
            ...media,
            dataSize: media.data.length,
            deviceId: getDeviceId(),
            syncTimestamp: Date.now()
        }));
        
        // Save to localStorage
        localStorage.setItem('yreddy-gallery-media', JSON.stringify(dataToStore));
        
        // Also save to a shared key for cross-device access
        localStorage.setItem('yreddy-gallery-shared', JSON.stringify({
            lastUpdate: Date.now(),
            deviceCount: getDeviceCount(),
            totalFiles: dataToStore.length
        }));
        
        console.log('Media saved to storage:', dataToStore.length, 'files');
    } catch (error) {
        console.warn('Storage error:', error);
        try {
            const smallerMedia = uploadedMedia.filter(media => media.size < 5 * 1024 * 1024);
            localStorage.setItem('yreddy-gallery-media', JSON.stringify(smallerMedia));
            showToast('Some large files may not persist between sessions', 'warning');
        } catch (secondError) {
            showToast('Storage limit reached. Files may not be saved.', 'error');
        }
    }
}

function loadMediaFromStorage() {
    try {
        const stored = localStorage.getItem('yreddy-gallery-media');
        if (stored) {
            const parsedMedia = JSON.parse(stored);
            uploadedMedia = parsedMedia;
            console.log('Loaded media from storage:', uploadedMedia.length, 'files');
            refreshGallery();
        } else {
            console.log('No stored media found');
        }
    } catch (error) {
        console.error('Error loading media:', error);
        showToast('Error loading saved media files', 'error');
    }
}

function getDeviceId() {
    let deviceId = localStorage.getItem('yreddy-device-id');
    if (!deviceId) {
        deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('yreddy-device-id', deviceId);
    }
    return deviceId;
}

function getDeviceCount() {
    const devices = JSON.parse(localStorage.getItem('yreddy-devices') || '[]');
    const currentDevice = getDeviceId();
    if (!devices.includes(currentDevice)) {
        devices.push(currentDevice);
        localStorage.setItem('yreddy-devices', JSON.stringify(devices));
    }
    return devices.length;
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
    if (uploadedMedia.length === 0) {
        showToast('Gallery is already empty', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${uploadedMedia.length} files? This cannot be undone.`)) {
        uploadedMedia = [];
        saveMediaToStorage();
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
                previousMedia();
                break;
            case 'ArrowRight':
                nextMedia();
                break;
            case 'Delete':
                deleteMedia();
                break;
            case ' ':
                event.preventDefault();
                const video = modalMediaContainer.querySelector('video');
                if (video) {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
                break;
        }
    }
}

// Enhanced CSS for video support
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .media-thumbnail {
        position: relative;
        overflow: hidden;
    }
    
    .media-type-indicator {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        backdrop-filter: blur(4px);
    }
    
    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: monospace;
    }
    
    .modal-video {
        max-width: 90vw;
        max-height: 80vh;
        width: auto;
        height: auto;
    }
    
    .modal-image {
        max-width: 90vw;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
    }
    
    .control-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
    
    .control-btn.danger-btn:hover {
        background: #ff6b6b;
        color: white;
        border-color: #ff6b6b;
    }
    
    .modal-btn.danger-btn:hover {
        background: #ff6b6b;
        border-color: #ff6b6b;
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
        max-width: 400px;
        word-wrap: break-word;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .toast-success { background: #4ecdc4; }
    .toast-error { background: #ff6b6b; }
    .toast-warning { background: #feca57; color: #333; }
    .toast-info { background: #667eea; }
    
    .toast-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
    }
    
    .toast-close:hover {
        opacity: 1;
    }
    
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
    }
    
    .upload-details {
        margin-top: 10px;
        font-size: 0.9rem;
        color: #6c757d;
    }
    
    /* Hide mobile buttons on desktop */
    .mobile-upload-buttons {
        display: none;
    }
    
    @media (max-width: 768px) {
        .modal-video, .modal-image {
            max-width: 100vw !important;
            max-height: 80vh !important;
            width: auto;
            height: auto;
            object-fit: contain;
        }
        
        /* Better mobile modal */
        .modal {
            padding: 10px;
        }
        
        .modal-content-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
        }
        
        .modal-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1001;
            padding: 10px;
        }
        
        .modal-caption {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            font-size: 14px;
        }
        
        .gallery-controls {
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
        }
        
        .control-btn {
            font-size: 0.85rem;
            padding: 8px 12px;
            min-height: 44px;
        }
        
        .toast-container {
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        /* Mobile upload improvements */
        .upload-box {
            padding: 30px 15px;
            min-height: 180px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        
        .upload-box:active {
            transform: scale(0.98);
        }
        
        /* Mobile upload buttons */
        .mobile-upload-buttons {
            display: flex !important;
            flex-direction: column;
            gap: 10px;
            margin-top: 20px;
        }
        
        .mobile-upload-btn {
            padding: 15px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            min-height: 50px;
            -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-upload-btn:hover, .mobile-upload-btn:active {
            background: #5a6fd8;
            transform: scale(0.98);
        }
        
        /* Better mobile gallery */
        .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            padding: 10px;
        }
        
        .image-card {
            border-radius: 8px;
        }
        
        .image-info {
            padding: 10px;
        }
        
        .image-name {
            font-size: 0.85rem;
        }
        
        .image-size {
            font-size: 0.75rem;
        }
        
        /* Mobile navigation */
        .nav-actions {
            gap: 5px;
        }
        
        .nav-btn {
            padding: 8px 12px;
            font-size: 0.85rem;
            min-height: 40px;
        }
        
        /* Mobile hero section */
        .hero-title {
            font-size: 2.5rem;
        }
        
        .hero-subtitle {
            font-size: 1.8rem;
        }
        
        .hero-stats {
            gap: 30px;
        }
        
        /* Mobile modal navigation */
        .nav-arrow {
            width: 50px;
            height: 50px;
            font-size: 24px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
        
        /* Mobile file input */
        #fileInput {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
        
        /* Mobile touch feedback */
        .upload-box.dragover {
            border-color: #28a745;
            background: #f0fff0;
            transform: scale(1.02);
        }
        
        /* Improve mobile button sizes */
        .nav-btn, .control-btn, .copy-btn {
            min-height: 44px;
            min-width: 44px;
        }
        
        /* Mobile modal improvements */
        .modal-header {
            padding: 15px;
        }
        
        .modal-actions {
            gap: 10px;
        }
        
        .modal-btn {
            padding: 12px 16px;
            font-size: 14px;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
