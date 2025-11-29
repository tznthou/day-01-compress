/**
 * 主應用程式模組（適配 improved 版本）
 * 負責初始化和事件綁定
 */

import { CONFIG, SELECTORS } from './config.js';
import { getSliderGradient, getQualityHint, formatFileSize, isSystemDarkMode } from './utils.js';
import { getElement, animateElement, addAnimationStyles } from './dom.js';
import {
    cleanupAll as cleanupCropperAll,
    initCropper,
    setUploadedFile,
    handleCropButton,
    resetCropper
} from './cropper-manager.js';
import { compressImage } from './image-compressor.js';
import {
    updateSliderBackground,
    handleOrientationChange,
    setupDragAndDrop
} from './ui-manager.js';

/**
 * 初始化應用程式
 */
function initializeApp() {
    // === 檔案上傳處理 ===
    const imageInput = getElement(SELECTORS.IMAGE_INPUT);
    const uploadZone = getElement(SELECTORS.UPLOAD_ZONE);
    const uploadedPreview = getElement(SELECTORS.UPLOADED_PREVIEW);

    if (imageInput) {
        imageInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (!file) return;

            handleFileUpload(file);
        });
    }

    // 更換圖片按鈕
    const changeFileBtn = getElement(SELECTORS.CHANGE_FILE_BTN);
    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', function() {
            if (imageInput) {
                imageInput.click();
            }
        });
    }

    // === 預設品質按鈕 ===
    const presetButtons = document.querySelectorAll(SELECTORS.PRESET_BUTTONS);
    const qualitySlider = getElement(SELECTORS.QUALITY_SLIDER);

    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const quality = parseInt(this.dataset.quality);

            // 移除所有 active 狀態
            presetButtons.forEach(b => b.classList.remove('active'));
            // 設定當前按鈕為 active
            this.classList.add('active');

            // 更新滑桿值
            if (qualitySlider) {
                qualitySlider.value = quality;
                qualitySlider.dispatchEvent(new Event('input'));
            }
        });
    });

    // === 品質滑桿事件 ===
    const qualityValue = getElement(SELECTORS.QUALITY_VALUE);
    const qualityHint = getElement(SELECTORS.QUALITY_HINT);

    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener("input", function() {
            const value = parseInt(this.value);
            qualityValue.textContent = value;

            // 更新品質提示文字
            if (qualityHint) {
                qualityHint.textContent = getQualityHint(value);
            }

            // 更新滑桿的背景
            this.style.background = getSliderGradient(value, isSystemDarkMode());

            // 同步預設按鈕狀態
            syncPresetButtons(value);

            // 添加微動畫
            animateElement(qualityValue.parentElement, 'pulse');
        });
    }

    // === 壓縮按鈕 ===
    const compressButton = getElement(SELECTORS.COMPRESS_BUTTON);
    if (compressButton) {
        compressButton.addEventListener("click", compressImage);
    }

    // === 浮水印開關事件 ===
    const watermarkEnabled = getElement(SELECTORS.WATERMARK_ENABLED);
    const watermarkText = getElement(SELECTORS.WATERMARK_TEXT);

    if (watermarkEnabled && watermarkText) {
        // 初始化輸入框狀態
        watermarkText.disabled = !watermarkEnabled.checked;
        watermarkText.style.opacity = watermarkEnabled.checked ? '1' : '0.5';

        watermarkEnabled.addEventListener('change', function() {
            const isChecked = this.checked;

            // 更新輸入框狀態
            watermarkText.disabled = !isChecked;
            watermarkText.style.opacity = isChecked ? '1' : '0.5';
            watermarkText.style.transition = 'opacity 0.3s ease';
        });
    }

    // === 重新開始按鈕 ===
    const restartBtn = getElement(SELECTORS.RESTART_BTN);
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            // 重置為步驟 1
            location.reload();
        });
    }

    // === 裁切按鈕事件 ===
    const cropButton = getElement(SELECTORS.CROP_BUTTON);
    if (cropButton) {
        cropButton.addEventListener('click', handleCropButton);
    }

    const resetCropButton = getElement(SELECTORS.RESET_CROP_BUTTON);
    if (resetCropButton) {
        resetCropButton.addEventListener('click', resetCropper);
    }

    // === 主題切換按鈕 ===
    initThemeToggle();

    // === 初始化 UI ===
    updateSliderBackground();
    setupDragAndDrop();

    // 監聽深色模式變化
    if (window.matchMedia) {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.addEventListener('change', function(e) {
            updateSliderBackground();
            if (qualitySlider) {
                qualitySlider.dispatchEvent(new Event('input'));
            }
        });
    }

    // 檢查並適應螢幕方向變化
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    // 添加動畫CSS
    addAnimationStyles();
}

/**
 * 處理檔案上傳
 * @param {File} file - 上傳的檔案
 */
