import { Core } from './Core.js';

export class AudioService {
    constructor() {
        this.enabled = localStorage.getItem('avcks_sfx') !== 'false';
        // Create single shared AudioContext to prevent browser limit crash
        this.audioCtx = null;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext not available:', e);
        }

        this.sounds = {
            click: this.createTone(800, 0.05, 'sine'),
            success: this.createTone(1200, 0.1, 'sine'),
            error: this.createTone(400, 0.15, 'square'),
            boot: this.createTone(600, 0.2, 'triangle'),
            scan: this.createTone(900, 0.5, 'sawtooth'),
            verify: this.createTone(1500, 0.1, 'sine'),
            save: this.createTone(1000, 0.2, 'sine')
        };
        this.init();
    }

    init() {
        Core.on('sfx', (type) => this.play(type));
        Core.on('play-sfx', (type) => this.play(type));
        Core.on('boot-complete', () => this.play('success'));
    }

    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled || !this.audioCtx) return;

            // Reuse the shared AudioContext instead of creating new ones
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + duration);
        };
    }

    play(type) {
        if (this.sounds[type]) {
            this.sounds[type]();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('avcks_sfx', this.enabled);
        Core.log('Audio', `SFX ${this.enabled ? 'enabled' : 'disabled'}`);
    }
}
