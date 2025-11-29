/**
 * Cropper 管理模組
 */

import { SELECTORS } from './config.js';
import { getElement, showMessage } from './dom.js';

let cropper = null;
let lastUploadedFile = null;
let croppedCanvasForCompress = null;
let originalImageSrc = null; // 保存原始圖片供重置使用

/**
 * 清理 Cropper 實例
 */
export function cleanupCropper() {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

/**
 * 清理 Canvas 記憶體
 * @param {HTMLCanvasElement} canvas - 要清理的 Canvas
 */
export function cleanupCanvas(canvas) {
    if (canvas && canvas instanceof HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
    }
}

/**
 * 初始化 Cropper（供上傳圖片後調用）
 * @param {string} imageSrc - 圖片的 Data URL
 */
export function initCropper(imageSrc) {
    // 清理舊的 cropper 實例
    cleanupCropper();

    // 清理舊的裁切結果（新圖片上傳時，舊裁切無效）
    clearCroppedCanvas();

    // 保存原始圖片供重置使用
    originalImageSrc = imageSrc;

    const cropperImage = getElement(SELECTORS.CROPPER_IMAGE);
    if (!cropperImage) return;

    cropperImage.src = imageSrc;

    // 等圖片載入後初始化 Cropper
    cropperImage.onload = function() {
        cropper = new Cropper(cropperImage, {
            viewMode: 1,
            aspectRatio: NaN, // 不限制比例
            autoCropArea: 1,
            movable: true,
            zoomable: true,
            scalable: true,
            rotatable: false,
        });
    };
}

/**
 * 重置 Cropper 到原始狀態
 */
export function resetCropper() {
    if (!originalImageSrc) {
        showMessage("沒有可重置的圖片");
        return;
    }

    // 清理已裁切的 Canvas
    clearCroppedCanvas();

    // 重新初始化 Cropper
    initCropper(originalImageSrc);
    showMessage("已重置裁切區域");
}

/**
 * 設置上傳的檔案（供 app.js 調用）
 * @param {File} file - 圖片檔案
 */
export function setUploadedFile(file) {
    lastUploadedFile = file;
}

/**
 * 裁切按鈕事件處理
 */
export function handleCropButton() {
    if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        if (!croppedCanvas) {
            showMessage("裁切失敗，請重新選擇區域");
            return;
        }

        // 顯示裁切後預覽（使用圖片元素而非直接插入 Canvas，避免破壞 DOM 結構）
        const originalImage = getElement(SELECTORS.ORIGINAL_IMAGE);
        if (originalImage) {
            originalImage.src = croppedCanvas.toDataURL();
        }

        // 提示使用者
        showMessage('已裁切圖片，請點擊「開始壓縮」進行壓縮');

        // 銷毀 Cropper 實例
        cleanupCropper();

        // 將裁切後的 canvas 暫存
        croppedCanvasForCompress = croppedCanvas;
    } else {
        showMessage('請先上傳並選擇裁切區域');
    }
}

/**
 * 取得裁切後的 Canvas
 * @returns {HTMLCanvasElement|null}
 */
export function getCroppedCanvas() {
    return croppedCanvasForCompress;
}

/**
 * 清除裁切後的 Canvas
 */
export function clearCroppedCanvas() {
    if (croppedCanvasForCompress) {
        cleanupCanvas(croppedCanvasForCompress);
        croppedCanvasForCompress = null;
    }
}

/**
 * 取得最後上傳的檔案
 * @returns {File|null}
 */
export function getLastUploadedFile() {
    return lastUploadedFile;
}

/**
 * 清理所有 Cropper 相關資源
 */
export function cleanupAll() {
    cleanupCropper();
    clearCroppedCanvas();
    lastUploadedFile = null;
}
