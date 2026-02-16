import { Core } from './Core.js';

export class CommandHub {
    constructor() {
        this.hubEl = document.getElementById('command-hub');
        this.gridEl = document.getElementById('hub-grid');
        this.categories = [
            {
                name: "Personal Projects",
                apps: [
                    { id: 'portfolio', label: 'Portfolio', icon: '🎨', url: 'https://aumsorathiya.github.io/Aum-Sorathiya/' },
                    { id: 'todo', label: 'Todo List', icon: '📋', url: 'https://aumsorathiya.github.io/FocusFlow/' },
                    { id: 'myid', label: 'My ID', icon: '🆔', url: 'https://aumsorathiya.github.io/myid.github.io/' },
                    { id: 'payment', label: 'Payment Tracker', icon: '💸', url: 'https://aumsorathiya.github.io/Payment-Tracker/' },
                    { id: 'chat', label: 'Chat App', icon: '💬', url: 'https://aumsorathiya.github.io/avcks-web-chat/' },
                    { id: 'profit', label: 'Profit Calc', icon: '📈', url: 'https://aumsorathiya.github.io/Profit-calculator/' }
                ]
            },
            {
                name: "System & Web",
                apps: [
                    { id: 'mail', label: 'My Email', icon: '📧', url: 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox' },
                    { id: 'google', label: 'Google', icon: '🔍', url: 'https://google.com' },
                    { id: 'youtube', label: 'YouTube', icon: '📺', url: 'https://youtube.com' },
                    { id: 'profile', label: 'My Profile', icon: '👤', action: () => Core.emit('open-profile-settings') }
                ]
            }
        ];
        this.init();
    }

    init() {
        this.render();
        Core.on('open-hub', () => this.show());
    }

    render() {
        this.gridEl.innerHTML = '';
        this.categories.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'hub-section';
            section.innerHTML = `<h3>${cat.name}</h3>`;

            const grid = document.createElement('div');
            grid.className = 'hub-category-grid';

            cat.apps.forEach(app => {
                const item = document.createElement('div');
                item.className = 'hub-item';
                item.innerHTML = `
                    <span class="hub-icon">${app.icon}</span>
                    <span class="hub-label">${app.label}</span>
                `;
                item.onclick = () => {
                    if (app.action) {
                        app.action();
                    } else if (app.url) {
                        Core.emit('open-popup', app.url);
                    } else if (app.protocol) {
                        window.location.assign(app.protocol);
                    }
                    this.hide();
                };
                grid.appendChild(item);
            });

            section.appendChild(grid);
            this.gridEl.appendChild(section);
        });
    }

    show() {
        this.hubEl.classList.remove('hidden');
        Core.log('System', 'Navigating to Command Hub...');
        Core.emit('speak', "Command Hub online. Accessing system shortcuts.");
    }

    hide() {
        this.hubEl.classList.add('hidden');
    }
}
