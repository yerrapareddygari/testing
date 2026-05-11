let uploadedImages = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const galleryGrid = document.getElementById('galleryGrid');
const shareLink = document.getElementById('shareLink');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadImagesFromStorage();
    updateShareLink();
    setupEventListeners();
});

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
                updateShareLink();
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
        <img src="${imageData.data}" alt="${imageData.name}">
        <div class="image-info">
            <div class="image-name">${imageData.name}</div>
            <div class="image-size">${imageData.size} • ${imageData.uploadDate}</div>
        </div>
    `;
    
    galleryGrid.appendChild(imageCard);
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
        
        const originalText = document.querySelector('.copy-btn').textContent;
        document.querySelector('.copy-btn').textContent = 'Copied!';
        document.querySelector('.copy-btn').style.background = '#28a745';
        
        setTimeout(() => {
            document.querySelector('.copy-btn').textContent = originalText;
            document.querySelector('.copy-btn').style.background = '#28a745';
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
