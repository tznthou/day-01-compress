/**
 * 圖片壓縮模組
 */

import { CONFIG, SELECTORS } from './config.js';
import { formatFileSize, getBaseFileName, handleError } from './utils.js';
import { getElement, showMessage, animateElement, animateShake } from './dom.js';
import { getCroppedCanvas, getLastUploadedFile, cleanupCanvas } from './cropper-manager.js';
import { activateStep, markStepCompleted } from './app.js';

let currentProcessId = 0; // 追蹤處理請求

/**
 * 驗證圖片輸入
 * @param {File} file - 圖片檔案
 * @returns {boolean} 是否通過驗證
 */
function validateImageInput(file) {
    const croppedCanvas = getCroppedCanvas();

    if (!file && !croppedCanvas) {
        showMessage("請先選擇圖片");
        animateShake(getElement(SELECTORS.FILE_UPLOAD_BTN));
        return false;
    }

    if (file && !file.type.startsWith('image/')) {
        showMessage("只能上傳圖片檔案");
        return false;
    }

    if (file && file.size > CONFIG.MAX_FILE_SIZE) {
        showMessage(`檔案過大，請選擇小於 ${Math.round(CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB 的圖片`);
        return false;
    }

    return true;
}

/**
 * 設定壓縮按鈕狀態
 * @param {boolean} isCompressing - 是否正在壓縮
 * @returns {HTMLElement|null} 進度條元素
 */
function setCompressingState(isCompressing) {
    const compressButton = getElement(SELECTORS.COMPRESS_BUTTON);
    if (!compressButton) return null;

    if (isCompressing) {
        compressButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
        compressButton.classList.add('processing');
        compressButton.disabled = true;

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        compressButton.appendChild(progressBar);
        return progressBar;
    } else {
        compressButton.innerHTML = '<i class="fas fa-compress"></i> 壓縮圖片';
        compressButton.classList.remove('processing');
        compressButton.disabled = false;

        // 移除進度條
        const progressBar = compressButton.querySelector('.progress-bar');
        if (progressBar) {
            compressButton.removeChild(progressBar);
        }
        return null;
    }
}

/**
 * 模擬進度條
 * @param {HTMLElement} progressBar - 進度條元素
 * @returns {Object} 包含 complete 方法的物件
 */
