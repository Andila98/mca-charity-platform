/**
 * Modal Component
 * Reusable modal dialog
 */

const Modal = {
    /**
     * Show modal
     */
    show(options = {}) {
        const {
            title = 'Modal',
            content = '',
            buttons = [],
            size = 'medium', // small, medium, large
            closeButton = true,
            backdrop = true,
            onClose = null
        } = options;

        // Remove existing modal
        this.hide();

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.className = 'modal';

        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = '<div class="modal-footer">';
            buttons.forEach(button => {
                const btnClass = button.class || 'btn-secondary';
                const btnText = button.text || 'Button';
                const btnId = button.id || '';
                buttonsHtml += `<button class="btn ${btnClass}" id="${btnId}">${btnText}</button>`;
            });
            buttonsHtml += '</div>';
        }

        modal.innerHTML = `
            <div class="modal-backdrop ${backdrop ? '' : 'hidden'}"></div>
            <div class="modal-dialog modal-${size}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${closeButton ? '<button class="modal-close" id="modal-close-btn">×</button>' : ''}
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${buttonsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        if (closeButton) {
            document.getElementById('modal-close-btn').addEventListener('click', () => {
                this.hide();
                if (onClose) onClose();
            });
        }

        if (backdrop) {
            modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                this.hide();
                if (onClose) onClose();
            });
        }

        // Attach button click handlers
        buttons.forEach((button, index) => {
            if (button.id && button.onClick) {
                const btn = document.getElementById(button.id);
                if (btn) {
                    btn.addEventListener('click', button.onClick);
                }
            }
        });

        // Show modal
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';

        return modal;
    },

    /**
     * Hide modal
     */
    hide() {
        const modal = document.getElementById('app-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    },

    /**
     * Show confirm dialog
     */
    confirm(options = {}) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Yes',
            cancelText = 'No',
            onConfirm = null,
            onCancel = null
        } = options;

        return this.show({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    id: 'modal-cancel-btn',
                    text: cancelText,
                    class: 'btn-secondary',
                    onClick: () => {
                        this.hide();
                        if (onCancel) onCancel();
                    }
                },
                {
                    id: 'modal-confirm-btn',
                    text: confirmText,
                    class: 'btn-primary',
                    onClick: () => {
                        this.hide();
                        if (onConfirm) onConfirm();
                    }
                }
            ]
        });
    },

    /**
     * Show alert dialog
     */
    alert(options = {}) {
        const {
            title = 'Alert',
            message = '',
            buttonText = 'OK',
            onClose = null
        } = options;

        return this.show({
            title,
            content: `<p>${message}</p>`,
            buttons: [
                {
                    id: 'modal-ok-btn',
                    text: buttonText,
                    class: 'btn-primary',
                    onClick: () => {
                        this.hide();
                        if (onClose) onClose();
                    }
                }
            ]
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Modal };
}