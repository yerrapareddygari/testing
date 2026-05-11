# 📸 YReddy Family Gallery - Complete Setup Guide

## 🎯 What You Get

✅ **Separate Photos & Videos Sections**
✅ **Beautiful Professional Design** 
✅ **Mobile-Friendly Interface**
✅ **Full-Screen Modal Viewer**
✅ **Keyboard Navigation**
✅ **Download Functionality**
✅ **No Upload - View Only**

## 📁 Step 1: Create Folder Structure

Create this exact folder structure:

```
yreddy-family-gallery/
├── family-gallery.html
├── gallery-styles.css
├── gallery-script.js
├── photos/
│   ├── family-vacation-goa-2024.jpg
│   ├── diwali-celebration-2023.jpg
│   ├── wedding-anniversary-25th.jpg
│   ├── kids-graduation-ceremony.jpg
│   ├── family-picnic-park.jpg
│   └── grandparents-visit.jpg
└── videos/
    ├── kids-birthday-party.mp4
    ├── family-dance-performance.mp4
    ├── cooking-together.mp4
    └── vacation-highlights.mp4
```

## 🖼️ Step 2: Add Your Media Files

### Photos Folder:
- Put ALL your photos in the `photos/` folder
- Supported formats: JPG, PNG, GIF, WebP, BMP
- Use descriptive filenames like:
  - `family-vacation-goa-2024.jpg`
  - `diwali-celebration-2023.jpg`
  - `wedding-anniversary-25th.jpg`

### Videos Folder:
- Put ALL your videos in the `videos/` folder  
- Supported formats: MP4, MOV, AVI, WebM, MKV
- Use descriptive filenames like:
  - `kids-birthday-party.mp4`
  - `family-dance-performance.mp4`
  - `cooking-together.mp4`

## ✏️ Step 3: Edit the Media Lists

Open `gallery-script.js` and find these sections:

### 📸 Photos Section (around line 2):
```javascript
const familyPhotos = [
    {
        src: 'photos/your-photo-1.jpg',
        title: 'Your Photo Title',
        date: 'March 15, 2024',
        description: 'Description of your photo'
    },
    {
        src: 'photos/your-photo-2.jpg',
        title: 'Another Photo Title', 
        date: 'February 10, 2024',
        description: 'Another description'
    }
    // Add more photos here...
];
```

### 🎥 Videos Section (around line 35):
```javascript
const familyVideos = [
    {
        src: 'videos/your-video-1.mp4',
        title: 'Your Video Title',
        date: 'January 20, 2024',
        description: 'Description of your video'
    },
    {
        src: 'videos/your-video-2.mp4',
        title: 'Another Video Title',
        date: 'December 25, 2023', 
        description: 'Another video description'
    }
    // Add more videos here...
];
```

## 📝 Example Complete Setup

Here's a real example with 6 photos and 4 videos:

### Photos:
```javascript
const familyPhotos = [
    {
        src: 'photos/diwali-2024.jpg',
        title: 'Diwali Celebration 2024',
        date: 'November 12, 2024',
        description: 'Beautiful festival of lights celebration with traditional decorations and sweets'
    },
    {
        src: 'photos/family-trip-kerala.jpg',
        title: 'Family Trip to Kerala',
        date: 'October 5, 2024',
        description: 'Backwater cruise and spice plantation visit with amazing scenery'
    },
    {
        src: 'photos/wedding-anniversary-25.jpg',
        title: '25th Wedding Anniversary',
        date: 'September 15, 2024',
        description: 'Silver jubilee celebration with friends and family'
    },
    {
        src: 'photos/kids-school-function.jpg',
        title: 'Kids School Annual Function',
        date: 'August 20, 2024',
        description: 'Children performing in the school annual day celebration'
    },
    {
        src: 'photos/family-picnic.jpg',
        title: 'Family Picnic at Park',
        date: 'July 10, 2024',
        description: 'Fun day out at the local park with games and food'
    },
    {
        src: 'photos/grandparents-visit.jpg',
        title: 'Grandparents Visit',
        date: 'June 5, 2024',
        description: 'Special visit from grandparents with lots of stories'
    }
];
```

