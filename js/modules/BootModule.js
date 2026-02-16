import { Core } from './Core.js';

export class BootModule {
    constructor() {
        this.overlay = document.getElementById('biometric-overlay'); // Reusing overlay for boot
        this.statusText = this.overlay.querySelector('.scan-status');
        this.userText = this.overlay.querySelector('.scan-user');
    }

    async start() {
        this.overlay.classList.remove('hidden');
        this.userText.innerText = "AVCKS v2.1 ARES";

        const sequence = [
            { text: "INITIALIZING KERNEL...", delay: 800 },
            { text: "LOADING NEURAL PATHWAYS...", delay: 600 },
            { text: "ESTABLISHING SECURE UPLINK...", delay: 1000 },
            { text: "DIAGNOSTIC COMPLETE.", delay: 500 },
            { text: "SYSTEM ONLINE.", delay: 800 }
        ];

        for (const step of sequence) {
            this.statusText.innerText = step.text;
            Core.log('Boot', step.text, 'system');
            Core.emit('sfx', 'boot');
            await new Promise(r => setTimeout(r, step.delay));
        }

        this.overlay.classList.add('hidden');

        // Personalization: Greeting
        const lastSession = localStorage.getItem('avcks_last_session');
        const user = window.Profile?.data?.userName || "Commander";
        const timeStr = lastSession ? new Date(lastSession).toLocaleString() : "First Run";

        const greeting = lastSession
            ? `Welcome back, ${user}. Last session was ${timeStr}. System systems are green.`
            : `Neural link established. System ARES online. Welcome, ${user}.`;

        Core.emit('speak', greeting);
        Core.emit('boot-complete');

        localStorage.setItem('avcks_last_session', new Date().toISOString());
    }
}
