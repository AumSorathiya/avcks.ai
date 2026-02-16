import { Core } from './Core.js';

export class ProfileModule {
    constructor() {
        this.data = JSON.parse(localStorage.getItem('avcks_profile') || JSON.stringify({
            userName: "Commander",
            userRole: "Lead Developer",
            trustLevel: "ALPHA-1",
            systemAccess: "ROOT_OVERRIDE",
            lastSync: new Date().toLocaleString(),
            preferences: {
                aiPersonality: "Technical",
                tone: "Formal"
            }
        }));
        this.init();
    }

    init() {
        Core.on('update-profile', (newData) => this.update(newData));
        Core.on('get-profile', (callback) => callback(this.data));
    }

    update(newData) {
        this.data = { ...this.data, ...newData, lastSync: new Date().toLocaleString() };
        localStorage.setItem('avcks_profile', JSON.stringify(this.data));
        Core.log('System', 'Bio-metric data synchronized.');
        Core.emit('profile-changed', this.data);
    }

    getProfileContext() {
        return `Current User: ${this.data.userName}. Role: ${this.data.userRole}. Trust: ${this.data.trustLevel}. Access: ${this.data.systemAccess}. Personality: ${this.data.preferences.aiPersonality}, ${this.data.preferences.tone} tone.`;
    }
}