### Videos:
```javascript
const familyVideos = [
    {
        src: 'videos/birthday-celebration.mp4',
        title: 'Birthday Celebration',
        date: 'November 20, 2024',
        description: 'Fun birthday party with cake cutting and games'
    },
    {
        src: 'videos/cooking-session.mp4',
        title: 'Family Cooking Session',
        date: 'October 15, 2024',
        description: 'Making traditional recipes together as a family'
    },
    {
        src: 'videos/dance-performance.mp4',
        title: 'Family Dance Performance',
        date: 'September 25, 2024',
        description: 'Everyone dancing together during festival celebration'
    },
    {
        src: 'videos/vacation-highlights.mp4',
        title: 'Vacation Highlights Reel',
        date: 'August 30, 2024',
        description: 'Best moments from our Kerala vacation compiled together'
    }
];
```

## 🌐 Step 4: Host Your Gallery

### Option A: GitHub Pages (Free)
1. Create GitHub account
2. Create repository: `yreddy-family-gallery`
3. Upload all files:
   - `family-gallery.html`
   - `gallery-styles.css`
   - `gallery-script.js`
   - `photos/` folder with all photos
   - `videos/` folder with all videos
4. Enable GitHub Pages in Settings
5. Share URL: `https://yourusername.github.io/yreddy-family-gallery/family-gallery.html`

### Option B: Netlify (Easiest)
1. Go to netlify.com
2. Drag your entire `yreddy-family-gallery` folder
3. Get instant URL: `https://random-name.netlify.app`
4. Share this URL with family

## 🔒 Privacy Options

### Option 1: Password Protection
Add this at the beginning of `gallery-script.js`:

```javascript
// Password Protection
const FAMILY_PASSWORD = "YReddy2024";
const enteredPassword = prompt("🔐 Enter family password to access gallery:");
if (enteredPassword !== FAMILY_PASSWORD) {
    document.body.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-align:center;font-family:Poppins,sans-serif;">
            <div>
                <h1 style="font-size:3rem;margin-bottom:20px;">🔒 Access Denied</h1>
                <p style="font-size:1.2rem;">Invalid password. Please contact family admin.</p>
            </div>
        </div>
    `;
    throw new Error('Access denied');
}
```

### Option 2: Private Repository
- Make GitHub repository private
- Only invited family members can access

## 📱 Features Your Family Gets

### 🎛️ **Navigation:**
- **📁 All Media** - Shows everything together
- **📸 Photos** - Photos only section  
- **🎥 Videos** - Videos only section

### ⌨️ **Keyboard Shortcuts:**
- **1** = All Media
- **2** = Photos Only  
- **3** = Videos Only
- **F** = Fullscreen Mode
- **←→** = Navigate in modal
- **ESC** = Close modal
- **D** = Download current item
- **Space** = Play/Pause video

### 📱 **Mobile Features:**
- Touch-friendly interface
- Swipe navigation
- Responsive design
- Full-screen viewing

### 📥 **Download Options:**
- Download individual photos/videos
- Download all files from current section
- Batch download with confirmation

## 🎨 Customization

### Change Colors:
Edit `gallery-styles.css` around line 5:
```css
:root {
    --primary-color: #667eea;    /* Change main color */
    --secondary-color: #764ba2;  /* Change secondary color */
    --accent-color: #f093fb;     /* Change accent color */
}
```

### Change Title:
Edit `family-gallery.html` around line 20:
```html
<h1 class="header-title">📸 Your Family Name Gallery</h1>
<p class="header-subtitle">Your custom subtitle here</p>
```

## 🚀 Quick Test Checklist

- [ ] Create folder structure
- [ ] Add photos to `photos/` folder
- [ ] Add videos to `videos/` folder  
- [ ] Edit photo list in `gallery-script.js`
- [ ] Edit video list in `gallery-script.js`
- [ ] Test locally by opening `family-gallery.html`
- [ ] Upload to GitHub Pages or Netlify
- [ ] Share URL with family
- [ ] Test on mobile devices

## 🎉 Final Result

Your family will get:
- **Beautiful gallery** with separate photo/video sections
- **Professional design** that works on all devices
- **Easy navigation** with keyboard shortcuts
- **Download capability** for saving favorites
- **Private access** (if you add password protection)
- **No upload mess** - just pure viewing experience

Perfect for sharing family memories! 📸❤️

## 🆘 Need Help?

If you need to add more photos/videos later:
1. Add files to respective folders
2. Edit the arrays in `gallery-script.js`
3. Re-upload to your hosting platform

Your family gallery is ready to share beautiful memories! 🎊