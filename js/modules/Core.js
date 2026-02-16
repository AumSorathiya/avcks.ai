/**
 * Core.js
 * Central Event Bus and State Management
 */

class CoreSystem {
    constructor() {
        this.events = {};
        this.state = {
            isActive: false,
            isMuted: false,
            userLocation: null
        };
    }

    // Event Bus
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }

    // Utility
    log(source, message, type = 'info') {
        this.emit('log', { source, message, type });
        console.log(`[${source}] ${message}`);
    }
}

export const Core = new CoreSystem();
