# 圖片壓縮工具

> 純前端圖片壓縮工具，支援裁切、浮水印、多格式輸出。所有處理皆在瀏覽器完成，保護您的隱私。

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Cropper.js](https://img.shields.io/badge/Cropper.js-v1.5.13-green)

## 功能特色

- **圖片壓縮** - 支援 JPEG、PNG、WebP 格式輸出
- **自訂品質** - 滑桿調整 + 預設選項（高壓縮/推薦/高品質）
- **圖片裁切** - 自由選取裁切區域
- **浮水印** - 可選添加自訂文字浮水印
- **深色模式** - 自動偵測系統主題 + 手動切換
- **拖放上傳** - 支援拖放檔案上傳
- **響應式設計** - 完美適配桌面與手機
- **隱私保護** - 純前端處理，圖片不會上傳到伺服器

## 快速開始

### 直接使用

下載專案後，直接在瀏覽器開啟 `index.html` 即可使用。

### 本地開發（推薦）

由於使用 ES6 Modules，開發時建議透過本地伺服器運行以避免 CORS 問題：

**VS Code Live Server（推薦）**

1. 安裝 VS Code 擴充套件 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. 在 VS Code 中開啟專案資料夾
3. 右鍵點擊 `index.html` → 選擇「Open with Live Server」
4. 瀏覽器會自動開啟並支援熱重載

> **注意**：此專案無需 `npm install`，所有外部依賴皆透過 CDN 載入。

## 技術架構

### 核心技術

| 技術 | 用途 |
|------|------|
| HTML5 Canvas API | 圖片壓縮與浮水印繪製 |
| Cropper.js | 圖片裁切功能 |
| ES6 Modules | 模組化程式碼組織 |
| CSS Variables | 主題切換（深色/淺色模式） |
| FileReader API | 本地檔案讀取 |

### 外部依賴（CDN）

- [Cropper.js](https://github.com/fengyuanchen/cropperjs) v1.5.13
- [Font Awesome](https://fontawesome.com/) 6.0
- [Google Fonts](https://fonts.google.com/) - Noto Sans TC

## 專案結構

```
day-01-compress/
├── index.html              # 主頁面
├── style.css               # 樣式（含深色模式、響應式）
├── js/
│   ├── app.js              # 入口模組：初始化與事件綁定
│   ├── config.js           # 配置常數與 CSS 選擇器
│   ├── dom.js              # DOM 操作與訊息提示
│   ├── utils.js            # 工具函數（格式化、漸變色等）
│   ├── image-compressor.js # 圖片壓縮核心邏輯
│   ├── cropper-manager.js  # Cropper.js 實例管理
│   └── ui-manager.js       # UI 互動（拖放、滑桿）
├── CLAUDE.md               # Claude Code 開發指南
└── README.md               # 專案說明文件
```

### 模組職責

| 模組 | 職責 |
|------|------|
| `app.js` | 應用程式入口，初始化流程與事件綁定 |
| `config.js` | 集中管理配置常數與 DOM 選擇器 |
| `dom.js` | DOM 查詢、動畫效果、訊息提示 |
| `utils.js` | 通用工具函數（檔案大小格式化等） |
| `image-compressor.js` | Canvas 壓縮、浮水印、結果展示 |
| `cropper-manager.js` | Cropper.js 生命週期管理 |
| `ui-manager.js` | 拖放上傳、滑桿背景更新 |

## 使用流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. 上傳    │ →  │  2. 設定    │ →  │  3. 下載    │
│  選擇圖片   │    │  裁切/壓縮  │    │  取得結果   │
└─────────────┘    └─────────────┘    └─────────────┘
```

1. **上傳圖片**：點選或拖放圖片檔案
2. **調整設定**：
   - 選擇壓縮程度（1-100%）
   - 可選：裁切圖片
   - 可選：添加浮水印
   - 可選：選擇輸出格式
3. **下載結果**：預覽壓縮效果，一鍵下載

## 技術細節

### 圖片尺寸限制

- 單邊最大：4096px
- 總像素最大：16,777,216（超過自動等比縮放）
- 檔案大小限制：50MB

### PNG 透明度處理

壓縮 PNG 時使用 `clearRect()` 清除 Canvas，確保透明區域不會變成黑色。

### 防競態條件

使用 `processId` 追蹤壓縮請求，確保快速切換圖片時舊請求不會覆蓋新結果。

## 部署

此為純靜態網頁，可部署至任何靜態託管服務：

| 平台 | 部署方式 |
|------|----------|
| GitHub Pages | 推送至 `gh-pages` 分支 |
| Netlify | 拖放資料夾或連接 Git |
| Vercel | `vercel --prod` |
| Cloudflare Pages | 連接 Git 儲存庫 |

## 瀏覽器支援

支援所有現代瀏覽器：

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

> 需要支援 ES6 Modules 和 Canvas API

## 授權

本專案採用 [MIT License](LICENSE) 授權。

## 作者

子超 - [tznthou@gmail.com](mailto:tznthou@gmail.com)
