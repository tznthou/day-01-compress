/**
 * 配置常數
 */

export const CONFIG = {
    MAX_IMAGE_DIMENSION: 4096,
    MAX_TOTAL_PIXELS: 16777216, // 4096 * 4096
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    WATERMARK_FONT_SIZE_RATIO: 20,
    WATERMARK_PADDING_RATIO: 40,
    WATERMARK_MAX_LENGTH: 50,
    PROGRESS_BAR_INTERVAL: 200,
    PROGRESS_BAR_MAX: 90,
    MESSAGE_DURATION: 3000,
    MESSAGE_FADE_DURATION: 500,
    IMAGE_FADE_DURATION: 500,
    SCROLL_DELAY: 300,
    COMPRESSION_DELAY: 800,
    PRESET_QUALITY_TOLERANCE: 5, // 預設按鈕品質容差範圍
    ANIMATION_DURATION: 500, // 動畫持續時間 (ms)
};

export const SELECTORS = {
    // 檔案上傳相關
    IMAGE_INPUT: '#imageInput',
    UPLOAD_ZONE: '#uploadZone',
    UPLOADED_PREVIEW: '#uploadedPreview',
    FILE_NAME: '#fileName',
    FILE_SIZE: '#fileSize',
    PREVIEW_IMAGE: '#previewImage',
    CHANGE_FILE_BTN: '#changeFileBtn',

    // 品質設定相關
    QUALITY_SLIDER: '#quality',
    QUALITY_VALUE: '#qualityValue',
    QUALITY_HINT: '#qualityHint', // 需要在HTML中新增
    PRESET_BUTTONS: '.preset-btn',

    // 進階設定
    OUTPUT_FORMAT: '#outputFormat',
    WATERMARK_ENABLED: '#watermarkEnabled',
    WATERMARK_TEXT: '#watermarkText',

    // 按鈕相關
    COMPRESS_BUTTON: '#compressButton',

    // 結果顯示相關
    ORIGINAL_CONTAINER: '#originalContainer',
    COMPRESSED_CONTAINER: '#compressedContainer',
    ORIGINAL_IMAGE: '#originalImage',
    COMPRESSED_IMAGE: '#compressedImage',
    ORIGINAL_INFO: '#originalInfo',
    COMPRESSED_INFO: '#compressedInfo',

    // 壓縮統計
    COMPRESSION_RATE: '#compressionRate',
    SIZE_SAVED: '#sizeSaved',
    SIZE_COMPARISON: '#sizeComparison',

    // 下載相關
    DOWNLOAD_LINK: '#downloadLink',
    RESTART_BTN: '#restartBtn',

    // 其他
    UPLOAD_BTN: '.upload-btn',
    LOADING_OVERLAY: '#loadingOverlay',

    // 拖放上傳相關（ui-manager.js 使用）
    FILE_UPLOAD_CONTAINER: '#uploadZone',
    FILE_UPLOAD_BTN: '.upload-btn',

    // 裁切相關
    CROP_SETTINGS: '#cropSettings',
    CROPPER_WRAPPER: '#cropperWrapper',
    CROPPER_IMAGE: '#cropperImage',
    CROP_BUTTON: '#cropButton',
    RESET_CROP_BUTTON: '#resetCropButton',

    // 主題切換
    THEME_TOGGLE: '#themeToggle',
    THEME_ICON: '#themeIcon',
};
