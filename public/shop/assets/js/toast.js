/**
 * Toast Notification System
 * Modern, reusable toast notifications inspired by top SaaS products
 */

class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.innerHTML = `
            <div class="toast-icon" style="color: ${colors[type]}; font-size: 20px;">
                ${icons[type]}
            </div>
            <div class="toast-content" style="flex: 1;">
                <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 500;">${message}</p>
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toast.style.cssText = `
            background: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(450px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 4px solid ${colors[type]};
            min-width: 320px;
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeBtn.addEventListener('click', () => this.hide(toast));

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    }

    hide(toast) {
        toast.style.transform = 'translateX(450px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

// Create global toast instance
window.toast = new Toast();
