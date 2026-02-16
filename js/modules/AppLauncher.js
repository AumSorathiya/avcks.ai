export const LocalApps = {
    // --- USER CONFIGURATION AREA ---
    'calculator': 'ms-calculator:',
    'notepad': 'ms-notepad:',
    'paint': 'ms-paint:',
    'chrome': 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'spotify': 'spotify:',
    'discord': 'discord:',
    'vscode': 'vscode:',
    'code': 'vscode:',
    'word': 'ms-word:',
    'excel': 'ms-excel:',
    'powerpoint': 'ms-powerpoint:',
    'settings': 'ms-settings:home',
    'wifi': 'ms-settings:network-wifi',
    'bluetooth': 'ms-settings:bluetooth',
    'display': 'ms-settings:display',
    'sound': 'ms-settings:sound',
    'battery': 'ms-settings:batterysaver',
    'update': 'ms-settings:windowsupdate',
    'windows': 'ms-settings:windowsupdate',
    'network': 'ms-settings:network-status',
    'personalization': 'ms-settings:personalization',
    'downloads': 'downloads',
    'documents': 'documents',
    'pictures': 'pictures',
    'videos': 'videos',
    'desktop': 'desktop',
    'music': 'music',
    'weather_app': 'bingweather:',
    'maps': 'bingmaps:',
    'photos': 'ms-photos:',
    'store': 'ms-windows-store:',
    'terminal': 'wt:',
    'cmd': 'cmd:',
};

export class AppLauncher {
    static async launch(appName) {
        if (!appName) return null;
        let target = LocalApps[appName.toLowerCase().trim()];
        const command = target || appName;

        console.log(`[AppLauncher] Protocol Trigger: ${command}`);

        // RTE-06 Fix: Use custom trigger method to avoid page navigation
        this.triggerProtocol(`avcks://${encodeURIComponent(command)}`);

        return `DEEP_LINK_TRIGGERED: ${command}`;
    }

    /**
     * Trigger a custom protocol without navigating the main page.
     * Uses a hidden iframe which is the most robust cross-browser method.
     */
    static triggerProtocol(url) {
        let iframe = document.getElementById('protocol-handler-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'protocol-handler-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = url;
    }
}
