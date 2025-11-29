/**
 * 工具函數模組
 */

/**
 * 格式化檔案大小為人類可讀格式
 * @param {number} bytes - 位元組數
 * @returns {string} 格式化後的字串
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " bytes";
    } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(2) + " KB";
    } else {
        return (bytes / 1048576).toFixed(2) + " MB";
    }
}

/**
 * 從完整檔名中提取基礎名稱（不含副檔名）
 * @param {string} fullFileName - 完整檔名
 * @returns {string} 基礎檔名
 */
export function getBaseFileName(fullFileName) {
    // 移除尺寸標記（支援多種格式：像素、pixels、px）
    const cleanName = fullFileName.replace(/ ?\([0-9]+ ?x ?[0-9]+ ?(像素|pixels|px)?\)/gi, '');
    // 找到最後一個 . 的位置
    const lastDotIndex = cleanName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return cleanName;
    }
    return cleanName.substring(0, lastDotIndex);
}

/**
 * 取得滑桿漸變顏色
 * @param {number} percentage - 百分比值
 * @param {boolean} isDarkMode - 是否為深色模式
 * @returns {string} CSS 漸變字串
 */
export function getSliderGradient(percentage, isDarkMode = false) {
    const lightColor = isDarkMode ? '#444' : '#ddd';
    let primaryColor;

    if (percentage < 30) {
        primaryColor = '#FF6584';
    } else if (percentage < 70) {
        primaryColor = '#FDCA40';
    } else {
        primaryColor = '#39D98A';
    }

    return `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${percentage}%, ${lightColor} ${percentage}%, ${lightColor} 100%)`;
}

/**
 * 根據品質值取得提示文字
 * @param {number} quality - 品質值 (1-100)
 * @returns {string} 提示文字
 */
export function getQualityHint(quality) {
    if (quality < 30) {
        return '高壓縮';
    } else if (quality < 70) {
        return '平衡（推薦）';
    } else {
        return '高品質';
    }
}

/**
 * 統一的錯誤處理
 * @param {Error} error - 錯誤物件
 * @param {string} context - 錯誤發生的上下文
 */
export function handleError(error, context) {
    console.error(`[${context}] Error:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}

/**
 * 檢查系統是否為深色模式
 * @returns {boolean} 是否為深色模式
 */
export function isSystemDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