function simulateProgress(progressBar) {
    if (!progressBar) return { complete: () => {} };

    let width = 0;
    const interval = setInterval(() => {
        if (width >= CONFIG.PROGRESS_BAR_MAX) {
            clearInterval(interval);
        } else {
            width += Math.random() * 10;
            if (width > CONFIG.PROGRESS_BAR_MAX) width = CONFIG.PROGRESS_BAR_MAX;
            progressBar.style.width = width + '%';
        }
    }, CONFIG.PROGRESS_BAR_INTERVAL);

    return {
        complete: function() {
            clearInterval(interval);
            progressBar.style.width = '100%';
            setTimeout(() => {
                if (progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
            }, 300);
        }
    };
}

/**
 * 顯示原始圖片和資訊
 * @param {HTMLImageElement} img - 圖片元素
 * @param {File} file - 檔案物件
 */
function displayOriginalImage(img, file) {
    // 顯示原始圖片（新版 HTML 已有 img 元素，直接設定 src）
    const originalImage = getElement(SELECTORS.ORIGINAL_IMAGE);
    if (originalImage) {
        originalImage.src = img.src;
        // 添加淡入動畫
        originalImage.style.opacity = '0';
        setTimeout(() => {
            originalImage.style.transition = `opacity ${CONFIG.IMAGE_FADE_DURATION / 1000}s ease`;
            originalImage.style.opacity = '1';
        }, 50);
    }

    // 顯示原始圖片詳細資訊
    const originalInfo = getElement(SELECTORS.ORIGINAL_INFO);
    if (originalInfo) {
        originalInfo.textContent = `${formatFileSize(file.size)} | ${file.type.split('/')[1].toUpperCase()} | ${img.width} x ${img.height}`;
    }
}

/**
 * 在 Canvas 上添加浮水印
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} width - Canvas 寬度
 * @param {number} height - Canvas 高度
 */
function addWatermark(ctx, width, height) {
    // 檢查浮水印開關是否啟用
    const watermarkEnabled = getElement(SELECTORS.WATERMARK_ENABLED);
    if (!watermarkEnabled || !watermarkEnabled.checked) {
        return;
    }

    const watermarkInput = getElement(SELECTORS.WATERMARK_TEXT);
    if (!watermarkInput || watermarkInput.value.trim() === '') {
        return;
    }

    // 限制長度和清理特殊字元（包括潛在的 HTML/XSS 字元）
    let watermarkText = watermarkInput.value
        .trim()
        .slice(0, CONFIG.WATERMARK_MAX_LENGTH)
        .replace(/[\x00-\x1F\x7F<>"'&\\]/g, ''); // 移除控制字元和 HTML 特殊字元

    if (!watermarkText) return;

    ctx.save();
    // 動態調整字型大小
    const fontSize = Math.floor(width / CONFIG.WATERMARK_FONT_SIZE_RATIO);
    ctx.font = `${fontSize}px Noto Sans TC, sans-serif`;
    ctx.fillStyle = 'rgba(108, 99, 255, 0.35)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    // 右下角留邊距
    const padding = Math.floor(width / CONFIG.WATERMARK_PADDING_RATIO);
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText(watermarkText, width - padding, height - padding);
    ctx.restore();
}

/**
 * 處理壓縮功能
 * @param {HTMLImageElement|HTMLCanvasElement} originalImg - 原始圖片或 Canvas
 * @param {File} file - 原始檔案
 * @param {Object} progress - 進度物件
 * @param {boolean} isCanvas - 是否為 Canvas（來自裁切）
 */
function processCompression(originalImg, file, progress, isCanvas = false) {
    let canvas, ctx, width, height;

    if (isCanvas && originalImg instanceof HTMLCanvasElement) {
        // 使用裁切後的 Canvas，需要複製一份以便加浮水印
        const sourceCanvas = originalImg;
        width = sourceCanvas.width;
        height = sourceCanvas.height;

        // 裁切後的圖片也需要檢查尺寸限制
        let needsResize = false;

        // 檢查總像素數
        if (width * height > CONFIG.MAX_TOTAL_PIXELS) {
            const ratio = Math.sqrt(CONFIG.MAX_TOTAL_PIXELS / (width * height));
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            needsResize = true;
            showMessage("裁切後圖片像素過高，已自動調整尺寸");
        }

        // 檢查單邊尺寸
        if (width > CONFIG.MAX_IMAGE_DIMENSION || height > CONFIG.MAX_IMAGE_DIMENSION) {
            if (width > height) {
                height = Math.round(height * (CONFIG.MAX_IMAGE_DIMENSION / width));
                width = CONFIG.MAX_IMAGE_DIMENSION;
            } else {
                width = Math.round(width * (CONFIG.MAX_IMAGE_DIMENSION / height));
                height = CONFIG.MAX_IMAGE_DIMENSION;
            }
            needsResize = true;
            showMessage("裁切後圖片尺寸很大，已調整為較小尺寸以確保性能");
        }

        // 建立新 Canvas 複製內容
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // 檢查 context 是否成功建立
        if (!ctx) {
            showMessage("無法建立 Canvas 上下文，請嘗試較小的圖片");
            setCompressingState(false);
            return;
        }

        // 根據是否需要縮放，選擇繪製方式
        if (needsResize) {
            ctx.drawImage(sourceCanvas, 0, 0, width, height);
        } else {
            ctx.drawImage(sourceCanvas, 0, 0);
        }
    } else {
        // 建立新 Canvas
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');

        // 檢查 context 是否成功建立
        if (!ctx) {
            showMessage("無法建立 Canvas 上下文，請嘗試較小的圖片");
            setCompressingState(false);
            return;
        }

        // 檢查圖片尺寸和總像素數
        width = originalImg.width;
        height = originalImg.height;

        // 檢查總像素數
        if (width * height > CONFIG.MAX_TOTAL_PIXELS) {
            const ratio = Math.sqrt(CONFIG.MAX_TOTAL_PIXELS / (width * height));
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            showMessage("圖片像素過高，已自動調整尺寸");
        }

        // 檢查單邊尺寸
        if (width > CONFIG.MAX_IMAGE_DIMENSION || height > CONFIG.MAX_IMAGE_DIMENSION) {
            if (width > height) {
                height = Math.round(height * (CONFIG.MAX_IMAGE_DIMENSION / width));
                width = CONFIG.MAX_IMAGE_DIMENSION;
            } else {
                width = Math.round(width * (CONFIG.MAX_IMAGE_DIMENSION / height));
                height = CONFIG.MAX_IMAGE_DIMENSION;
            }
            showMessage("圖片尺寸很大，已調整為較小尺寸以確保性能");
        }

        canvas.width = width;
        canvas.height = height;

        // PNG 透明度處理
        if (file && file.type === 'image/png') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(originalImg, 0, 0, width, height);
    }

    // 加入浮水印（無論是否為裁切後的圖片）
    addWatermark(ctx, width, height);

    // 取得壓縮參數
    const qualitySlider = getElement(SELECTORS.QUALITY_SLIDER);
    const outputFormatSelect = getElement(SELECTORS.OUTPUT_FORMAT);

    const quality = qualitySlider ? qualitySlider.value / 100 : 0.7;
    const outputFormat = outputFormatSelect ? outputFormatSelect.value : 'jpeg';
    const mimeType = 'image/' + outputFormat;

    const compressedDataUrl = canvas.toDataURL(mimeType, quality);

    // 顯示壓縮後的圖片
    displayCompressedImage(
        compressedDataUrl,
        file ? file.size : 0,
        file ? file.type : '',
        outputFormat,
        width,
        height
    );

    // 完成進度
    progress.complete();
}

/**
 * 顯示壓縮後的圖片和資訊
 * @param {string} compressedDataUrl - 壓縮後的 Data URL
 * @param {number} originalSize - 原始檔案大小
 * @param {string} originalType - 原始檔案類型
 * @param {string} outputFormat - 輸出格式
 * @param {number} width - 圖片寬度
 * @param {number} height - 圖片高度
 */
function displayCompressedImage(compressedDataUrl, originalSize, originalType, outputFormat, width, height) {
    // 計算壓縮後大小：取得 Base64 部分（去除 data:image/xxx;base64, 前綴）
    const base64Data = compressedDataUrl.split(',')[1] || '';
    const compressedSize = Math.round(base64Data.length * 3 / 4);
    const compressionRatio = originalSize > 0
        ? ((1 - (compressedSize / originalSize)) * 100).toFixed(2)
        : 0;
    const savedSize = originalSize - compressedSize;

    // === 更新統計卡片 ===
    const compressionRate = getElement(SELECTORS.COMPRESSION_RATE);
    if (compressionRate) {
        compressionRate.textContent = `-${compressionRatio}%`;
    }

    const sizeSaved = getElement(SELECTORS.SIZE_SAVED);
    if (sizeSaved) {
        sizeSaved.textContent = formatFileSize(savedSize);
    }

    const sizeComparison = getElement(SELECTORS.SIZE_COMPARISON);
    if (sizeComparison) {
        sizeComparison.textContent = `${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)}`;
    }

    // === 顯示壓縮後的圖片 ===
    const compressedImage = getElement(SELECTORS.COMPRESSED_IMAGE);
    if (compressedImage) {
        compressedImage.src = compressedDataUrl;
        // 添加淡入動畫
        compressedImage.style.opacity = '0';
        setTimeout(() => {
            compressedImage.style.transition = `opacity ${CONFIG.IMAGE_FADE_DURATION / 1000}s ease`;
            compressedImage.style.opacity = '1';
        }, 50);
    }

    // === 顯示壓縮資訊 ===
    const compressedInfo = getElement(SELECTORS.COMPRESSED_INFO);
    if (compressedInfo) {
        compressedInfo.textContent = `${formatFileSize(compressedSize)} | ${outputFormat.toUpperCase()} | ${width} x ${height}`;
    }

    // 設定下載連結
    const downloadLink = getElement(SELECTORS.DOWNLOAD_LINK);
    if (downloadLink) {
        downloadLink.href = compressedDataUrl;

        // 設置下載檔名
        const fileNameElement = getElement(SELECTORS.FILE_NAME);
        const fileName = fileNameElement ? fileNameElement.textContent : 'compressed-image';
        const baseName = getBaseFileName(fileName);
        downloadLink.download = `${baseName}-compressed.${outputFormat}`;
        downloadLink.style.display = 'inline-block';

        // 添加下載按鈕動畫
        downloadLink.classList.add('appear');
    }

    // 如果壓縮效果不明顯，顯示提示
    if (parseFloat(compressionRatio) < 5) {
        showMessage("此圖片壓縮效果有限，可能已經最佳化或不適合進一步壓縮");
    } else if (parseFloat(compressionRatio) > 70) {
        showMessage("壓縮效果顯著！已減少超過 70% 的檔案大小");
    }

    // 顯示格式變更警告
    const originalFormat = originalType ? originalType.split('/')[1] : '';
    if (originalFormat && outputFormat !== originalFormat && !(originalFormat === 'jpeg' && outputFormat === 'jpg')) {
        showMessage(`注意: 圖片格式已從 ${originalFormat.toUpperCase()} 變更為 ${outputFormat.toUpperCase()}`);
    }

    // 恢復按鈕狀態
    setCompressingState(false);

    // 標記步驟 2 完成，激活步驟 3（下載結果）
    markStepCompleted(2);
    setTimeout(() => {
        activateStep(3);
    }, CONFIG.SCROLL_DELAY);
}

/**
 * 處理從檔案載入
 * @param {Event} event - 檔案載入事件
 * @param {File} file - 檔案物件
 * @param {Object} progress - 進度物件
 * @param {number} processId - 處理請求 ID
 */
function handleFileLoad(event, file, progress, processId) {
    // 檢查是否為最新請求
    if (processId !== currentProcessId) {
        console.log('Compression cancelled - newer request exists');
        setCompressingState(false);
        return;
    }

    const img = new Image();
    img.onload = () => {
        // 再次檢查請求 ID
        if (processId !== currentProcessId) {
            console.log('Compression cancelled - newer request exists');
            setCompressingState(false);
            return;
        }

        displayOriginalImage(img, file);

        setTimeout(() => {
            // 最後檢查請求 ID
            if (processId !== currentProcessId) {
                console.log('Compression cancelled - newer request exists');
                setCompressingState(false);
                return;
            }

            try {
                processCompression(img, file, progress);
            } catch (error) {
                handleError(error, 'processCompression');
                showMessage(`發生錯誤: ${error.message || '未知錯誤'}`);
                setCompressingState(false);
            }
        }, CONFIG.COMPRESSION_DELAY);
    };

    img.onerror = () => {
        // 檢查是否為最新請求，避免舊請求影響新請求狀態
        if (processId !== currentProcessId) {
            console.log('Error in old request, ignoring');
            img.src = ''; // 清理記憶體
            return;
        }
        showMessage("圖片載入失敗，請嘗試其他格式");
        setCompressingState(false);
        img.src = ''; // 清理記憶體
    };

    img.src = event.target.result;
}

/**
 * 從檔案處理壓縮
 * @param {File} file - 檔案物件
 * @param {number} processId - 處理請求 ID
 */
function processFromFile(file, processId) {
    const progressBar = setCompressingState(true);
    const progress = simulateProgress(progressBar);

    const reader = new FileReader();
    reader.onload = (e) => handleFileLoad(e, file, progress, processId);
    reader.onerror = () => {
        handleError(reader.error, 'FileReader');
        showMessage("讀取檔案時發生錯誤");
        setCompressingState(false);
    };
    reader.readAsDataURL(file);
}

/**
 * 從 Canvas 處理壓縮
 * @param {HTMLCanvasElement} canvas - Canvas 物件
 * @param {File} file - 原始檔案
 * @param {number} processId - 處理請求 ID
 */
function processFromCanvas(canvas, file, processId) {
    const progressBar = setCompressingState(true);
    const progress = simulateProgress(progressBar);

    setTimeout(() => {
        // 檢查是否為最新請求
        if (processId !== currentProcessId) {
            console.log('Compression cancelled - newer request exists');
            setCompressingState(false);
            return;
        }

        try {
            processCompression(canvas, file, progress, true);

            // 清理 Canvas 記憶體
            cleanupCanvas(canvas);
        } catch (error) {
            handleError(error, 'processFromCanvas');
            showMessage(`發生錯誤: ${error.message || '未知錯誤'}`);
            setCompressingState(false);
        }
    }, CONFIG.COMPRESSION_DELAY);
}

/**
 * 圖片壓縮主函數
 */
export function compressImage() {
    const fileInput = getElement(SELECTORS.IMAGE_INPUT);
    const file = fileInput ? fileInput.files[0] : null;

    // 驗證輸入
    if (!validateImageInput(file)) {
        return;
    }

    // 遞增處理 ID（防止競態條件）
    currentProcessId++;
    const processId = currentProcessId;

    // 處理壓縮
    const croppedCanvas = getCroppedCanvas();
    if (croppedCanvas) {
        processFromCanvas(croppedCanvas, getLastUploadedFile(), processId);
    } else {
        processFromFile(file, processId);
    }
}
