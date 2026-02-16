import { Core } from './Core.js';

export class LoginModule {
    constructor() {
        this.overlay = document.getElementById('auth-overlay');
        this.input = document.getElementById('auth-code');
        this.submitBtn = document.getElementById('auth-submit');
        this.statusText = document.getElementById('auth-status-text');

        // Default passcode for demonstration (could be in ProfileModule)
        this.correctCode = "AVCKS-01";
        this.isAuthenticated = false;

        this.init();
    }

    init() {
        this.submitBtn.addEventListener('click', () => this.attemptLogin());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.attemptLogin();
        });

        // Auto-focus input
        if (this.overlay && !this.overlay.classList.contains('hidden')) {
            setTimeout(() => this.input.focus(), 1000);
        }

        Core.on('force-logout', () => this.logout());
    }

    async attemptLogin() {
        const value = this.input.value.trim().toUpperCase();

        if (!value) {
            this.updateStatus('INPUT_REQUIRED', 'error');
            return;
        }

        this.updateStatus('DECRYPTING_VAULT...', 'processing');
        this.submitBtn.disabled = true;

        // Visual delay for effect
        await new Promise(r => setTimeout(r, 1500));

        if (value === this.correctCode) {
            this.success();
        } else {
            this.fail();
        }
    }

    success() {
        this.isAuthenticated = true;
        this.updateStatus('ACCESS_GRANTED', 'success');
        this.overlay.classList.add('hidden');

        Core.log('Security', 'Biometric vault accessed. Identity confirmed.');
        Core.emit('login-success');

        // Emit for ProfileModule to finalize setup
        Core.emit('update-profile', { lastLogin: new Date().toLocaleString() });
    }

    fail() {
        this.updateStatus('ACCESS_DENIED_INVALID_CODE', 'error');
        this.input.value = '';
        this.submitBtn.disabled = false;
        this.input.focus();

        // Shake animation effect
        this.overlay.querySelector('.auth-card').classList.add('shake');
        setTimeout(() => {
            this.overlay.querySelector('.auth-card').classList.remove('shake');
        }, 500);

        Core.log('Security', 'Unauthorized access attempt blocked.', 'alert');
    }

    updateStatus(message, type) {
        this.statusText.textContent = message;
        this.statusText.style.color = type === 'error' ? 'var(--alert)' :
            type === 'success' ? 'var(--primary)' :
                'rgba(255,255,255,0.4)';
    }

    logout() {
        this.isAuthenticated = false;
        this.overlay.classList.remove('hidden');
        this.input.value = '';
        this.updateStatus('SESSION_TERMINATED', 'error');
        Core.log('System', 'Secure session closed.');
    }
}
