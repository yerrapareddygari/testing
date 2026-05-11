// Access control
const ACCESS_CODE = "FAMILY2024"; // Change this to your desired code
let uploadedImages = [];
let isAuthenticated = false;

// DOM Elements
let fileInput, uploadBox, galleryGrid, shareLink, modal, modalImage, modalCaption;

// Authentication check
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('galleryAccess') === 'granted') {
        showGallery();
    }
    
    // Allow Enter key to submit access code
    document.getElementById('accessCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
});

function checkAccess() {
    const code = document.getElementById('accessCode').value.trim();
    const errorDiv = document.getElementById('authError');
    
    if (code === ACCESS_CODE) {
        sessionStorage.setItem('galleryAccess', 'granted');
        showGallery();
    } else {
        errorDiv.textContent = 'Invalid access code. Please try again.';
        document.getElementById('accessCode').value = '';
        document.getElementById('accessCode').style.borderColor = '#dc3545';
        
        setTimeout(() => {
            errorDiv.textContent = '';
            document.getElementById('accessCode').style.borderColor = '#ddd';
        }, 3000);
    }
}

function showGallery() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    isAuthenticated = true;
    initializeGallery();
}

function initializeGallery() {
    // Initialize DOM elements
    fileInput = document.getElementById('fileInput');
    uploadBox = document.getElementById('uploadBox');
    galleryGrid = document.getElementById('galleryGrid');
    shareLink = document.getElementById('shareLink');
    modal = document.getElementById('imageModal');
    modalImage = document.getElementById('modalImage');
    modalCaption = document.getElementById('modalCaption');
    
    loadImagesFromStorage();
    updateShareLink();
    setupEventListeners();
}

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    uploadBox.addEventListener('click', () => fileInput.click());
}

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
    processFiles(imageFiles);
}

function processFiles(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: formatFileSize(file.size),
                    data: e.target.result,
                    uploadDate: new Date().toLocaleDateString()
                };
                
                uploadedImages.push(imageData);
                saveImagesToStorage();
                displayImage(imageData);
            };
            reader.readAsDataURL(file);
        }
    });
}

function displayImage(imageData) {
    const imageCard = document.createElement('div');
    imageCard.className = 'image-card';
    imageCard.onclick = () => openModal(imageData);
    
    imageCard.innerHTML = `
        <img src="${imageData.data}" alt="${imageData.name}" loading="lazy">
        <div class="image-info">
            <div class="image-name">${truncateFileName(imageData.name, 25)}</div>
            <div class="image-size">${imageData.size} • ${imageData.uploadDate}</div>
        </div>
    `;
    
    galleryGrid.appendChild(imageCard);
}

function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return truncated + '.' + extension;
}

function openModal(imageData) {
    modal.style.display = 'block';
    modalImage.src = imageData.data;
    modalCaption.textContent = `${imageData.name} (${imageData.size})`;
}

function closeModal() {
    modal.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveImagesToStorage() {
    try {
        localStorage.setItem('familyGalleryImages', JSON.stringify(uploadedImages));
    } catch (error) {
        console.warn('Storage limit exceeded. Some images may not be saved.');
        alert('Storage limit reached. Please delete some images to add new ones.');
    }
}

function loadImagesFromStorage() {
    try {
        const stored = localStorage.getItem('familyGalleryImages');
        if (stored) {
            uploadedImages = JSON.parse(stored);
            uploadedImages.forEach(imageData => displayImage(imageData));
        }
    } catch (error) {
        console.error('Error loading images from storage:', error);
    }
}

function updateShareLink() {
    shareLink.value = window.location.href;
}

function copyLink() {
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy link:', err);
    }
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