function handleFileUpload(file) {
    const uploadZone = getElement(SELECTORS.UPLOAD_ZONE);
    const uploadedPreview = getElement(SELECTORS.UPLOADED_PREVIEW);
    const fileName = getElement(SELECTORS.FILE_NAME);
    const fileSize = getElement(SELECTORS.FILE_SIZE);
    const previewImage = getElement(SELECTORS.PREVIEW_IMAGE);

    // 更新檔名和檔案大小
    if (fileName) {
        fileName.textContent = file.name;
    }
    if (fileSize) {
        fileSize.textContent = formatFileSize(file.size);
    }

    // 保存檔案供裁切/壓縮使用
    setUploadedFile(file);

    // 顯示預覽圖片
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageSrc = e.target.result;

        if (previewImage) {
            previewImage.src = imageSrc;
        }

        // 初始化 Cropper（供裁切功能使用）
        initCropper(imageSrc);

        // 隱藏上傳區，顯示預覽區
        if (uploadZone) {
            uploadZone.style.display = 'none';
        }
        if (uploadedPreview) {
            uploadedPreview.style.display = 'block';
            animateElement(uploadedPreview, 'appear');
        }

        // 標記步驟 1 完成，激活步驟 2
        markStepCompleted(1);
        setTimeout(() => {
            activateStep(2);
        }, 300);
    };
    reader.readAsDataURL(file);
}

/**
 * 同步預設按鈕狀態
 * @param {number} quality - 當前品質值
 */
function syncPresetButtons(quality) {
    const presetButtons = document.querySelectorAll(SELECTORS.PRESET_BUTTONS);

    presetButtons.forEach(btn => {
        const btnQuality = parseInt(btn.dataset.quality);

        // 如果滑桿值接近預設值，高亮該按鈕
        if (Math.abs(quality - btnQuality) <= CONFIG.PRESET_QUALITY_TOLERANCE) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * 激活指定步驟
 * @param {number} stepNumber - 步驟編號 (1, 2, 3)
 */
export function activateStep(stepNumber) {
    const allSteps = document.querySelectorAll('.workflow-step');
    const targetStep = document.querySelector(`.workflow-step[data-step="${stepNumber}"]`);

    if (!targetStep) return;

    // 移除所有 active 狀態
    allSteps.forEach(step => step.classList.remove('active'));

    // 激活目標步驟
    targetStep.classList.add('active');

    // 平滑滾動到該步驟
    setTimeout(() => {
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * 標記步驟為完成
 * @param {number} stepNumber - 步驟編號
 */
export function markStepCompleted(stepNumber) {
    const step = document.querySelector(`.workflow-step[data-step="${stepNumber}"]`);
    if (step) {
        step.classList.add('completed');
    }
}

/**
 * 清理所有資源（用於 SPA 環境）
 */
function cleanup() {
    // 清理 Cropper 相關資源
    cleanupCropperAll();

    // 清理事件監聽器
    const imageInput = getElement(SELECTORS.IMAGE_INPUT);
    if (imageInput) {
        const newInput = imageInput.cloneNode(true);
        imageInput.parentNode.replaceChild(newInput, imageInput);
    }

    // 清理 resize 監聽器
    window.removeEventListener('resize', handleOrientationChange);

    // 清理深色模式監聽器
    if (window.matchMedia) {
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeMediaQuery.removeEventListener('change', updateSliderBackground);
    }
}

/**
 * 初始化主題切換功能
 */
function initThemeToggle() {
    const themeToggle = getElement(SELECTORS.THEME_TOGGLE);
    const themeIcon = getElement(SELECTORS.THEME_ICON);

    if (!themeToggle || !themeIcon) return;

    // 讀取 localStorage 中的主題設定（隱私模式下可能失敗）
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('localStorage not available:', e.message);
    }
    // 決定初始主題
    let currentTheme;
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        currentTheme = isSystemDarkMode() ? 'dark' : 'light';
    }

    // 套用初始主題
    applyTheme(currentTheme, themeIcon);

    // 點擊切換
    themeToggle.addEventListener('click', function() {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';

        applyTheme(newTheme, themeIcon);
        try {
            localStorage.setItem('theme', newTheme);
        } catch (e) {
            // 隱私模式下忽略儲存失敗
        }

        // 更新滑桿背景
        updateSliderBackground();
        const qualitySlider = getElement(SELECTORS.QUALITY_SLIDER);
        if (qualitySlider) {
            qualitySlider.dispatchEvent(new Event('input'));
        }
    });
}

/**
 * 套用主題
 * @param {string} theme - 'light' 或 'dark'
 * @param {HTMLElement} icon - 圖標元素
 */
function applyTheme(theme, icon) {
    const root = document.documentElement;

    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun'; // 深色模式顯示太陽（切換到淺色）
    } else {
        root.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-moon'; // 淺色模式顯示月亮（切換到深色）
    }
}

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", initializeApp);

// 導出清理函數供外部使用
if (typeof window !== 'undefined') {
    window.imageCompressorCleanup = cleanup;
}
