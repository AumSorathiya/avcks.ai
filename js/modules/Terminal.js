import { Core } from './Core.js';

export class TerminalModule {
    constructor() {
        this.logEl = document.getElementById('terminal-log');
        this.inputEl = document.getElementById('cmd-input');
        this.micBtn = document.getElementById('mic-toggle');
        this.helpBtn = document.getElementById('help-btn');
        this.suggestionsEl = document.getElementById('suggestions');
        this.commandHistory = JSON.parse(localStorage.getItem('avcks_history') || '[]');
        this.historyIndex = this.commandHistory.length;
        this.availableCommands = [
            'check weather', 'stop listening', 'mute audio', 'boost visuals',
            'remember that', 'what is', 'biometric scan', 'clear terminal',
            'export conversation', 'show system health', 'lock context',
            'ambient mode', 'focus mode',
            '/weather', '/todo add', '/todo list', '/todo done',
            '/note add', '/note list', '/help'
        ];

        this.minBtn = document.querySelector('.hud-footer .win-btn.minimize');
        this.maxBtn = document.querySelector('.hud-footer .win-btn.maximize');
        this.footer = document.querySelector('.hud-footer');

        this.init();
    }

    init() {
        // Event Listeners
        this.inputEl.addEventListener('keydown', (e) => this.handleInput(e));
        this.inputEl.addEventListener('input', () => this.showSuggestions());
        this.micBtn.addEventListener('click', () => this.toggleMic());
        this.helpBtn.addEventListener('click', () => Core.emit('command', 'help'));

        this.minBtn.addEventListener('click', () => this.toggleMinimize());
        this.maxBtn.addEventListener('click', () => this.toggleMaximize());

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!this.inputEl.contains(e.target) && !this.suggestionsEl.contains(e.target)) {
                this.hideSuggestions();
            }
        });

        // Global Hotkeys
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P or F1 for Palette
            if ((e.ctrlKey && e.shiftKey && e.code === 'KeyP') || e.code === 'F1') {
                e.preventDefault();
                this.togglePalette();
            }
            // Ctrl+Space to Focus
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                this.inputEl.focus();
                Core.emit('sfx', 'interact');
            }
            // Esc to Blur / Close Palette
            if (e.key === 'Escape') {
                this.inputEl.blur();
                this.hideSuggestions();
                this.closePalette();
            }
        });

        // Palette Input Handling
        const paletteInput = document.getElementById('palette-input');
        if (paletteInput) {
            paletteInput.addEventListener('input', (e) => this.filterPalette(e.target.value));
            paletteInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const selected = document.querySelector('.palette-item.selected');
                    if (selected) selected.click();
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigatePalette(e.key === 'ArrowDown' ? 1 : -1);
                }
            });
        }

        // Core Events
        Core.on('log', (data) => this.addLog(data.message, data.type));
        Core.on('clear-terminal', () => this.clear());
        Core.on('voice-input', (text) => {
            this.addLog(`> ${text}`, 'user');
            Core.emit('command', text);
            this.saveHistory(text);
        });

        Core.on('voice-state', (state) => {
            this.micBtn.classList.toggle('active', state === 'listening');
            this.micBtn.innerText = state === 'listening' ? '🔴' : '🎤';
        });
    }

    handleInput(e) {
        // Emit typing state for visualizer
        Core.emit('voice-state', 'typing');

        // Clear typing state after delay
        if (this.typingTimer) clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            Core.emit('voice-state', 'idle');
        }, 1000);

        if (e.key === 'Enter') {
            const cmd = this.inputEl.value.trim();
            if (cmd) {
                this.addLog(`> ${cmd}`, 'user');
                Core.emit('command', cmd);
                this.saveHistory(cmd);
                this.inputEl.value = '';
                this.hideSuggestions();
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const firstSug = this.suggestionsEl.querySelector('.suggestion-item');
            if (firstSug) firstSug.click();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.inputEl.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.inputEl.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.inputEl.value = '';
            }
        }
    }

    toggleMic() {
        if (Core.state.isActive) {
            Core.emit('stop-voice'); // Handled by Main or Voice
        } else {
            Core.emit('start-voice');
        }
    }

    saveHistory(cmd) {
        if (this.commandHistory[this.commandHistory.length - 1] !== cmd) {
            this.commandHistory.push(cmd);
            if (this.commandHistory.length > 50) this.commandHistory.shift();
            localStorage.setItem('avcks_history', JSON.stringify(this.commandHistory));
        }
        this.historyIndex = this.commandHistory.length;
    }

    showSuggestions() {
        const val = this.inputEl.value.toLowerCase();
        this.suggestionsEl.innerHTML = '';

        if (!val) {
            this.hideSuggestions();
            return;
        }

        const matches = this.availableCommands.filter(c => c.includes(val));

        if (matches.length > 0) {
            matches.forEach(m => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerText = m;
                item.onclick = () => {
                    this.inputEl.value = m;
                    this.hideSuggestions();
                    this.inputEl.focus();
                };
                this.suggestionsEl.appendChild(item);
            });
            this.suggestionsEl.classList.remove('hidden');
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.suggestionsEl.classList.add('hidden');
    }

    clear() {
        this.logEl.innerHTML = '<div class="log-line system">Terminal data purged.</div>';
    }

    addLog(text, type = 'system', structured = null) {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;

        if (type === 'system') {
            line.innerHTML = `<span class="system-msg">${text}</span><span class="terminal-cursor">_</span>`;

            // If structured data is provided, append as a code block
            if (structured) {
                const jsonBlock = document.createElement('pre');
                jsonBlock.className = 'json-intent';
                jsonBlock.innerText = JSON.stringify(structured, null, 2);
                line.appendChild(jsonBlock);
            }
        } else {
            line.innerText = text;
        }

        this.logEl.appendChild(line);
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }


    toggleMinimize() {
        this.footer.classList.toggle('terminal-minimized');
        this.footer.classList.remove('terminal-maximized');
    }

    toggleMaximize() {
        this.footer.classList.toggle('terminal-maximized');
        this.footer.classList.remove('terminal-minimized');
    }

    // Command Palette Methods
    togglePalette() {
        const palette = document.getElementById('command-palette');
        if (!palette) {
            console.warn('Command palette element not found in DOM');
            return;
        }
        palette.classList.toggle('hidden');
        if (!palette.classList.contains('hidden')) {
            const paletteInput = document.getElementById('palette-input');
            if (paletteInput) {
                paletteInput.focus();
                paletteInput.value = '';
                this.filterPalette('');
            }
        }
    }

    filterPalette(query) {
        const paletteList = document.getElementById('palette-list');
        if (!paletteList) return;

        const items = paletteList.querySelectorAll('.palette-item');
        const q = query.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(q)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Auto-select first visible item
        const firstVisible = paletteList.querySelector('.palette-item:not(.hidden)');
        items.forEach(i => i.classList.remove('selected'));
        if (firstVisible) firstVisible.classList.add('selected');
    }

    navigatePalette(direction) {
        const paletteList = document.getElementById('palette-list');
        if (!paletteList) return;

        const items = Array.from(paletteList.querySelectorAll('.palette-item:not(.hidden)'));
        const selected = paletteList.querySelector('.palette-item.selected');

        if (items.length === 0) return;

        let currentIndex = selected ? items.indexOf(selected) : -1;
        let newIndex = currentIndex + direction;

        // Wrap around
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        items.forEach(i => i.classList.remove('selected'));
        items[newIndex].classList.add('selected');
        items[newIndex].scrollIntoView({ block: 'nearest' });
    }

    closePalette() {
        const palette = document.getElementById('command-palette');
        if (palette) {
            palette.classList.add('hidden');
        }
    }
}
