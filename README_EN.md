# Compress - Image Compression Tool

> A pure frontend image compression tool with cropping, watermark, and multi-format output. All processing happens in the browser to protect your privacy.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Cropper.js](https://img.shields.io/badge/Cropper.js-v1.5.13-green)

[← Back to Muripo HQ](https://tznthou.github.io/muripo-hq/) | [中文](README.md)

## Features

- **Image Compression** - Supports JPEG, PNG, WebP output formats
- **Custom Quality** - Slider adjustment + presets (High Compression/Recommended/High Quality)
- **Image Cropping** - Free selection cropping area
- **Watermark** - Optional custom text watermark
- **Dark Mode** - Auto-detect system theme + manual toggle
- **Drag & Drop** - Support drag and drop file upload
- **Responsive Design** - Perfect fit for desktop and mobile
- **Privacy Protection** - Pure frontend processing, images never uploaded to server

## Quick Start

### Direct Use

After downloading the project, simply open `index.html` in your browser.

### Local Development (Recommended)

Since ES6 Modules are used, it's recommended to run through a local server to avoid CORS issues:

**VS Code Live Server (Recommended)**

1. Install VS Code extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Open the project folder in VS Code
3. Right-click `index.html` → Select "Open with Live Server"
4. Browser will auto-open with hot reload support

> **Note**: No `npm install` required, all external dependencies are loaded via CDN.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 Canvas API | Image compression and watermark rendering |
| Cropper.js | Image cropping functionality |
| ES6 Modules | Modular code organization |
| CSS Variables | Theme switching (dark/light mode) |
| FileReader API | Local file reading |

### External Dependencies (CDN)

- [Cropper.js](https://github.com/fengyuanchen/cropperjs) v1.5.13
- [Font Awesome](https://fontawesome.com/) 6.0
- [Google Fonts](https://fonts.google.com/) - Noto Sans TC

## Project Structure

```
day-01-compress/
├── index.html              # Main page
├── style.css               # Styles (dark mode, responsive)
├── js/
│   ├── app.js              # Entry module: initialization and event binding
│   ├── config.js           # Config constants and CSS selectors
│   ├── dom.js              # DOM operations and message notifications
│   ├── utils.js            # Utility functions (formatting, gradients, etc.)
│   ├── image-compressor.js # Image compression core logic
│   ├── cropper-manager.js  # Cropper.js instance management
│   └── ui-manager.js       # UI interactions (drag & drop, slider)
└── README.md               # Project documentation
```

## Usage Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. Upload  │ →  │  2. Config  │ →  │  3. Download│
│  Select img │    │  Crop/Comp  │    │  Get result │
└─────────────┘    └─────────────┘    └─────────────┘
```

1. **Upload Image**: Click or drag & drop image file
2. **Adjust Settings**:
   - Select compression level (1-100%)
   - Optional: Crop image
   - Optional: Add watermark
   - Optional: Select output format
3. **Download Result**: Preview compression effect, one-click download

## Technical Details

### Image Size Limits

- Max single dimension: 4096px
- Max total pixels: 16,777,216 (auto-scaled proportionally if exceeded)
- Max file size: 50MB

### PNG Transparency Handling

When compressing PNG, `clearRect()` is used to clear the Canvas, ensuring transparent areas don't turn black.

### Race Condition Prevention

Uses `processId` to track compression requests, ensuring old requests don't overwrite new results when quickly switching images.

## Deployment

This is a pure static webpage that can be deployed to any static hosting service:

| Platform | Deployment Method |
|----------|-------------------|
| GitHub Pages | Push to `gh-pages` branch |
| Netlify | Drag & drop folder or connect Git |
| Vercel | `vercel --prod` |
| Cloudflare Pages | Connect Git repository |

## Browser Support

Supports all modern browsers:

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

> Requires ES6 Modules and Canvas API support

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Tzu-Chao - [tznthou@gmail.com](mailto:tznthou@gmail.com)
