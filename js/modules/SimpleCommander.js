import { Core } from './Core.js';

export class SimpleCommander {
    static process(message) {
        const msg = message.toLowerCase().trim();

        // --- 1. SYSTEM OVERRIDES & DASHBOARD ---
        if (msg.includes('open hub') || msg.includes('open dashboard') || msg.includes('show menu')) {
            Core.emit('open-hub');
            return true;
        }

        if (msg.includes('hey') || msg.includes('hello')) {
            this.speak("Hello Sir, How May I Help You?");
            return true;
        }

        // --- 2. PERSONAL DRIVE TOOLS ---
        else if (msg.includes("open my portfolio")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/Aum-Sorathiya/");
            this.speak("Opening your portfolio...");
            return true;
        }
        else if (msg.includes("open todo list")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/FocusFlow/");
            this.speak("Opening your todo list...");
            return true;
        }
        else if (msg.includes("open my id")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/myid.github.io/");
            this.speak("Opening your id...");
            return true;
        }
        else if (msg.includes("open payment tracker")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/Payment-Tracker/");
            this.speak("Opening Payment Tracker...");
            return true;
        }
        else if (msg.includes("open my chat app")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/avcks-web-chat/");
            this.speak("Opening your chat app...");
            return true;
        }
        else if (/\b(what'?s? the )?time\b/i.test(msg) && !msg.includes('timer')) {
            const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
            this.speak("The current time is " + time);
            return true;
        }
        else if (/\b(what'?s? the |today'?s? )?date\b/i.test(msg) && !msg.includes('update')) {
            const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
            this.speak("Today's date is " + date);
            return true;
        }
        else if (msg.includes("open profit calculator")) {
            Core.emit('open-popup', "https://aumsorathiya.github.io/Profit-calculator/");
            this.speak("Opening Profit Calculator...");
            return true;
        }
        return false; // Very important: Let Brain.js handle other system commands

    }

    static speak(text) {
        Core.emit('log', { source: 'System', message: text, type: 'system' });
        Core.emit('speak', text);
    }
}
