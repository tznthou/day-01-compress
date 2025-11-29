# JavaScript 模組結構

本專案使用 ES6 Modules 進行程式碼模組化，提升可維護性和可讀性。

## 模組說明

### 📁 config.js
**配置常數模組**
- `CONFIG` - 應用程式配置常數（檔案大小限制、動畫時間等）
- `SELECTORS` - DOM 選擇器常數

### 📁 utils.js
**工具函數模組**
- `formatFileSize()` - 格式化檔案大小
- `getBaseFileName()` - 提取檔名（不含副檔名）
- `getSliderGradient()` - 取得滑桿漸變顏色
- `handleError()` - 統一錯誤處理

### 📁 dom.js
**DOM 操作模組**
- `getElement()` - 安全地取得 DOM 元素
- `animateElement()` - 添加動畫效果
- `animateShake()` - 震動動畫
- `showMessage()` - 顯示訊息提示（單例模式）
- `addAnimationStyles()` - 動態添加 CSS 動畫

### 📁 cropper-manager.js
**Cropper 管理模組**
- `previewImageSize()` - 預覽圖片並初始化 Cropper
- `handleCropButton()` - 處理裁切按鈕事件
- `cleanupCropper()` - 清理 Cropper 實例
- `cleanupCanvas()` - 清理 Canvas 記憶體
- `getCroppedCanvas()` - 取得裁切後的 Canvas
- `getLastUploadedFile()` - 取得最後上傳的檔案
- `cleanupAll()` - 清理所有資源

### 📁 image-compressor.js
**圖片壓縮模組**
- `compressImage()` - 主要壓縮函數（對外公開）
- 內部函數：
  - `validateImageInput()` - 驗證輸入
  - `setCompressingState()` - 設定按鈕狀態
  - `simulateProgress()` - 模擬進度條
  - `displayOriginalImage()` - 顯示原始圖片
  - `addWatermark()` - 添加浮水印
  - `processCompression()` - 處理壓縮邏輯
  - `displayCompressedImage()` - 顯示壓縮結果
  - `handleFileLoad()` - 處理檔案載入
  - `processFromFile()` - 從檔案壓縮
  - `processFromCanvas()` - 從 Canvas 壓縮

### 📁 ui-manager.js
**UI 管理模組**
- `updateSliderBackground()` - 更新滑桿背景
- `createDecorativeElements()` - 創建裝飾元素
- `handleOrientationChange()` - 處理螢幕方向變化
- `setupDragAndDrop()` - 設置拖放上傳

### 📁 app.js
**主應用程式模組**
- `initializeApp()` - 初始化應用程式
- `cleanup()` - 清理所有資源（供 SPA 環境使用）
- 負責整合所有模組並綁定事件

## 模組依賴關係

```
app.js (主程式)
├── config.js
├── utils.js
├── dom.js
├── cropper-manager.js
│   ├── config.js
│   └── dom.js
├── image-compressor.js
│   ├── config.js
│   ├── utils.js
│   ├── dom.js
│   └── cropper-manager.js
└── ui-manager.js
    ├── config.js
    ├── utils.js
    └── dom.js
```

## 使用方式

在 HTML 中引入主模組：
```html
<script type="module" src="js/app.js"></script>
```

瀏覽器會自動載入所有相依的模組。

## 優點

1. **程式碼分離**：每個模組專注單一職責
2. **易於維護**：修改某個功能只需編輯對應模組
3. **避免全域污染**：使用 ES6 modules 封裝
4. **記憶體管理**：提供完整的清理機制
5. **可測試性**：各模組可獨立測試

## 注意事項

- ES6 Modules 需要透過 HTTP/HTTPS 伺服器執行（不能直接用 file:// 協定）
- 建議使用現代瀏覽器（支援 ES6 modules）
- 如需支援舊瀏覽器，可使用 Babel + Webpack 進行打包
