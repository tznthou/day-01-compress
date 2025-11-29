/**
 * UI 管理模組
 */

import { SELECTORS } from './config.js';
import { getSliderGradient, isSystemDarkMode } from './utils.js';
import { getElement, showMessage } from './dom.js';

/**
 * 更新滑桿背景
 */
export function updateSliderBackground() {
    const qualitySlider = getElement(SELECTORS.QUALITY_SLIDER);
    if (!qualitySlider) return;

    const percentage = qualitySlider.value;
    qualitySlider.style.background = getSliderGradient(percentage, isSystemDarkMode());
}

/**
 * 處理螢幕方向變化
 */
export function handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const comparisonContainer = document.querySelector('.comparison-container');
    if (!comparisonContainer) return;

    // 在寬螢幕手機橫向模式下保持兩列展示
    if (isLandscape && window.innerWidth > 640 && window.innerWidth <= 900) {
        comparisonContainer.style.gridTemplateColumns = '1fr 1fr';
    } else {
        // 讓媒體查詢自動處理
        comparisonContainer.style.gridTemplateColumns = '';
    }
}

/**
 * 設置拖放上傳
 */
export function setupDragAndDrop() {
    const dropArea = getElement(SELECTORS.FILE_UPLOAD_CONTAINER);
    if (!dropArea) return;

    const dragDropHandlers = {
        preventDefaults: function(e) {
            e.preventDefault();
            e.stopPropagation();
        },

        highlight: function() {
            const dropArea = getElement(SELECTORS.FILE_UPLOAD_CONTAINER);
            if (!dropArea) return;
            dropArea.classList.add('highlight');
            dropArea.style.borderColor = '#6C63FF';
            dropArea.style.backgroundColor = 'rgba(108, 99, 255, 0.05)';
        },

        unhighlight: function() {
            const dropArea = getElement(SELECTORS.FILE_UPLOAD_CONTAINER);
            if (!dropArea) return;
            dropArea.classList.remove('highlight');
            dropArea.style.borderColor = 'rgba(108, 99, 255, 0.3)';
            dropArea.style.backgroundColor = '';
        },

        handleDrop: function(e) {
            const fileInput = getElement(SELECTORS.IMAGE_INPUT);
            if (!fileInput) return;

            const dt = e.dataTransfer;
            const files = dt.files;

            // 驗證檔案類型
            if (files[0] && !files[0].type.startsWith('image/')) {
                showMessage("只能拖放圖片檔案");
                return;
            }

            fileInput.files = files;

            // 觸發 change 事件
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, dragDropHandlers.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, dragDropHandlers.highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, dragDropHandlers.unhighlight, false);
    });

    dropArea.addEventListener('drop', dragDropHandlers.handleDrop, false);
}
