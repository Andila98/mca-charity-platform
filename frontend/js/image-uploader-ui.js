/**
 * Image Uploader UI
 * Manages image upload UI and interactions
 */
class ImageUploaderUI {
    constructor(authService, imageManager) {
        this.authService = authService;
        this.imageManager = imageManager;
        this.pageName = getCurrentPageName(); // Auto-detect page
        this.fileToUpload = null;
    }

    /**
     * Initialize uploader
     */
    init() {
        this.setupEventListeners();
        if (this.authService.isAuthenticated()) {
            this.loadPageImages();
        }
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        const dropZone = document.getElementById('imageDropZone');
        if (dropZone) {
            dropZone.addEventListener('click', () => document.getElementById('imageFileInput').click());
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        const fileInput = document.getElementById('imageFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
    }

    async handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect({ target: { files } });
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        this.showImageUploadModal(files[0]);
    }

    showImageUploadModal(file) {
        const modal = document.getElementById('imageUploadModal');
        if (!modal) return;

        this.fileToUpload = file;

        document.getElementById('imageFileName').textContent = file.name;
        document.getElementById('imageFileSize').textContent = this.formatFileSize(file.size);

        const fileInfoBox = document.getElementById('fileInfoBox');
        if(fileInfoBox) fileInfoBox.style.display = 'flex';

        document.getElementById('imageKeyInput').value = '';
        document.getElementById('imageAltTextInput').value = '';
        document.getElementById('imageDescriptionInput').value = '';

        const progress = document.getElementById('uploadProgressBar');
        if(progress) progress.style.display = 'none';
        const success = document.getElementById('uploadSuccessMessage');
        if(success) success.style.display = 'none';

        modal.classList.add('active');
        document.getElementById('imageKeyInput').focus();
    }

    closeUploadModal() {
        const modal = document.getElementById('imageUploadModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.fileToUpload = null;
    }

    async confirmUpload() {
        if (!this.authService.isAuthenticated()) {
            alert('❌ Please login first');
            return;
        }

        if (!this.fileToUpload) {
            alert('⚠️ No file selected for upload.');
            return;
        }

        const imageKey = document.getElementById('imageKeyInput').value.trim();
        const altText = document.getElementById('imageAltTextInput').value.trim();
        const description = document.getElementById('imageDescriptionInput').value.trim();

        if (!imageKey) {
            alert('⚠️ Please enter an image key');
            return;
        }

        const progressBar = document.getElementById('uploadProgressBar');
        const progressFill = document.getElementById('uploadProgressFill');
        const progressText = document.getElementById('uploadProgressText');
        const uploadButton = document.querySelector('#imageUploadModal .btn-upload');

        try {
            if(progressBar) progressBar.style.display = 'block';
            if(progressText) progressText.textContent = 'Starting upload...';
            uploadButton.disabled = true;
            uploadButton.textContent = 'Uploading...';

            await this.imageManager.uploadImage(
                this.fileToUpload,
                imageKey,
                this.pageName,
                altText,
                description,
                (percent) => {
                    if(progressFill) progressFill.style.width = `${percent}%`;
                    if(progressText) progressText.textContent = `Uploading... ${Math.round(percent)}%`;
                }
            );

            this.showUploadSuccess(imageKey);
            setTimeout(() => {
                this.closeUploadModal();
                this.loadPageImages();
            }, 1500);

        } catch (error) {
            alert(`❌ Upload failed: ${error.message}`);
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = '⬆️ Upload';
        }
    }

    async loadPageImages() {
        try {
            console.log(`📥 Loading images for page: ${this.pageName}`);
            const images = await this.imageManager.getPageImages(this.pageName);
            this.displayImages(images);
            const stats = await this.imageManager.getStorageStats();
            if (stats) {
                const countEl = document.getElementById('imageCount');
                const usageEl = document.getElementById('storageUsage');
                if(countEl) countEl.textContent = `${stats.totalImages} images`;
                if(usageEl) usageEl.textContent = `${this.formatFileSize(stats.totalSize)} used`;
            }
        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    displayImages(images) {
        const gallery = document.getElementById('imageGallery');
        if (!gallery) return;

        gallery.innerHTML = '';

        if (images.length === 0) {
            gallery.innerHTML = '<p class="no-images">No images yet. Upload one to get started!</p>';
            return;
        }

        images.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card';
            imageCard.innerHTML = `
                <div class="image-preview">
                    <img src="${image.fileUrl}" alt="${image.altText || image.imageName}" loading="lazy">
                    <div class="image-actions">
                        <button onclick="deleteImageByKey('${image.imageKey}')" class="btn-delete" title="Delete">🗑️</button>
                        <button onclick="editImageMetadata('${image.imageKey}')" class="btn-edit" title="Edit">✏️</button>
                    </div>
                </div>
                <div class="image-info">
                    <h4>${image.imageName}</h4>
                    <p class="image-key">Key: ${image.imageKey}</p>
                    <p class="image-size">${this.formatFileSize(image.fileSize)}</p>
                    <p class="image-alt">${image.altText || '(no alt text)'}</p>
                </div>
            `;
            gallery.appendChild(imageCard);
        });
    }

    showUploadSuccess(imageKey) {
        const message = document.getElementById('uploadSuccessMessage');
        if (message) {
            message.textContent = `✅ Image uploaded successfully: ${imageKey}`;
            message.style.display = 'block';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ============================================================
// GLOBAL INITIALIZATION & HELPERS
// ============================================================

let imageManager;
let imageUploaderUI;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof adminAPI === 'undefined' || typeof adminAuthService === 'undefined') {
        console.error('CRITICAL: Core services not found. Check script loading order.');
        return;
    }

    imageManager = new ImageManager(adminAPI);
    imageUploaderUI = new ImageUploaderUI(adminAuthService, imageManager);

    // Initialize if auth status is known
    if(adminAuthService.isAuthenticated()) {
        imageUploaderUI.init();
    }

    window.imageManager = imageManager;
    window.imageUploaderUI = imageUploaderUI;

    console.log('🚀 Image management system initialized for multi-page support.');
});

// ============================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================

function openImageUploadModal() {
    const modal = document.getElementById('imageUploadModal');
    if(modal) {
        const fileInput = document.getElementById('imageFileInput');
        fileInput.value = '';
        const fileInfoBox = document.getElementById('fileInfoBox');
        if(fileInfoBox) fileInfoBox.style.display = 'none';
        modal.classList.add('active');
    }
}

function closeImageUploadModal() {
    if (imageUploaderUI) {
        imageUploaderUI.closeUploadModal();
    }
}

async function confirmImageUpload() {
    if (imageUploaderUI) {
        await imageUploaderUI.confirmUpload();
    }
}

async function deleteImageByKey(imageKey) {
    if (!confirm(`Delete image: ${imageKey}? This cannot be undone.`)) {
        return;
    }

    try {
        await imageManager.deleteImage(imageKey);
        alert('✅ Image deleted');
        if (imageUploaderUI) {
            await imageUploaderUI.loadPageImages();
        }
    } catch (error) {
        alert(`❌ Delete failed: ${error.message}`);
    }
}

async function editImageMetadata(imageKey) {
    const currentAlt = prompt('Enter new alt text:');
    if (currentAlt === null) return;

    try {
        await imageManager.updateImageMetadata(imageKey, currentAlt, null);
        alert('✅ Image metadata updated');
        if (imageUploaderUI) {
            await imageUploaderUI.loadPageImages();
        }
    } catch (error) {
        alert(`❌ Update failed: ${error.message}`);
    }
}
