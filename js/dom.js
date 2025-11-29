/**
 * DOM 操作模組
 */

import { CONFIG } from './config.js';

let activeMessage = null; // 單例訊息元素

/**
 * 安全地取得 DOM 元素
 * @param {string} selector - CSS 選擇器
 * @returns {HTMLElement|null}
 */
export function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

/**
 * 元素動畫
 * @param {HTMLElement} element - 要添加動畫的元素
 * @param {string} animationName - 動畫名稱
 */
export function animateElement(element, animationName) {
    if (!element) return;
    element.classList.add(animationName);
    setTimeout(() => {
        element.classList.remove(animationName);
    }, 500);
}

/**
 * 震動動畫
 * @param {HTMLElement} element - 要添加動畫的元素
 */
export function animateShake(element) {
    if (!element) return;
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

/**
 * 顯示訊息提示框（單例模式）
 * @param {string} message - 要顯示的訊息
 */
export function showMessage(message) {
    // 清理舊訊息
    if (activeMessage) {
        if (document.body.contains(activeMessage)) {
            document.body.removeChild(activeMessage);
        }
        activeMessage = null;
    }

    // 建立新訊息
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    const icon = document.createElement('i');
    icon.className = 'fas fa-info-circle';
    messageElement.appendChild(icon);
    messageElement.appendChild(document.createTextNode(` ${message}`));

    document.body.appendChild(messageElement);
    activeMessage = messageElement;

    // 定時移除
    setTimeout(() => {
        if (activeMessage === messageElement) {
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.5s, transform 0.5s';
            messageElement.style.transform = 'translateY(-20px) translateX(-50%)';

            setTimeout(() => {
                if (document.body.contains(messageElement)) {
                    document.body.removeChild(messageElement);
                }
                if (activeMessage === messageElement) {
                    activeMessage = null;
                }
            }, CONFIG.MESSAGE_FADE_DURATION);
        }
    }, CONFIG.MESSAGE_DURATION);
}

/**
 * 添加動畫CSS
 */
export function addAnimationStyles() {
    // 檢查是否已有動畫定義
    if (document.getElementById('dynamic-animations')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'dynamic-animations';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .pulse {
            animation: pulse 0.5s ease;
        }

        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }

        .shake {
            animation: shake 0.5s ease;
        }

        .processing {
            position: relative;
            overflow: hidden;
        }

        .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            width: 0;
            transition: width 0.3s ease;
        }

        .highlight {
            animation: highlight 2s infinite;
        }

        @keyframes highlight {
            0% { border-color: rgba(108, 99, 255, 0.3); }
            50% { border-color: rgba(108, 99, 255, 0.8); }
            100% { border-color: rgba(108, 99, 255, 0.3); }
        }

        @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
        }

        @keyframes appear {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .appear {
            animation: appear 0.5s ease forwards;
        }

        .size-badge {
            display: inline-block;
            background-color: rgba(108, 99, 255, 0.1);
            color: #6C63FF;
            padding: 2px 8px;
            margin-left: 8px;
            border-radius: 10px;
            font-size: 0.85em;
        }

        @media (prefers-color-scheme: dark) {
            .size-badge {
                background-color: rgba(139, 128, 255, 0.2);
                color: #8B80FF;
            }
        }
    `;

    document.head.appendChild(style);
}
