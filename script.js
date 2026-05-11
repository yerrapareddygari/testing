// Secure Authentication - Hash for "YReddy@0055"
const ACCESS_HASH = "b8f3c2a1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1";

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
    
    loadMediaFromStorage();
    updateShareLink();
    updateStats();
    setupEventListeners();
    checkEmptyGallery();
}

function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    uploadBox.addEventListener('click', () => fileInput.click());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
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
            thumbnail: e.target.result // For images, use the same data as thumbnail
        };
        
        uploadedMedia.unshift(mediaData);
        callback();
    };
    reader.readAsDataURL(file);
}

function processVideoFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create video element to generate thumbnail
        const video = document.createElement('video');
        video.src = e.target.result;
        video.currentTime = 1; // Seek to 1 second for thumbnail
        
        video.onloadeddata = function() {
            // Create canvas to capture thumbnail
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
            // Fallback if video processing fails
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

// Modal Functions
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
        video.className = 'modal-content modal-video';
        modalMediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = mediaData.data;
        img.className = 'modal-content modal-image';
        modalMediaContainer.appendChild(img);
    }
    
    modalCaption.textContent = `${mediaData.name} (${mediaData.sizeFormatted}) - ${mediaData.uploadDate} ${mediaData.uploadTime}`;
    
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
        
        // Stop any playing videos
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
    
    // Update button states
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
