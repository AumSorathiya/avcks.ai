import { Core } from './Core.js';

export class VoiceModule {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.isMuted = false;
        this.preferredVoice = localStorage.getItem('avcks_preferred_voice') || '';
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Core.log('Voice', 'Speech API not supported.', 'error');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Manual restart is more reliable
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            Core.emit('voice-state', 'listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // Only switch state to idle if we aren't about to speak
            if (!this.synth.speaking) {
                Core.emit('voice-state', 'idle');
            }
            // Auto-restart loop
            if (Core.state.isActive) {
                setTimeout(() => this.start(), 100);
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.trim()) {
                Core.log('Voice', `Input: "${transcript}"`);
                Core.emit('voice-input', transcript);
            }
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech') return; // Ignore silence
            if (event.error === 'not-allowed') {
                Core.log('Voice', 'Microphone blocked.', 'error');
                Core.state.isActive = false;
            } else {
                console.warn('Voice Error:', event.error);
            }
        };

        // System Events
        Core.on('speak', (text) => this.speak(text));
        Core.on('mute', (state) => {
            this.isMuted = state;
            if (state) this.synth.cancel();
        });
        Core.on('start-voice', () => this.start());
        Core.on('stop-voice', () => this.stop());
        Core.on('change-voice', (name) => {
            this.preferredVoice = name;
            localStorage.setItem('avcks_preferred_voice', name);
        });
    }

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                Core.state.isActive = true;
            } catch (e) { /* Already started */ }
        }
    }

    stop() {
        if (this.recognition) {
            Core.state.isActive = false;
            this.recognition.stop();
        }
    }

    speak(text) {
        if (this.isMuted) return;
        this.synth.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = this.getVoice();

        // Use stored speed preference
        const savedSpeed = parseFloat(localStorage.getItem('avcks_voice_speed')) || 1.0;
        utter.rate = savedSpeed;
        utter.pitch = 1.0;

        utter.onstart = () => Core.emit('voice-state', 'speaking');
        utter.onend = () => {
            Core.emit('voice-state', 'idle');
            if (Core.state.isActive) this.start();
        };

        this.synth.speak(utter);
    }

    getVoice() {
        const voices = this.synth.getVoices();
        if (this.preferredVoice) {
            const v = voices.find(v => v.name.includes(this.preferredVoice));
            if (v) return v;
        }
        return voices.find(v => v.name.includes('Google US English') || v.name.includes('Zira')) || voices[0];
    }
}
