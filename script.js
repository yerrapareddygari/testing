// 🎯 FAMILY MEDIA DATA - ADD YOUR PHOTOS AND VIDEOS HERE
const familyPhotos = [
    // 📸 ADD YOUR PHOTOS HERE (files from photos/ folder)
    {
        src: 'photos/Screenshot from 2026-04-17 14-10-28.png',
        title: 'Family Vacation in Goa',
        date: 'March 15, 2024',
        description: 'Amazing beach vacation with the whole family. Beautiful sunsets and fun times at the beach.'
    },
    {
        src: 'photos/diwali-celebration-2023.jpg',
        title: 'Diwali Celebration 2023',
        date: 'November 12, 2023',
        description: 'Festival of lights celebration at home with traditional decorations and sweets.'
    },
    {
        src: 'photos/wedding-anniversary-25th.jpg',
        title: '25th Wedding Anniversary',
        date: 'February 14, 2024',
        description: 'Silver jubilee celebration with family and friends. A milestone worth celebrating.'
    },
    {
        src: 'photos/kids-graduation-ceremony.jpg',
        title: 'Kids Graduation Ceremony',
        date: 'May 20, 2024',
        description: 'Proud moment as our children graduate to the next level of their education.'
    },
    {
        src: 'photos/family-picnic-park.jpg',
        title: 'Family Picnic at the Park',
        date: 'April 8, 2024',
        description: 'Fun day out at the local park with games, food, and lots of laughter.'
    },
    {
        src: 'photos/grandparents-visit.jpg',
        title: 'Grandparents Visit',
        date: 'January 10, 2024',
        description: 'Special visit from grandparents with lots of stories and traditional recipes.'
    }
];

const familyVideos = [
    // 🎥 ADD YOUR VIDEOS HERE (files from videos/ folder)
    {
        src: 'videos/kids-birthday-party.mp4',
        title: 'Kids Birthday Party',
        date: 'January 20, 2024',
        description: 'Fun-filled birthday celebration with games, cake cutting, and lots of joy.'
    },
    {
        src: 'videos/chandu.mp4',
        title: 'Family Dance Performance',
        date: 'December 25, 2023',
        description: 'Christmas special dance performance by the family. Everyone joined in the fun!'
    },
    {
        src: 'videos/cooking-together.mp4',
        title: 'Cooking Together',
        date: 'March 5, 2024',
        description: 'Family cooking session making traditional dishes. Teaching recipes to the next generation.'
    },
    {
        src: 'videos/vacation-highlights.mp4',
        title: 'Vacation Highlights',
        date: 'March 18, 2024',
        description: 'Best moments from our Goa vacation compiled into a beautiful memory reel.'
    }
];

// Global Variables
let currentSection = 'all';
let currentMediaIndex = 0;
let currentMediaArray = [];
let allMedia = [];

// Initialize Gallery
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
});

