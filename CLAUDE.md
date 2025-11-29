# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個純前端的圖片壓縮工具，使用 HTML5 Canvas API 實作圖片壓縮、裁切和浮水印功能。無需後端伺服器，所有處理都在瀏覽器端執行。

## 技術架構

### 核心技術棧
- **純 HTML/CSS/JavaScript**：無建置工具，無框架依賴
- **Cropper.js v1.5.13**：圖片裁切功能 (CDN 載入)
- **Canvas API**：圖片壓縮和浮水印處理
- **Font Awesome 6.0**：圖標庫 (CDN 載入)
- **Google Fonts (Noto Sans TC)**：繁體中文字型支援

### 檔案結構
```
/
├── index.html      # 主頁面，包含所有 UI 元素
├── main.js         # 核心邏輯（壓縮、裁切、浮水印）
└── style.css       # 樣式（支援深色模式）
```

## 開發與測試

### 本地開發
由於是純靜態網頁，直接開啟 `index.html` 即可，但建議使用本地伺服器以避免 CORS 問題：

```bash
# Python 3
python3 -m http.server 8000

# Node.js (需安裝 http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

然後訪問 `http://localhost:8000`

### 無建置流程
- **無需 npm install**
- **無需 build/compile**
- 所有外部依賴透過 CDN 載入

## 核心功能實作邏輯

### 1. 圖片壓縮流程 (main.js:252-335)
```
使用者選擇圖片
→ FileReader 讀取為 Data URL
→ 繪製到 Canvas (包含尺寸檢查，最大 4096px)
→ 套用浮水印 (可選)
→ canvas.toDataURL(mimeType, quality) 壓縮
→ 顯示結果和下載連結
```

**關鍵點**：
- 壓縮品質透過 `canvas.toDataURL()` 的第二個參數控制 (0.01-1.0)
- 支援輸出格式：JPEG、PNG、WebP
- PNG 透明度處理：使用 `ctx.clearRect()` 避免黑色背景 (main.js:403-405)

### 2. 圖片裁切流程 (main.js:84-134)
```
上傳圖片
→ 初始化 Cropper 實例 (previewImageSize)
→ 使用者調整裁切區域
→ 點擊「裁切圖片」按鈕
→ cropper.getCroppedCanvas() 取得裁切後 Canvas
→ 暫存於 window.croppedCanvasForCompress
→ 銷毀 Cropper 實例
→ 壓縮時直接使用裁切後 Canvas
```

**關鍵點**：
- 裁切和壓縮是分離的兩個步驟
- 裁切後的 Canvas 暫存在全域變數 `window.croppedCanvasForCompress`
- 壓縮時檢查此變數優先使用裁切版本 (main.js:276-288)

### 3. 浮水印機制 (js/image-compressor.js:157-187)
- **開關控制**：使用 checkbox 讓使用者選擇是否啟用浮水印
- **檢查順序**：
  1. 檢查 `#watermarkEnabled` checkbox 是否勾選
  2. 檢查輸入框是否有文字
  3. 限制長度 50 字並過濾控制字元
- 動態字型大小：`fontSize = width / 20`
- 位置：右下角，padding = `width / 40`
- 顏色：`rgba(108, 99, 255, 0.35)` (主色 + 透明度)
- 陰影效果：`shadowColor: rgba(255,255,255,0.5)`
- **互動設計**：取消勾選時輸入框自動禁用並變灰 (opacity: 0.5)

### 4. 拖放上傳 (main.js:173-218)
使用 HTML5 Drag and Drop API，監聽四個事件：
- `dragenter` / `dragover`：顯示高亮邊框
- `dragleave` / `drop`：恢復樣式
- `drop` 事件：將檔案指派給 `<input type="file">` 並觸發 `change` 事件

## UI/UX 特色

### 響應式設計
- 桌面：雙欄比較布局 (原圖 vs 壓縮圖)
- 平板/手機：單欄堆疊布局 (768px 斷點)
- 橫向手機特殊處理：640-900px 間保持雙欄 (main.js:220-234)

### 深色模式支援
- 使用 `prefers-color-scheme: dark` 媒體查詢 (style.css:400-420)
- 動態調整滑桿背景色 (main.js:40-49, 162-170)
- 自動監聽系統主題變更 (main.js:65-71)

### 視覺回饋
- **進度動畫**：壓縮時顯示假進度條 (main.js:351-375)
- **微互動**：
  - `pulse` 動畫：品質值更新時 (main.js:52)
  - `shake` 動畫：未選擇檔案時點擊壓縮 (main.js:257)
  - 淡入效果：圖片載入 (main.js:301-305, 446-450)
- **裝飾元素**：三個浮動圓形背景 (main.js:137-146, style.css:350-383)

## 修改程式碼時的注意事項

### 防止破壞現有功能
1. **Cropper 生命週期管理**：
   - 初始化前必須先 `destroy()` 舊實例 (main.js:99)
   - 裁切完成後必須銷毀以釋放記憶體 (main.js:127)

2. **Canvas 尺寸限制**：
   - 最大尺寸 4096px (main.js:388)，超過會自動縮放
   - 刪除此邏輯可能導致大圖崩潰

3. **壓縮流程分支**：
   - 裁切後壓縮：使用暫存 Canvas (main.js:276-288)
   - 直接壓縮：從 File 建立新 Canvas (main.js:290-334)
   - 這兩個分支都必須保留

4. **PNG 透明度處理**：
   - 必須保留 `ctx.clearRect()` (main.js:404)
   - 否則 PNG 透明區域會變黑

### 程式碼品質規範
- 繁體中文註解和 UI 文字
- 函數命名使用 camelCase
- 事件監聽器使用具名函數以便除錯
- 所有使用者訊息透過 `showMessage()` 統一顯示 (main.js:512-538)

## 常見問題排查

### 圖片無法壓縮
1. 檢查檔案格式是否支援 (JPEG/PNG/WebP)
2. 檢查瀏覽器 Console 錯誤訊息
3. 確認圖片尺寸未超過瀏覽器 Canvas 限制

### 裁切功能異常
1. 確認 Cropper.js CDN 可存取
2. 檢查是否有多個 Cropper 實例衝突
3. 確認 `window.croppedCanvasForCompress` 未被其他程式碼覆寫

### 樣式錯誤
1. 深色模式：檢查 CSS 變數定義 (style.css:2-18, 401-412)
2. RWD 問題：檢查 `.comparison-container` 的 grid 邏輯
3. 動畫失效：確認 `addAnimationStyles()` 有執行

## 部署

### 靜態託管平台
可直接部署到任何靜態網頁託管服務：
- **GitHub Pages**：推送到 `gh-pages` 分支
- **Netlify**：拖放檔案或連接 Git
- **Vercel**：`vercel --prod`
- **Cloudflare Pages**：連接 Git 儲存庫

### CDN 依賴檢查
確保以下 CDN 可存取：
- Cropper.js: `cdn.jsdelivr.net`
- Font Awesome: `cdnjs.cloudflare.com`
- Google Fonts: `fonts.googleapis.com`

若 CDN 不穩定，建議下載到本地並修改引用路徑。
