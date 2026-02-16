import { Core } from './Core.js';
import { MemoryModule } from './Memory.js';
import { AppLauncher } from './AppLauncher.js';

export class CommandsModule {
    constructor() {
        this.memory = new MemoryModule();
        this.weatherApiKey = null;
    }

    execute(intent, data) {
        switch (intent) {
            // Device Control
            case 'OPEN_APP':
                const launchRes = AppLauncher.launch(data.app_name);
                return launchRes ? `Launching ${data.app_name.toUpperCase()}. Requesting secure protocol bridge...` : `Unable to bridge ${data.app_name}. Universal search triggered.`;
            case 'NAVIGATION': return `Executing navigation directive: ${data.action}.`;
            case 'TOGGLE_SETTING': return `Setting ${data.setting} toggle state is restricted. Platform bridge (Web) does not support native hardware control.`;
            case 'CHANGE_VOLUME':
                const volMsg = data.mode === 'ABSOLUTE' ? `to ${Math.round(data.level * 100)}%` : `by ${data.level > 0 ? '+' : ''}${Math.round(data.level * 100)}%`;
                return `Adjusting acoustic driver volume ${volMsg}. [Simulated]`;
            case 'SCREENSHOT': return "Optical buffer captured. Data saved to secure storage. [Simulated]";
            case 'LOCK_DEVICE': return "System lockdown engaged. Secure standby mode active. [Simulated]";
            case 'POWER_ACTION': return `Initiating system ${data.action.toLowerCase()} sequence is restricted in the web environment.`;

            // Productivity
            case 'CALL_CONTACT': return `Initiating secure voice bridge to ${data.contact}${data.options?.speaker ? ' on speaker' : ''}.`;
            case 'SEND_MESSAGE': return `Encrypting and transmitting data to ${data.contact}: "${data.text}"`;
            case 'READ_MESSAGES': return `Accessing secure messaging buffer. Scope: ${data.scope}.`;
            case 'CREATE_EMAIL': return `Drafting encrypted email to ${data.to}. Subject: ${data.subject}.`;
            case 'SET_ALARM': return `Temporal alert synchronized for ${data.time} ${data.date || 'today'}. [Simulated]`;
            case 'SET_TIMER':
            case 'SET_TIMER_SLASH':
                return this.setTimer(data.duration_seconds, data.label || 'General Timer');
            case 'SET_MODE': return this.setMode(data.mode);
            case 'CREATE_REMINDER': return `Data indexed. Reminder set for ${data.trigger?.time || 'later'}: ${data.text}.`;
            case 'CALENDAR_CREATE': return `Indexing event: ${data.title} at ${data.start_time}.`;
            case 'CALENDAR_QUERY': return `Scanning schedule for ${data.range}. Data link established.`;
            case 'LIST_ADD': return `Item cached in ${data.list_name} list: ${data.item}.`;

            // Notes
            case 'NOTE_CREATE':
                this.memory.addNote(data.text);
                return `Note saved: "${data.text}"`;
            case 'NOTE_LIST':
                const notes = this.memory.getNotes();
                if (notes.length === 0) return "You have no saved notes.";
                return notes.map((n, i) => `${i + 1}. ${n.text}`).join('\n');
            case 'NOTE_DELETE':
                if (this.memory.deleteNote(data.index)) return `Note #${data.index + 1} deleted.`;
                return `Note #${data.index + 1} not found.`;

            // Todos
            case 'TODO_ADD':
                this.memory.addTodo(data.text);
                return `Todo added: "${data.text}"`;
            case 'TODO_LIST':
                const todos = this.memory.getTodos();
                if (todos.length === 0) return "You have no active todos.";
                return todos.map((t, i) => `${i + 1}. [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');
            case 'TODO_DONE':
                const item = this.memory.completeTodo(data.index);
                if (item) return `Todo completed: "${item.text}"`;
                return `Todo #${data.index + 1} not found.`;

            // Info & Web
            case 'WEATHER_QUERY': return this.checkWeather(data.location, data.date);
            case 'NAVIGATE_TO': return `Mapping optimal trajectory to ${data.destination}. Engaging GPS link.`;
            case 'LOCAL_SEARCH': return `Scanning quadrant for ${data.query} (${data.category}) in ${data.location}.`;
            case 'GENERAL_QUERY': return this.searchWeb(data.query);

            // Media
            case 'PLAY_MUSIC': return `Streaming ${data.query} via ${data.provider || 'default driver'}.`;
            case 'MEDIA_CONTROL': return `Media signal adjusted: ${data.action}.`;
            case 'PLAY_VIDEO': return `Rendering ${data.query} on ${data.provider}.`;

            // Smart Home (The Grid)
            case 'HOME_DEVICE_TOGGLE': return `Grid command sent. ${data.device} in ${data.location} set to ${data.state}. [Demo Mock]`;
            case 'HOME_LIGHT_SET': return `Luminous intensity adjusted for ${data.device_or_group} to ${data.brightness || 'default'} (Color: ${data.color || 'auto'}). [Demo Mock]`;
            case 'HOME_LOCK': return `${data.device.toUpperCase()} status shifted to ${data.state}. [Demo Mock]`;
            case 'HOME_THERMOSTAT_SET': return `Thermal parameters for ${data.location} set to ${data.temperature_c_c || data.temperature_c}°C [${data.mode}]. [Demo Mock]`;
            case 'HOME_APPLIANCE_ACTION': return `Triggering ${data.action} for ${data.device} in ${data.location}. [Demo Mock]`;

            // Text & Assistant
            case 'DICTATE_TEXT': return `Input buffer updated with: "${data.text}"`;
            case 'SCROLL': return `Virtual viewpoint shifted ${data.direction} by ${data.amount}.`;
            case 'UI_TAP': return `Simulating interaction with: ${data.target_name}.`;
            // OS & System Control (UWL Bridge)
            case 'SYSTEM_OPEN_FOLDER': return this.openSystemFolder(data.folder);
            case 'SYSTEM_OPEN_SETTING': return this.openSystemSetting(data.setting);
            case 'SYSTEM_CMD': return AppLauncher.launch(data.tool) ? `Launching system tool: ${data.tool.toUpperCase()}.` : `Unable to bridge ${data.tool}.`;
            case 'SYSTEM_SEARCH':
                AppLauncher.triggerProtocol(`search-ms:query=${data.query}&subquery=${data.query}`);
                return `Searching system index for: ${data.query}.`;

            // Assistant Management
            case 'ASSISTANT_HELP': return this.showCommands();
            case 'ASSISTANT_STOP_LISTENING': return this.stopListening();
            case 'ASSISTANT_CANCEL': return "Active request terminated. Returning to base state.";

            // Legacy/Original
            case 'CLEAR_TERMINAL': return this.clearTerminal();
            case 'CHAMELEON_SHIFT': return this.changeTheme(data.theme);
            case 'BOOST_VISUALS': return this.boostVisuals();

            default: return "Directive received. Action parameters matched to system defaults.";
        }
    }

    setTimer(seconds, label = 'General') {
        if (!seconds || isNaN(seconds)) return "Invalid timer duration. Use format like '10s' or '5 minutes'.";

        const timerId = Date.now();
        const endTime = Date.now() + seconds * 1000;

        // Pass timerId to storeTimer so the same ID is used
        this.memory.storeTimer(endTime, label, timerId);

        const timeout = setTimeout(() => {
            Core.emit('speak', `Timer for ${label} expired.`);
            Core.emit('sfx', 'alarm');
            Core.emit('show-text-popup', `<h1>TIMER EXPIRED: ${label.toUpperCase()}</h1>`);
            this.memory.removeTimer(timerId);
        }, seconds * 1000);

        return `Countdown protocol engaged: ${seconds} seconds for ${label}. [ID: ${timerId}]`;
    }

    rehydrateTimers() {
        const timers = this.memory.getTimers();
        const now = Date.now();
        timers.forEach(t => {
            const remaining = t.endTime - now;
            if (remaining > 0) {
                setTimeout(() => {
                    Core.emit('speak', `Timer for ${t.label} expired.`);
                    Core.emit('show-text-popup', `<h1>TIMER EXPIRED: ${t.label.toUpperCase()}</h1>`);
                    this.memory.removeTimer(t.id);
                }, remaining);
            } else {
                this.memory.removeTimer(t.id);
            }
        });
    }

    setMode(mode) {
        mode = mode.toLowerCase();
        // Reset defaults
        Core.emit('focus-mode', false);
        Core.emit('ambient-mode', false);

        switch (mode) {
            case 'dev':
            case 'developer':
                Core.emit('focus-mode', true);
                Core.emit('open-popup', 'http://127.0.0.1:5500'); // Open localized dev view or similar
                this.changeTheme('matrix');
                return "Developer Mode engaged. Focus active. Matrix theme applied.";
            case 'chill':
            case 'relax':
                Core.emit('ambient-mode', true);
                Core.emit('open-popup', 'https://www.youtube.com/watch?v=jfKfPfyJRdk'); // Lofi girl
                this.changeTheme('cyan');
                return "Chill Mode engaged. Ambiance optimized. Audio stream active.";
            case 'work':
            case 'focus':
                Core.emit('focus-mode', true);
                const todos = this.memory.getTodos().map(t => t.text).join('<br>');
                Core.emit('show-text-popup', `<h3>Current Tasks</h3>${todos || 'No active tasks.'}`);
                return "Work Mode engaged. Priority tasks displayed.";
            default:
                return `Mode ${mode} not recognized. Systems nominal.`;
        }
    }


    async showCommands() {
        // Inline Help (Concise)
        const helpText = [
            "--- AVCKS COMMAND SYSTEM ---",
            "• /weather [city] - Check weather",
            "• /todo add [task] - Add a todo",
            "• /note add [text] - Save a note",
            "• /help - Show this list",
            "• Check [location] - Weather query",
            "• Remind me to [task] - Set reminder",
            "• Open [website] - Launch site",
            "• System Report - View stats"
        ].join('<br>');

        Core.emit('log', { source: 'System', message: helpText, type: 'system' });
        return "Command list loaded.";
    }

    async checkWeather(city, date = 'today') {
        Core.log('CMD', `Checking weather for ${city || 'local location'} on ${date}`);
        if (!city || city === 'current' || city === 'local') {
            city = localStorage.getItem('avcks_location') || localStorage.getItem('userLocation') || "London";
        }

        try {
            const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);

            if (!geo.ok) {
                throw new Error(`Geocoding API returned ${geo.status}`);
            }

            const geoData = await geo.json();

            if (!geoData.results || geoData.results.length === 0) {
                return `Unable to find location: ${city}. Please try a different city name.`;
            }

            const { latitude, longitude, name } = geoData.results[0];

            const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`);

            if (!weather.ok) {
                throw new Error(`Weather API returned ${weather.status}`);
            }

            const weatherData = await weather.json();

            if (!weatherData.current_weather) {
                throw new Error('Weather data unavailable');
            }

            const temp = Math.round(weatherData.current_weather.temperature);
            const desc = this.getWeatherDesc(weatherData.current_weather.weathercode);

            return `It is currently ${temp} degrees Celsius in ${name} (${date}). Conditions: ${desc}.`;
        } catch (error) {
            console.error('Weather check failed:', error);
            return `Weather data unavailable for ${city}. Error: ${error.message}`;
        }
    }

    getWeatherDesc(code) {
        // WMO Weather interpretation codes (1970)
        // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
        switch (code) {
            case 0: return "Clear sky";
            case 1: return "Mainly clear";
            case 2: return "Partly cloudy";
            case 3: return "Overcast";
            case 45: return "Fog";
            case 48: return "Depositing rime fog";
            case 51: return "Drizzle: Light";
            case 53: return "Drizzle: Moderate";
            case 55: return "Drizzle: Dense";
            case 56: return "Freezing Drizzle: Light";
            case 57: return "Freezing Drizzle: Dense";
            case 61: return "Rain: Slight";
            case 63: return "Rain: Moderate";
            case 65: return "Rain: Heavy";
            case 66: return "Freezing Rain: Light";
            case 67: return "Freezing Rain: Heavy";
            case 71: return "Snow fall: Slight";
            case 73: return "Snow fall: Moderate";
            case 75: return "Snow fall: Heavy";
            case 77: return "Snow grains";
            case 80: return "Rain showers: Slight";
            case 81: return "Rain showers: Moderate";
            case 82: return "Rain showers: Violent";
            case 85: return "Snow showers: Slight";
            case 86: return "Snow showers: Heavy";
            case 95: return "Thunderstorm: Slight or moderate";
            case 96: return "Thunderstorm with slight hail";
            case 99: return "Thunderstorm with heavy hail";
            default: return "Unknown conditions";
        }
    }

    openHub() {
        Core.emit('toggle-hub', true);
        return "Command Hub interface engaged.";
    }

    openWebsite(site) {
        const s = site.toLowerCase().trim();

        const shortcuts = {
            'portfolio': 'https://aumsorathiya.github.io/Aum-Sorathiya/',
            'my portfolio': 'https://aumsorathiya.github.io/Aum-Sorathiya/',
            'todo list': 'https://aumsorathiya.github.io/FocusFlow/',
            'focus flow': 'https://aumsorathiya.github.io/FocusFlow/',
            'my id': 'https://aumsorathiya.github.io/myid.github.io/',
            'payment tracker': 'https://aumsorathiya.github.io/Payment-Tracker/',
            'chat app': 'https://aumsorathiya.github.io/avcks-web-chat/',
            'my chat app': 'https://aumsorathiya.github.io/avcks-web-chat/',
            'profit calculator': 'https://aumsorathiya.github.io/Profit-calculator/',
            'youtube': 'https://youtube.com',
            'google': 'https://google.com'
        };

        if (shortcuts[s]) {
            Core.emit('open-popup', shortcuts[s]);
            return `Launching secure project link: ${s.toUpperCase()}`;
        }

        const launchResult = AppLauncher.launch(s);
        if (launchResult) {
            Core.log('System', `App Bridge confirmed. Requesting execution: ${s.toUpperCase()}`);
            return `Manual bridge triggered for "${s}". Native protocol [${launchResult}] engaged.`;
        }

        if (s.length > 2 && !s.includes('.')) {
            Core.log('System', `App [${s}] not found in manual bridge. Using universal search...`);
            window.location.assign(`search-ms:query=${s}&subquery=${s}`);
            return `Universal System Search triggered for "${s.toUpperCase()}".`;
        }

        let url = s.includes('.') ? s : `${s}.com`;
        if (!url.startsWith('http')) url = `https://${url}`;
        Core.emit('open-popup', url);
        return `External URL requested: ${url}`;
    }

    searchWeb(query) {
        const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        Core.emit('open-popup', url);
        return `Searching international datalinks for: ${query}. Engaging in-app viewer.`;
    }

    /* Standard Commands */
    stopListening() {
        Core.emit('stop-voice');
        return "Voice systems deactivated.";
    }

    clearTerminal() {
        Core.emit('clear-terminal');
        return "Purging local run data logs...";
    }

    changeTheme(theme) {
        const t = theme.toLowerCase().trim();
        const themes = {
            'amber': { primary: '#ff9d00', bg: '#080500' },
            'cyan': { primary: '#00f3ff', bg: '#000508' },
            'crimson': { primary: '#ff003c', bg: '#080002' },
            'matrix': { primary: '#00ff41', bg: '#000d00' }
        };

        if (themes[t]) {
            document.documentElement.style.setProperty('--primary', themes[t].primary);
            document.documentElement.style.setProperty('--bg-dark', themes[t].bg);
            document.documentElement.style.setProperty('--bg-deep', themes[t].bg);
            this.memory.set('theme', t);
            return `Chameleon protocol engaged. Theme shifted to ${t.toUpperCase()}.`;
        }
        return `Theme ${t} not found in secure database.`;
    }

    setVoiceSpeed(speed) {
        if (speed < 0.5 || speed > 2.0) return "Invalid frequency range for vocal synthesis.";
        this.memory.set('voice_speed', speed);
        return `Vocal throughput adjusted to ${Math.round(speed * 100)} percent.`;
    }

    addShortcut(trigger, sequence) {
        const shortcuts = JSON.parse(localStorage.getItem('avcks_shortcuts') || '{}');
        shortcuts[trigger] = sequence;
        localStorage.setItem('avcks_shortcuts', JSON.stringify(shortcuts));
        return `Macro recorded. Use "${trigger.toUpperCase()}" to trigger: ${sequence}.`;
    }

    setProfile(data) {
        const profile = this.memory.saveProfile(data);
        return `Identity updated. Welcome, ${profile.name || 'Commander'}.`;
    }

    muteAudio() {
        Core.emit('mute', true);
        return "Audio muted.";
    }

    biometricScan() {
        Core.emit('show-overlay', 'biometric');
        setTimeout(() => {
            const user = this.memory.getProfile().name || "Authorized Personnel";
            Core.emit('overlay-result', { status: 'success', user });
            Core.emit('log', { source: 'Security', message: `Identity confirmed: ${user}`, type: 'system' });
            Core.emit('speak', `Identification successful. Welcome, ${user}.`);
        }, 3000);
        return "Initiating multi-spectral biometric sweep...";
    }

    storeMemory(key, value) {
        this.memory.storeFact(key, value);
        return `I will remember that ${key} is ${value}.`;
    }

    recallMemory(key) {
        const val = this.memory.getFact(key);
        if (val) return `${key} is ${val}.`;
        return `I don't have data on ${key}.`;
    }

    openSystemFolder(folder) {
        // Use search-ms as a reliable bridge for system folders in browser
        const query = folder.toUpperCase();
        window.location.assign(`search-ms:query=${query}&subquery=${query}`);
        return `Requesting system folder access: ${query}.`;
    }

    openSystemSetting(setting) {
        const res = AppLauncher.launch(setting);
        if (res) return `Adjusting system parameters: Opening ${setting.toUpperCase()} settings.`;
        return `Unable to locate ${setting} protocol in system registry.`;
    }

    boostVisuals() {
        Core.emit('visualizer-boost');
        return "Visualizer amplitude increased. Optical feedback maximized.";
    }

    runSystemReport() {
        const report = [
            "--- AVCKS SYSTEM REPORT ---",
            `TIME: ${new Date().toLocaleTimeString()}`,
            "KERNEL: 2.1.0-STABLE (ADVANCED)",
            "NEURAL LINK: ACTIVE",
            `CPU LOAD: ${Math.floor(20 + Math.random() * 10)}%`,
            `MEMORY: ${Math.floor(400 + Math.random() * 200)}MB / 1024MB`,
            "STATUS: ALL SYSTEMS NOMINAL"
        ].join('\n');
        return report;
    }
}
