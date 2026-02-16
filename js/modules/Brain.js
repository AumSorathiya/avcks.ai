import { Core } from './Core.js';
import { CommandsModule } from './Commands.js';
import { IntelligenceModule } from './Intelligence.js';
import { SimpleCommander } from './SimpleCommander.js';

export class BrainModule {
    constructor() {
        this.commands = new CommandsModule();
        this.intel = new IntelligenceModule();
        this.errorMode = false;
        this.lockedContext = null;
        this.simplifierActive = false;
        this.intents = [
            // 8. OS & System Control (UWL Bridge)
            { id: 'SYSTEM_OPEN_FOLDER', regex: /(?:open|show) (?:my )?(downloads|documents|pictures|videos|desktop|music) folder/i, extract: (msg) => ({ folder: msg.match(/(?:open|show) (?:my )?(downloads|documents|pictures|videos|desktop|music)/i)[1].toLowerCase() }) },
            { id: 'SYSTEM_OPEN_SETTING', regex: /open (wifi|bluetooth|display|sound|battery|update|windows|network|personalization) settings/i, extract: (msg) => ({ setting: msg.match(/open (wifi|bluetooth|display|sound|battery|update|windows|network|personalization)/i)[1].toLowerCase() }) },
            { id: 'SYSTEM_CMD', regex: /open (terminal|command prompt|cmd|powershell)/i, extract: (msg) => ({ tool: msg.match(/open (terminal|command prompt|cmd|powershell)/i)[1].toLowerCase() }) },
            { id: 'SYSTEM_SEARCH', regex: /search (?:my )?files for (.+)/i, extract: (msg) => ({ query: msg.match(/search (?:my )?files for (.+)/i)[1] }) },

            // 1. Device & App Control
            // More specific: only match app names that don't contain "folder" or "settings" to avoid conflicts
            { id: 'OPEN_APP', regex: /(?:open|launch) (?!.*(?:folder|settings|hub|dashboard|menu))(.+)/i, extract: (msg) => ({ app_name: msg.match(/(?:open|launch) (.+)/i)[1] }) },
            { id: 'NAVIGATION', regex: /go (home|back)|show (notifications|recent apps|quick settings)/i, extract: (msg) => ({ action: msg.match(/go (home|back)|show (notifications|recent apps|quick settings)/i)[1] || msg.match(/go (home|back)|show (notifications|recent apps|quick settings)/i)[2] }) },

            // BUG-07 Fix: Add negative lookahead to prevent matching if "in room" is present, letting HOME_DEVICE_TOGGLE handle it
            { id: 'TOGGLE_SETTING', regex: /turn (on|off) (bluetooth|wi-fi|mobile data|flashlight|airplane mode)(?!\s+in\s+)/i, extract: (msg) => { const m = msg.match(/turn (on|off) (bluetooth|wi-fi|mobile data|flashlight|airplane mode)/i); return { setting: m[2], state: m[1] }; } },

            { id: 'CHANGE_VOLUME', regex: /(increase|decrease|set) volume(?: to (\d+))?/i, extract: (msg) => { const m = msg.match(/(increase|decrease|set) volume(?: to (\d+))?/i); return { mode: m[2] ? 'ABSOLUTE' : 'RELATIVE', level: m[2] ? parseInt(m[2]) / 100 : (m[1] === 'increase' ? 0.1 : -0.1) }; } },
            { id: 'SCREENSHOT', regex: /take a screenshot/i },
            { id: 'LOCK_DEVICE', regex: /lock the screen|lock device/i },
            { id: 'POWER_ACTION', regex: /(shut down|restart|reboot) (?:the )?device/i, extract: (msg) => ({ action: msg.match(/(shut down|restart|reboot)/i)[1].toUpperCase() }) },

            // 2. Communication & Productivity
            { id: 'CALL_CONTACT', regex: /call (.+)(?: on speaker)?/i, extract: (msg) => ({ contact: msg.match(/call (.+)(?: on speaker)?/i)[1], options: { speaker: msg.includes('speaker') } }) },
            { id: 'SEND_MESSAGE', regex: /send a message to (.+) saying (.+)|text (.+) (.+)/i, extract: (msg) => { const m = msg.match(/send a message to (.+) saying (.+)|text (.+) (.+)/i); return { contact: m[1] || m[3], text: m[2] || m[4] }; } },
            { id: 'READ_MESSAGES', regex: /read (my )?(new |recent )?messages/i, extract: (msg) => ({ scope: msg.includes('new') ? 'NEW' : 'RECENT' }) },
            { id: 'CREATE_EMAIL', regex: /email (.+) with subject (.+) and say (.+)/i, extract: (msg) => { const m = msg.match(/email (.+) with subject (.+) and say (.+)/i); return { to: m[1], subject: m[2], body: m[3] }; } },
            { id: 'SET_ALARM', regex: /set (?:an )?alarm for (.+)/i, extract: (msg) => ({ time: msg.match(/set (?:an )?alarm for (.+)/i)[1] }) },
            {
                id: 'SET_TIMER', regex: /(?:set|start) (?:a )?(?:timer|countdown) for (\d+) (minute|second|hour)s?(?: called (.+))?/i, extract: (msg) => {
                    const m = msg.match(/(?:set|start) (?:a )?(?:timer|countdown) for (\d+) (minute|second|hour)s?(?: called (.+))?/i);
                    let secs = parseInt(m[1]);
                    if (m[2] === 'minute') secs *= 60;
                    if (m[2] === 'hour') secs *= 3600;
                    return { duration_seconds: secs, label: m[3] || 'General' };
                }
            },
            { id: 'CREATE_REMINDER', regex: /remind me to (.+)(?: at (.+))?/i, extract: (msg) => { const m = msg.match(/remind me to (.+)(?: at (.+))?/i); return { text: m[1], trigger: { type: 'TIME', time: m[2] || 'later' } }; } },
            { id: 'CALENDAR_QUERY', regex: /what's on my calendar (.+)/i, extract: (msg) => ({ range: msg.match(/what's on my calendar (.+)/i)[1] }) },
            { id: 'CALENDAR_CREATE', regex: /add (.+) to my calendar at (.+)/i, extract: (msg) => ({ title: msg.match(/add (.+) to my calendar/i)[1], start_time: msg.match(/at (.+)/i)[1] }) },
            { id: 'LIST_ADD', regex: /add (.+) to my (.+) list/i, extract: (msg) => { const m = msg.match(/add (.+) to my (.+) list/i); return { item: m[1], list_name: m[2] }; } },

            // 4. Time & Modes
            {
                id: 'SET_TIMER_SLASH', regex: /^\/timer (\d+)(s|m|h)?/i, extract: (msg) => {
                    const m = msg.match(/^\/timer (\d+)(s|m|h)?/i);
                    let secs = parseInt(m[1]);
                    if (m[2] === 'm') secs *= 60;
                    if (m[2] === 'h') secs *= 3600;
                    return { duration_seconds: secs };
                }
            },
            { id: 'SET_MODE', regex: /(?:switch to|enable) (dev|chill|work) mode|^\/mode (dev|chill|work)/i, extract: (msg) => ({ mode: msg.match(/(?:switch to|enable) (dev|chill|work) mode|^\/mode (dev|chill|work)/i)[1] || msg.match(/(?:switch to|enable) (dev|chill|work) mode|^\/mode (dev|chill|work)/i)[2] }) },

            // Productivity: Notes & Todos (Slash & Natural)
            { id: 'NOTE_CREATE', regex: /(?:create|add|new) note[:\s]+(.+)|^\/note (?:add|new) (.+)/i, extract: (msg) => ({ text: msg.match(/(?:create|add|new) note[:\s]+(.+)|^\/note (?:add|new) (.+)/i)[1] || msg.match(/(?:create|add|new) note[:\s]+(.+)|^\/note (?:add|new) (.+)/i)[2] }) },
            { id: 'NOTE_LIST', regex: /(?:list|show|read) (?:my )?notes|^\/note list/i },
            { id: 'NOTE_DELETE', regex: /(?:delete|remove) note (\d+)|^\/note (?:delete|remove) (\d+)/i, extract: (msg) => ({ index: parseInt(msg.match(/\d+/)[0]) - 1 }) }, // 1-based index from user

            { id: 'TODO_ADD', regex: /(?:add|create) todo (.+)|^\/todo (?:add|new) (.+)/i, extract: (msg) => ({ text: msg.match(/(?:add|create) todo (.+)|^\/todo (?:add|new) (.+)/i)[1] || msg.match(/(?:add|create) todo (.+)|^\/todo (?:add|new) (.+)/i)[2] }) },
            { id: 'TODO_LIST', regex: /(?:list|show|read) (?:my )?todos?|^\/todo list/i },
            { id: 'TODO_DONE', regex: /(?:finish|complete|check|done) todo (\d+)|^\/todo (?:done|complete|finish) (\d+)/i, extract: (msg) => ({ index: parseInt(msg.match(/\d+/)[0]) - 1 }) },

            // 3. Information & Web Queries
            // More specific: require "check", "what's", or "show" before "weather" to avoid matching casual mentions
            { id: 'WEATHER_QUERY', regex: /(?:check|what'?s? the|show|get) weather(?: (?:in|for) (.+?))?(?: (?:today|tomorrow|on (.+)))?$/i, extract: (msg) => { const m = msg.match(/(?:check|what'?s? the|show|get) weather(?: (?:in|for) (.+?))?(?: (?:today|tomorrow|on (.+)))?$/i); return { location: m[1] || 'current', date: m[2] || 'today' }; } },
            { id: 'NAVIGATE_TO', regex: /take me (?:to )?(.+)|directions to (.+)/i, extract: (msg) => ({ destination: msg.match(/take me (?:to )?(.+)|directions to (.+)/i)[1] || msg.match(/take me (?:to )?(.+)|directions to (.+)/i)[2] }) },
            { id: 'LOCAL_SEARCH', regex: /find (.+) near me|where is the nearest (.+)/i, extract: (msg) => ({ query: msg.match(/find (.+) near me|where is the nearest (.+)/i)[1] || msg.match(/find (.+) near me|where is the nearest (.+)/i)[2], location: 'current', category: 'POI' }) },
            // Note: RECALL_FACT moved before GENERAL_QUERY to prevent shadowing
            { id: 'GENERAL_QUERY', regex: /who is (.+)|when was (.+)|how (do|does|did) (.+)/i, extract: (msg) => ({ text: msg }) },

            // 4. Media & Entertainment
            { id: 'PLAY_MUSIC', regex: /play (.+) on (youtube|spotify|soundcloud)/i, extract: (msg) => { const m = msg.match(/play (.+) on (youtube|spotify|soundcloud)/i); return { query: m[1], provider: m[2].toUpperCase() }; } },
            // More specific: only match music-related terms or songs, not generic "play" commands
            { id: 'PLAY_MUSIC_GENERIC', regex: /play (?:song|music|track|album|playlist|artist)?\s*(.+)/i, extract: (msg) => ({ query: msg.match(/play (?:song|music|track|album|playlist|artist)?\s*(.+)/i)[1], provider: 'DEFAULT' }) },
            { id: 'MEDIA_CONTROL', regex: /(pause|resume|stop|next song|previous song)/i, extract: (msg) => ({ action: msg.match(/(pause|resume|stop|next song|previous song)/i)[1].toUpperCase() }) },
            { id: 'PLAY_VIDEO', regex: /watch (.+) on (youtube|netflix)/i, extract: (msg) => { const m = msg.match(/watch (.+) on (youtube|netflix)/i); return { query: m[1], provider: m[2].toUpperCase() }; } },

            // 5. Smart Home Control
            { id: 'HOME_DEVICE_TOGGLE', regex: /turn (on|off) (?:the )?(.+) (?:in (?:the )?(.+))?/i, extract: (msg) => { const m = msg.match(/turn (on|off) (?:the )?(.+) (?:in (?:the )?(.+))?/i); return { state: m[1].toUpperCase(), device: m[2], location: m[3] || 'GENERAL' }; } },
            {
                id: 'HOME_LIGHT_SET', regex: /set (.+) lights to (\d+)%|make the (.+) lights (.+)/i, extract: (msg) => {
                    const m = msg.match(/set (.+) lights to (\d+)%|make the (.+) lights (.+)/i);
                    return { device_or_group: m[1] || m[3] || 'ALL', brightness: m[2] ? parseInt(m[2]) : null, color: m[4] || null };
                }
            },
            { id: 'HOME_THERMOSTAT_SET', regex: /set (?:the )?(.+) thermostat to (\d+)/i, extract: (msg) => { const m = msg.match(/set (?:the )?(.+) thermostat to (\d+)/i); return { location: m[1], temperature_c: parseInt(m[2]), mode: 'HEAT' }; } },

            // 6. Text Dictation & UI Control
            { id: 'DICTATE_TEXT', regex: /dictate (.+)/i, extract: (msg) => ({ text: msg.match(/dictate (.+)/i)[1] }) },
            { id: 'SCROLL', regex: /scroll (up|down|to top|to bottom)/i, extract: (msg) => ({ direction: msg.match(/scroll (up|down|to top|to bottom)/i)[1].toUpperCase(), amount: 'PAGE' }) },
            { id: 'UI_TAP', regex: /tap on (.+)/i, extract: (msg) => ({ target_name: msg.match(/tap on (.+)/i)[1] }) },

            // 7. Assistant Management
            { id: 'ASSISTANT_HELP', regex: /what can you do|show all commands|help/i },
            { id: 'PROFILE_INFO', regex: /who am i|show my profile|my details/i },
            { id: 'EDIT_PROFILE', regex: /edit profile|update profile|change profile/i },
            { id: 'ASSISTANT_STOP_LISTENING', regex: /stop listening|deactivate|go to sleep/i },
            { id: 'ASSISTANT_CANCEL', regex: /cancel|never mind|exit/i },

            // 8. Brain & Security (Bridging Gaps)
            { id: 'REMEMBER_FACT', regex: /remember (?:that )?(.+) is (.+)/i, extract: (msg) => { const m = msg.match(/remember (?:that )?(.+) is (.+)/i); return { key: m[1], value: m[2] }; } },
            { id: 'RECALL_FACT', regex: /(?:recall|retrieve) (.+)/i, extract: (msg) => ({ key: msg.match(/(?:recall|retrieve) (.+)/i)[1] }) },
            { id: 'BIOMETRIC_SCAN', regex: /start biometric scan|run security sweep/i },
            { id: 'SET_VOICE_SPEED', regex: /set voice speed to (\d+)(?: percent)?/i, extract: (msg) => ({ speed: parseInt(msg.match(/set voice speed to (\d+)/i)[1]) / 100 }) },
            {
                id: 'CHANGE_VOLUME_RELATIVE', regex: /(increase|decrease|lower|raise|turn up|turn down) (?:the |it )?(?:volume )?(a bit|a little|a lot)/i, extract: (msg) => {
                    const m = msg.match(/(increase|decrease|lower|raise|turn up|turn down) (?:the |it )?(?:volume )?(a bit|a little|a lot)/i);
                    const up = ['increase', 'raise', 'turn up'].includes(m[1]);
                    const amount = m[2].includes('lot') ? 0.3 : 0.1;
                    return { mode: 'RELATIVE', level: up ? amount : -amount };
                }
            }

        ];

        this.context = {
            lastIntent: null,
            lastData: null,
            lastEntity: null
        };

        // Offline Detection
        const updateOnlineStatus = () => {
            document.body.classList.toggle('offline', !navigator.onLine);
            Core.log('System', navigator.onLine ? 'Network link active.' : 'Operating in offline isolation.');
        };
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();

        // Onboarding Check
        if (!localStorage.getItem('avcks_onboarded')) {
            setTimeout(() => Core.emit('start-onboarding'), 2000);
        }

        Core.on('command', (msg) => this.process(msg));

        // Initial rehydration
        setTimeout(() => this.commands.rehydrateTimers(), 5000);
    }

    async process(message) {
        if (!message) return;

        const isSlash = message.startsWith('/');
        Core.log('Brain', `Incoming: ${message}`);
        Core.emit('voice-state', 'processing');

        // 1. Resolve Pronouns (it, that, there) - RTE-07 Fix: Preserve casing
        const resolvedMessage = this.resolveContext(message);

        // RTE-08 Fix: Try matching the WHOLE message first to avoid breaking natural language like "bread and butter"
        let collectedIntents = [];
        const fullMatchRes = await this.singleProcess(resolvedMessage, collectedIntents, true);

        if (fullMatchRes) {
            this.respond(fullMatchRes, collectedIntents);
        } else {
            // 2. Multi-intent Splitter - Only fallback to splitting if no full match
            const parts = resolvedMessage.split(/\s+and\s+|\s+then\s+/i).map(p => p.trim());
            let outputReplies = [];
            collectedIntents = [];

            if (parts.length > 1) {
                for (const part of parts) {
                    const processedPart = isSlash && !part.startsWith('/') ? '/' + part : part;
                    const res = await this.singleProcess(processedPart, collectedIntents);
                    if (res) {
                        outputReplies.push(res);
                        // For multi-intent, provide intermediate feedback
                        this.respond(res, [{ intent: 'CHAIN_SUB', parameters: { text: part } }]);
                        await new Promise(r => setTimeout(r, 800));
                    }
                }
            } else {
                // Single part, but fullMatchRes was null, so process normally (SimpleCommander or Fallback)
                const res = await this.singleProcess(resolvedMessage, collectedIntents);
                if (res) {
                    this.respond(res, collectedIntents);
                } else if (!isSlash) {
                    // SimpleCommander might have handled it (returning null from singleProcess)
                    // If everything returned null/false, fallback
                    const fallback = await this.fallback(message);
                    this.respond(fallback, [{ intent: 'FALLBACK', parameters: { text: message } }]);
                }
            }
        }

        Core.emit('voice-state', 'idle');
    }


    async singleProcess(text, intentList, directOnly = false) {
        // Check Shortcuts first
        const shortcut = this.checkShortcut(text);
        if (shortcut) {
            const shortcutParts = shortcut.split(/\s+then\s+/i);
            let lastRes = "";
            for (const sp of shortcutParts) {
                const res = await this.singleProcess(sp, intentList, true);
                if (res) lastRes = res;
            }
            return lastRes || "Command sequence executed.";
        }

        const intent = this.intents.find(i => i.regex.test(text));
        if (intent) {
            const data = intent.extract ? intent.extract(text) : {};

            const systemRes = await this.handleSystemIntents(intent.id, data);
            if (systemRes) {
                intentList.push({ intent: intent.id, parameters: data });
                return systemRes;
            }

            const response = await this.commands.execute(intent.id, data);
            if (response) {
                intentList.push({ intent: intent.id, parameters: data });
                this.updateContext(intent.id, data);
                return response;
            }
        }

        if (directOnly) return null;

        // Contextual volume handler for "lower it"
        if (text.match(/(increase|decrease|lower|raise|turn up|turn down) it/i)) {
            const level = text.match(/lot/i) ? 0.3 : 0.1;
            const up = text.match(/increase|raise|turn up/i);
            const data = { mode: 'RELATIVE', level: up ? level : -level };
            const response = await this.commands.execute('CHANGE_VOLUME', data);
            if (response) {
                intentList.push({ intent: 'CHANGE_VOLUME', parameters: data });
                return response;
            }
        }

        // Check SimpleCommander
        const simpleRes = SimpleCommander.process(text);
        if (simpleRes) return null; // SimpleCommander already spoke/logged

        // Fallback
        const fallbackRes = await this.fallback(text);
        intentList.push({ intent: 'GENERAL_QUERY', parameters: { query: text } });
        return fallbackRes;
    }

    resolveContext(message) {
        const pronouns = /\b(it|that|there|them|do it|he|she|him|her)\b/i;
        if (pronouns.test(message)) {
            const contextObj = this.context.lastEntity || this.context.lastApp || this.context.lastDevice || this.context.lastQuery || this.context.lastLocation;
            if (contextObj) {
                const resolved = message.replace(pronouns, contextObj);
                Core.log('Brain', `Resolved context: "${message}" -> "${resolved}"`);
                return resolved;
            }
        }
        return message;
    }

    updateContext(id, data) {
        if (data.app_name) this.context.lastApp = data.app_name;
        if (data.device) this.context.lastDevice = data.device;
        if (data.query) this.context.lastQuery = data.query;
        if (data.location) this.context.lastLocation = data.location;
        if (data.contact) this.context.lastEntity = data.contact;
        if (data.text && id === 'GENERAL_QUERY') this.context.lastQuery = data.text;

        const entityMatch = data.text?.match(/(who|what) is ([^?.]+)/i);
        if (entityMatch) this.context.lastEntity = entityMatch[2].trim();

        this.context.lastIntent = id;
    }

    checkShortcut(trigger) {
        const shortcuts = JSON.parse(localStorage.getItem('avcks_shortcuts') || '{}');
        return shortcuts[trigger.toLowerCase().trim()] || null;
    }

    async handleSystemIntents(id, data) {
        switch (id) {
            case 'SET_KEY':
                this.intel.setKey(data.key);
                return "API Key registered. Neural link established.";
            case 'ERROR_EXPLAINER':
                this.errorMode = !this.errorMode;
                return this.errorMode ? "Diagnostic transparency active." : "Standard logging restored.";
            case 'TOGGLE_SIMPLIFIER':
                this.simplifierActive = !this.simplifierActive;
                return this.simplifierActive ? "Simplifier mode engaged." : "Standard technical protocol restored.";
            case 'LOCK_CONTEXT':
                this.lockedContext = data.topic;
                return `Context locked to: ${data.topic.toUpperCase()}.`;
            case 'UNLOCK_CONTEXT':
                this.lockedContext = null;
                return "Directive priorities cleared.";
            case 'PROFILE_INFO':
                const p = window.Profile.data;
                return `Identity confirmed. You are ${p.userName} (${p.userRole}). Access Level: ${p.trustLevel}.`;
            case 'EDIT_PROFILE':
                Core.emit('open-profile-settings');
                return "User profile portal bypass established.";
            case 'REMEMBER_FACT':
                return this.commands.storeMemory(data.key, data.value);
            case 'RECALL_FACT':
                return this.commands.recallMemory(data.key);
            default:
                return null;
        }
    }


    async respond(text, intents) {
        if (!text) return;
        const payload = {
            reply: text,
            intents: intents || []
        };

        Core.emit('log', {
            source: 'System',
            message: payload.reply,
            type: 'system',
            structured: payload
        });

        Core.emit('speak', payload.reply);
    }



    async fallback(message) {
        Core.log('Brain', 'Local intent failed. Bridging to Neural AI...');

        const response = await this.intel.ask(message);
        if (response) {
            return response;
        } else if (message.toLowerCase().startsWith('what is') || message.toLowerCase().startsWith('who is')) {
            Core.emit('open-popup', `https://www.bing.com/search?q=${encodeURIComponent(message)}`);
            return `Searching the internet for ${message}.`;
        } else if (message.split(' ').length > 1) {
            Core.emit('open-popup', `https://www.bing.com/search?q=${encodeURIComponent(message)}`);
            return `Searching Bing for ${message}.`;
        } else {
            Core.emit('open-popup', `https://www.bing.com/search?q=${encodeURIComponent(message)}`);
            return "Neural link disconnected. Launching standard data search.";
        }
    }
}
