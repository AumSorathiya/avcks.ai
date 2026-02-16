import { Core } from './Core.js';

export class HUDModule {
    constructor() {
        this.weatherTemp = document.getElementById('weather-temp');
        this.weatherDesc = document.getElementById('weather-desc');
        this.metricsBar = document.querySelector('#memory-widget .bar-fill');
        this.ramValue = document.getElementById('ram-value');
        this.statusInd = document.getElementById('sys-status');
        this.bioOverlay = document.getElementById('biometric-overlay');
        this.bioStatus = this.bioOverlay.querySelector('.scan-status');
        this.bioUser = this.bioOverlay.querySelector('.scan-user');

        this.searchPopup = document.getElementById('search-popup');
        this.searchWindow = this.searchPopup.querySelector('.search-window');
        this.searchFrame = document.getElementById('search-frame');
        this.searchDragHandle = document.getElementById('search-drag-handle');
        this.profileOverlay = document.getElementById('profile-overlay');
        this.profileWindow = document.getElementById('profile-window');
        this.scanOverlay = document.getElementById('scan-overlay');
        this.videoElement = null;

        this.init();
    }

    init() {
        // Update simulated metrics
        setInterval(() => this.updateMetrics(), 3000);

        // Listen for system status changes
        Core.on('voice-state', (state) => this.updateStatus(state));
        Core.on('ambient-mode', (active) => this.toggleAmbient(active));
        Core.on('focus-mode', (active) => this.toggleFocus(active));
        Core.on('start-onboarding', () => this.startTour());
        Core.on('show-overlay', (type) => this.showOverlay(type));
        Core.on('overlay-result', (data) => this.handleOverlayResult(data));
        Core.on('open-popup', (url) => this.openSearchPopup(url));
        Core.on('minimize-search', () => this.toggleMinimize());
        Core.on('maximize-search', () => this.toggleMaximize());

        Core.on('show-text-popup', (data) => this.showTextPopup(data));
        Core.on('open-profile-settings', () => this.openProfileSettings());

        document.getElementById('save-profile').addEventListener('click', () => this.saveProfile());

        this.makeDraggable(this.searchWindow, this.searchDragHandle);
        this.makeDraggable(document.getElementById('text-window'), document.getElementById('text-drag-handle'));
        this.makeDraggable(this.profileWindow, document.getElementById('profile-drag-handle'));

        // Initial online status
        this.updateStatus('online');

        // Profile UI Handlers
        document.getElementById('profile-toggle').addEventListener('click', () => this.openProfileSettings());

        // Identity Widget Loop
        this.updateProfileWidget();
        setInterval(() => this.updateProfileWidget(), 5000);
    }

    updateMetrics() {
        // Cycle between RAM, CPU, NET
        const metrics = ['RAM_USAGE', 'CPU_LOAD', 'NET_UPLINK'];
        const currentMetric = this.metricsIndex || 0;

        const type = metrics[currentMetric];
        let val = 0;

        if (type === 'RAM_USAGE') val = 30 + Math.random() * 10;
        if (type === 'CPU_LOAD') val = 10 + Math.random() * 40;
        if (type === 'NET_UPLINK') val = 50 + Math.random() * 50; // Fake percent of capacity

        // Update UI
        const widgetTitle = document.querySelector('#memory-widget .widget-title span:first-child');
        if (widgetTitle) widgetTitle.innerText = type;

        this.metricsBar.style.width = `${val}%`;
        if (this.ramValue) {
            this.ramValue.innerText = `${Math.floor(val)}%`;
        }

        // Increment for next loop
        this.metricsIndex = (currentMetric + 1) % metrics.length;
    }

    updateStatus(state) {
        const colors = {
            'offline': '#666',
            'online': '#00f3ff', // Default fallback
            'idle': '#00f3ff',   // Cyan for IDLE
            'processing': '#ff9d00', // Amber for PROCESSING
            'listening': '#ff003c',  // Crimson for LISTENING
            'speaking': '#00f3ff',
            'typing': '#00ff41'
        };

        let displayText = state.toUpperCase();
        if (state === 'online') displayText = 'IDLE'; // Remap online to IDLE
        if (state === 'idle') displayText = 'IDLE';

        this.statusInd.innerText = displayText;
        this.statusInd.style.color = colors[state] || colors.online;
    }

    toggleAmbient(active) {
        document.body.classList.toggle('ambient-mode', active);
        if (active) {
            Core.emit('speak', "Ambient mode engaged. Visuals stabilized.");
        }
    }

    toggleFocus(active) {
        document.getElementById('app-container').classList.toggle('focus-mode', active);
        if (active) {
            Core.emit('speak', "Focus filter active. Non-essential visuals dimmed.");
        }
    }

    async startTour() {
        const steps = [
            "Welcome to AVCKS v2.1.0. I am your system interface.",
            "To your left, the Terminal shows all system logs.",
            "You can type commands here, or use the microphone to speak.",
            "The central Visualizer reacts to your voice and system activity.",
            "System metrics and environment data are tracked on the right.",
            "Say 'Tell me a joke' or 'Check weather' to begin. Tour complete."
        ];

        for (const step of steps) {
            Core.log('Tour', step, 'system');
            Core.emit('speak', step);
            await new Promise(r => setTimeout(r, 4500));
        }
        localStorage.setItem('avcks_onboarded', 'true');
    }

