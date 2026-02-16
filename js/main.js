import { Core } from './modules/Core.js';
import { VoiceModule } from './modules/Voice.js';
import { TerminalModule } from './modules/Terminal.js';
import { VisualizerModule } from './modules/Visualizer.js';
import { BrainModule } from './modules/Brain.js';
import { HUDModule } from './modules/HUD.js';
import { CommandHub } from './modules/CommandHub.js';
import { BootModule } from './modules/BootModule.js';
import { AudioService } from './modules/AudioService.js';
import { ResizeService } from './modules/ResizeService.js';
import { ProfileModule } from './modules/ProfileModule.js';
import { LoginModule } from './modules/LoginModule.js';


// Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
    Core.log('System', 'Booting AVCKS v2.1.0...');

    try {
        window.Core = Core; // Global expose for HTML handlers
        window.Profile = new ProfileModule();
        window.AudioService = new AudioService();
        window.Voice = new VoiceModule();
        window.Terminal = new TerminalModule();
        window.Visualizer = new VisualizerModule();
        window.HUD = new HUDModule();
        window.CommandHub = new CommandHub();
        window.Boot = new BootModule();
        window.Brain = new BrainModule();
        window.ResizeService = new ResizeService();
        window.Login = new LoginModule();

        // Delay ARES Boot Sequence until Login Success
        Core.on('login-success', () => {
            window.Boot.start();
            Core.log('System', 'Engine v2.1 ARES ready.', 'system');
        });

        // If already authenticated (demo logic), start boot
        if (window.Login.isAuthenticated) {
            window.Boot.start();
        }


        // Auto-Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                    .then(res => res.json())
                    .then(data => {
                        const city = data.city || data.locality || "Unknown";
                        localStorage.setItem('userLocation', city);
                        Core.log('System', `Location locked: ${city}`);
                        document.getElementById('weather-desc').innerText = `LOC: ${city.toUpperCase()}`;

                        // Auto-fetch temp
                        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
                            .then(res => res.json())
                            .then(w => {
                                document.getElementById('weather-temp').innerText = `${Math.round(w.current_weather.temperature)}°`;
                            })
                            .catch(e => {
                                document.getElementById('weather-temp').innerText = "N/A";
                            });
                    })
                    .catch(e => {
                        document.getElementById('weather-desc').innerText = "N/A – OFFLINE";
                        document.getElementById('weather-temp').innerText = "N/A";
                    });
            }, (err) => {
                document.getElementById('weather-desc').innerText = "N/A – OFFLINE";
            });
        }

        // Clock
        setInterval(() => {
            document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        }, 1000);

    } catch (e) {
        console.error("Boot Error:", e);
        Core.log('System', `Critical Error: ${e.message}`, 'error');
    }
});