function initializeGallery() {
    // Combine all media with type information
    allMedia = [
        ...familyPhotos.map(photo => ({ ...photo, type: 'photo' })),
        ...familyVideos.map(video => ({ ...video, type: 'video' }))
    ];
    
    // Sort by date (newest first)
    allMedia.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    updateStats();
    loadAllMedia();
    showSection('all');
    
    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

function updateStats() {
    document.getElementById('photoCount').textContent = familyPhotos.length;
    document.getElementById('videoCount').textContent = familyVideos.length;
    document.getElementById('totalCount').textContent = allMedia.length;
}

function showSection(section) {
    currentSection = section;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(section + 'Btn').classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.media-section').forEach(sec => sec.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    
    // Load appropriate media
    switch(section) {
        case 'all':
            currentMediaArray = allMedia;
            loadAllMedia();
            break;
        case 'photos':
            currentMediaArray = familyPhotos.map(photo => ({ ...photo, type: 'photo' }));
            loadPhotos();
            break;
        case 'videos':
            currentMediaArray = familyVideos.map(video => ({ ...video, type: 'video' }));
            loadVideos();
            break;
    }
    
    checkEmptyState();
}

function loadAllMedia() {
    const grid = document.getElementById('allGrid');
    grid.innerHTML = '';
    
    allMedia.forEach((item, index) => {
        const card = createMediaCard(item, index);
        grid.appendChild(card);
    });
}

function loadPhotos() {
    const grid = document.getElementById('photosGrid');
    grid.innerHTML = '';
    
    familyPhotos.forEach((photo, index) => {
        const photoWithType = { ...photo, type: 'photo' };
        const card = createMediaCard(photoWithType, index);
        grid.appendChild(card);
    });
}

function loadVideos() {
    const grid = document.getElementById('videosGrid');
    grid.innerHTML = '';
    
    familyVideos.forEach((video, index) => {
        const videoWithType = { ...video, type: 'video' };
        const card = createMediaCard(videoWithType, index);
        grid.appendChild(card);
    });
}

function createMediaCard(item, index) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.onclick = () => openModal(index);
    
    const mediaElement = item.type === 'photo' 
        ? `<img src="${item.src}" alt="${item.title}" loading="lazy">`
        : `<video src="${item.src}" muted preload="metadata"></video>`;
    
    const playOverlay = item.type === 'video' 
        ? '<button class="play-overlay">▶</button>' 
        : '';
    
    const typeIcon = item.type === 'photo' ? '📸 Photo' : '🎥 Video';
    const badgeClass = item.type === 'photo' ? 'photo' : 'video';
    
    card.innerHTML = `
        <div class="media-thumbnail">
            ${mediaElement}
            <div class="media-type-badge ${badgeClass}">${typeIcon}</div>
            ${playOverlay}
        </div>
        <div class="media-info">
            <div class="media-title">${item.title}</div>
            <div class="media-date">${formatDate(item.date)}</div>
            <div class="media-description">${item.description}</div>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function checkEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const hasMedia = currentMediaArray.length > 0;
    
    emptyState.style.display = hasMedia ? 'none' : 'block';
}

// Modal Functions
function openModal(index) {
    currentMediaIndex = index;
    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const item = currentMediaArray[index];
    
    // Update modal content
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalDate').textContent = formatDate(item.date);
    document.getElementById('modalDescription').textContent = item.description;
    document.getElementById('modalCounter').textContent = `${index + 1} of ${currentMediaArray.length}`;
    
    // Show appropriate media
    if (item.type === 'photo') {
        modalImage.src = item.src;
        modalImage.style.display = 'block';
        modalVideo.style.display = 'none';
    } else {
        modalVideo.src = item.src;
        modalVideo.style.display = 'block';
        modalImage.style.display = 'none';
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Add entrance animation
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('mediaModal');
    const modalVideo = document.getElementById('modalVideo');
    
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modalVideo.pause();
    }, 300);
}

function previousMedia() {
    if (currentMediaIndex > 0) {
        openModal(currentMediaIndex - 1);
    } else {
        openModal(currentMediaArray.length - 1); // Loop to last
    }
}

function nextMedia() {
    if (currentMediaIndex < currentMediaArray.length - 1) {
        openModal(currentMediaIndex + 1);
    } else {
        openModal(0); // Loop to first
    }
}

function downloadCurrent() {
    const item = currentMediaArray[currentMediaIndex];
    downloadFile(item.src, item.title);
    showToast('Download started! 📥');
}

function downloadAll() {
    if (currentMediaArray.length === 0) {
        showToast('No media to download', 'warning');
        return;
    }
    
    const confirmDownload = confirm(`Download all ${currentMediaArray.length} files from ${currentSection} section?`);
    if (!confirmDownload) return;
    
    currentMediaArray.forEach((item, index) => {
        setTimeout(() => {
            downloadFile(item.src, `${index + 1}-${item.title}`);
        }, index * 500); // Stagger downloads
    });
    
    showToast(`Downloading ${currentMediaArray.length} files... 📥`);
}

function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function shareMedia() {
    const item = currentMediaArray[currentMediaIndex];
    
    if (navigator.share) {
        navigator.share({
            title: item.title,
            text: item.description,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Gallery link copied to clipboard! 🔗');
        }).catch(() => {
            showToast('Unable to share. Please copy the URL manually.');
        });
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showToast('Entered fullscreen mode');
        }).catch(() => {
            showToast('Fullscreen not supported');
        });
    } else {
        document.exitFullscreen().then(() => {
            showToast('Exited fullscreen mode');
        });
    }
}

// Keyboard Navigation
function handleKeyboard(event) {
    const modal = document.getElementById('mediaModal');
    
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
            case ' ':
                event.preventDefault();
                const video = document.getElementById('modalVideo');
                if (video.style.display === 'block') {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
                break;
            case 'd':
            case 'D':
                downloadCurrent();
                break;
        }
    } else {
        // Gallery navigation
        switch(event.key) {
            case '1':
                showSection('all');
                break;
            case '2':
                showSection('photos');
                break;
            case '3':
                showSection('videos');
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span style="margin-right: 10px;">${icons[type] || icons.success}</span>
        ${message}
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Utility Functions
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    return imageExtensions.includes(getFileExtension(filename));
}

function isVideoFile(filename) {
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
    return videoExtensions.includes(getFileExtension(filename));
}

// Initialize smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.style.opacity = '0.5';
            this.alt = 'Image failed to load';
        });
    });
});

// Performance optimization: Intersection Observer for lazy loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add resize handler for responsive behavior
window.addEventListener('resize', function() {
    // Close modal on orientation change (mobile)
    if (window.innerHeight < window.innerWidth && document.getElementById('mediaModal').style.display === 'block') {
        // Landscape mode - adjust modal if needed
    }
});

console.log('🎉 YReddy Family Gallery loaded successfully!');
console.log(`📸 ${familyPhotos.length} photos loaded`);
console.log(`🎥 ${familyVideos.length} videos loaded`);
console.log(`📁 ${allMedia.length} total media files`);
console.log('⌨️ Keyboard shortcuts: 1=All, 2=Photos, 3=Videos, F=Fullscreen, ESC=Close, ←→=Navigate, D=Download');