    showOverlay(type) {
        if (type === 'biometric') {
            this.startBiometricScan();
        }
    }

    handleOverlayResult(data) {
        if (data.status === 'success') {
            this.bioStatus.innerText = "AUTHENTICATION SUCCESSFUL";
            this.bioUser.innerText = data.user.toUpperCase();
            setTimeout(() => {
                this.bioOverlay.classList.add('hidden');
            }, 3000);
        }
    }

    openSearchPopup(url) {
        this.currentUrl = url;
        this.searchFrame.src = url;
        this.searchPopup.classList.remove('hidden');
        this.searchWindow.classList.remove('minimized');
        Core.log('System', `Datalink established: ${url}`);
    }

    showTextPopup(text) {
        // Use textContent instead of innerHTML to prevent XSS
        document.getElementById('text-content').textContent = text;
        document.getElementById('text-popup').classList.remove('hidden');
        Core.log('System', 'Text content displayed in overlay.');
    }

    updateProfileWidget() {
        if (!window.Profile) return;
        const profile = window.Profile.data;

        // Add null checks to prevent crashes with corrupted/incomplete profile data
        if (!profile || !profile.userName || !profile.userRole) {
            console.warn('Profile data incomplete or corrupted');
            return;
        }

        document.getElementById('widget-name').innerText = profile.userName.toUpperCase();
        document.getElementById('widget-role').innerText = profile.userRole.toUpperCase();
        document.getElementById('widget-trust').innerText = profile.trustLevel || 'UNKNOWN';

        // Mock trust fill based on level
        let fill = "50%";
        const trustLevel = profile.trustLevel || '';
        if (trustLevel.includes('ALPHA')) fill = "85%";
        if (trustLevel.includes('OMEGA')) fill = "100%";
        if (trustLevel.includes('BETA')) fill = "30%";

        const fillEl = document.querySelector('.trust-fill');
        if (fillEl) fillEl.style.width = fill;
    }

    openExternal() {
        if (this.currentUrl) {
            window.open(this.currentUrl, '_blank');
        }
    }

    async openProfileSettings() {
        await this.startBiometricScan();

        // 2. Load Data
        const profile = window.Profile.data;
        document.getElementById('prof-name').value = profile.userName;
        document.getElementById('prof-role').value = profile.userRole;
        document.getElementById('prof-trust').value = profile.trustLevel || 'BETA-5';
        document.getElementById('prof-access').value = profile.systemAccess || 'USER_LEVEL';
        document.getElementById('prof-ai-personality').value = profile.preferences.aiPersonality;
        document.getElementById('prof-ai-tone').value = profile.preferences.tone;
        document.getElementById('sync-time').innerText = profile.lastSync || 'NEVER';

        this.profileOverlay.classList.remove('hidden');
    }

    async startBiometricScan() {
        this.scanOverlay.classList.remove('hidden');
        Core.emit('play-sfx', 'scan');

        try {
            // Check if getUserMedia is available (requires HTTPS or localhost)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not available (requires HTTPS or localhost)');
            }

            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.id = 'scan-video';
                this.videoElement.autoplay = true;
                this.videoElement.muted = true;
                this.scanOverlay.appendChild(this.videoElement);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = stream;
            this.videoElement.classList.add('active');
        } catch (e) {
            console.warn("Webcam access unavailable or denied. Falling back to simulation.", e.message);
            this.scanOverlay.classList.add('simulated-scan');
        }

        await new Promise(r => setTimeout(r, 3000));

        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.classList.remove('active');
        }

        this.scanOverlay.classList.add('hidden');
        this.scanOverlay.classList.remove('simulated-scan');
        Core.emit('play-sfx', 'verify');
    }

    saveProfile() {
        const newData = {
            userName: document.getElementById('prof-name').value,
            userRole: document.getElementById('prof-role').value,
            trustLevel: document.getElementById('prof-trust').value,
            systemAccess: document.getElementById('prof-access').value,
            preferences: {
                aiPersonality: document.getElementById('prof-ai-personality').value,
                tone: document.getElementById('prof-ai-tone').value
            }
        };
        Core.emit('update-profile', newData);
        this.profileOverlay.classList.add('hidden');
        Core.emit('play-sfx', 'save');
        Core.emit('speak', "Profile encryption complete. Neural identity verified.");
    }

    toggleMinimize(elId) {
        const el = elId ? document.getElementById(elId) : this.searchWindow;
        el.classList.toggle('minimized');
    }

    toggleMaximize(elId) {
        const el = elId ? document.getElementById(elId) : this.searchWindow;
        el.classList.toggle('maximized');
    }

    makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        // Find the associated iframe for this window (if any)
        const associatedFrame = element.querySelector('iframe');

        handle.onmousedown = (e) => {
            // Check if THIS element (not always searchWindow) is maximized
            if (element.classList.contains('maximized')) return;
            e = e || window.event;
            if (e.target.tagName === 'BUTTON') return;
            e.preventDefault();

            element.classList.add('dragging');
            // Disable pointer events on the associated iframe (if it exists)
            if (associatedFrame) {
                associatedFrame.style.pointerEvents = 'none';
            }

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = () => closeDragElement.call(this, element, associatedFrame);
            document.onmousemove = elementDrag;
        };

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement(el, frame) {
            el.classList.remove('dragging');
            // Re-enable pointer events on the associated iframe (if it exists)
            if (frame) {
                frame.style.pointerEvents = 'all';
            }
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}
