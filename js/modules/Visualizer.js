import { Core } from './Core.js';

export class VisualizerModule {
    constructor() {
        this.canvas = document.getElementById('audio-visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.state = 'idle';

        window.addEventListener('resize', () => this.resize());
        Core.on('voice-state', (s) => this.state = s);
        Core.on('speak', () => this.state = 'speaking');
        Core.on('visualizer-boost', () => {
            this.state = 'boost';
            setTimeout(() => this.state = 'idle', 5000);
        });

        this.frameCount = 0;
        this.particles = [];
        this.initParticles();
        this.loop();
    }

    resize() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.offsetWidth;
            this.canvas.height = this.canvas.parentElement.offsetHeight;
        }
    }

    initParticles() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: 0,
                y: 0,
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 100, // Distance from center
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.2,
                alpha: Math.random()
            });
        }
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.frameCount++;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        this.ctx.clearRect(0, 0, w, h);

        // State & Colors
        let config = {
            baseR: 110, amp: 5, color: '#00f3ff', speed: 0.02
        };

        switch (this.state) {
            case 'listening':
                config = { baseR: 110, amp: 20, color: '#ff003c', speed: 0.05 };
                break;
            case 'speaking':
                config = { baseR: 115, amp: 35, color: '#00f3ff', speed: 0.08 };
                break;
            case 'typing':
                config = { baseR: 110, amp: 10, color: '#00ff00', speed: 0.04 };
                break;
            case 'boost':
                config = { baseR: 120, amp: 60, color: '#f39c12', speed: 0.1 };
                break;
        }

        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = config.color;

        // --- LAYER 1: ROTATING TECH RINGS ---
        const rings = 3;
        for (let i = 0; i < rings; i++) {
            const r = config.baseR + (i * 12);
            const segments = 4 + i * 2;
            const arcLen = (Math.PI * 2) / segments;
            const dir = i % 2 === 0 ? 1 : -1;

            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(this.frameCount * config.speed * 0.2 * dir);
            this.ctx.strokeStyle = `rgba(${this.hexToRgb(config.color)}, 0.4)`;
            this.ctx.lineWidth = 2;

            for (let s = 0; s < segments; s++) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, r, s * arcLen, s * arcLen + arcLen * 0.6);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }

        // --- LAYER 2: RADIAL FREQUENCY BARS ---
        const bars = 60;
        const step = (Math.PI * 2) / bars;

        this.ctx.fillStyle = config.color;

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(-this.frameCount * 0.005); // Slow counter-rotate

        for (let i = 0; i < bars; i++) {
            // Simulated Audio Freq
            const time = this.frameCount * config.speed;
            const noise = Math.abs(Math.sin(i * 0.2 + time)) * Math.abs(Math.cos(i * 0.1 - time));
            const h = 5 + (noise * config.amp);

            this.ctx.save();
            this.ctx.rotate(i * step);
            // Draw bar at outer edge of rings
            this.ctx.fillRect(config.baseR + 35, -2, h, 4);

            // Mirror bar inside for depth (optional, keeping clean for now)
            this.ctx.restore();
        }
        this.ctx.restore();

        // --- LAYER 3: PARTICLES ---
        this.particles.forEach(p => {
            // Move particle outward
            p.radius += p.speed + (config.amp * 0.05);
            // Reset if too far
            if (p.radius > config.baseR + 80) {
                p.radius = config.baseR - 20; // Respawn near core
                p.alpha = 0;
            }
            // Fade in
            if (p.alpha < 1) p.alpha += 0.02;

            const px = cx + Math.cos(p.angle) * p.radius;
            const py = cy + Math.sin(p.angle) * p.radius;

            this.ctx.fillStyle = `rgba(${this.hexToRgb(config.color)}, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Spin particles slowly
            p.angle += 0.002 * (this.state === 'speaking' ? 5 : 1);
        });
    }

    hexToRgb(hex) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    }
}
