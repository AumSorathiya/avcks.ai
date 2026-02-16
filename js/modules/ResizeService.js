import { Core } from './Core.js';

export class ResizeService {
    constructor() {
        this.footer = document.querySelector('.hud-footer');
        this.handle = document.getElementById('resize-handle');
        this.isResizing = false;
        this.startY = 0;
        this.startHeight = 0;

        if (this.handle && this.footer) {
            this.init();
        } else {
            console.warn('[ResizeService] Elements not found, skipping init.');
        }
    }

    init() {
        // Mouse Events
        this.handle.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // Touch Events
        this.handle.addEventListener('touchstart', (e) => {
            // Prevent default to stop scrolling while dragging handle
            e.preventDefault();
            this.startResize(e.touches[0]);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.isResizing) {
                // Prevent scrolling while resizing
                e.preventDefault();
                this.resize(e.touches[0]);
            }
        }, { passive: false });

        document.addEventListener('touchend', () => this.stopResize());

        Core.log('System', 'ResizeService: Initialized.');
    }

    startResize(e) {
        this.isResizing = true;
        this.startY = e.clientY;
        this.startHeight = this.footer.offsetHeight;
        this.footer.classList.add('resizing');
    }

    resize(e) {
        if (!this.isResizing) return;

        // Calculate new height: dragging UP decreases Y, so (startY - currentY) is positive delta
        const deltaY = this.startY - e.clientY;
        const newHeight = this.startHeight + deltaY;

        // Apply constraints
        if (newHeight > 100 && newHeight < window.innerHeight - 100) {
            this.footer.style.height = `${newHeight}px`;
        }
    }

    stopResize() {
        this.isResizing = false;
        this.footer.classList.remove('resizing');
    }
}
