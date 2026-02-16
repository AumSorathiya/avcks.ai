# 🎯 AVCKS: Automated Virtual Command Kernel System

![AVCKS Banner](https://img.shields.io/badge/Status-Active-crimson?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Built%20With-HTML5%20%7C%20CSS3%20%7C%20JS-orange?style=for-the-badge)
![AI Mode](https://img.shields.io/badge/AI-Google%20Gemini%20Powered-blueviolet?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.1.0--STABLE-green?style=for-the-badge)

**AVCKS** is a high-fidelity, cinematic AI assistant interface designed for the ultimate Command Center experience. Built with pure Vanilla JavaScript and advanced browser APIs, it provides a robust, local-first intelligence layer with a stunning tactical HUD and voice-controlled interface.

---

## ✨ Key Features

### 🛡️ Biometric Security Layer
- **Live Face Scan**: Simulated biometric identification using the Webcam API
- **Identity Verification**: Multi-spectral biometric sweep for user authentication
- **Visual Feedback**: Real-time scanning overlay with status indicators

### 🧠 Intelligent Neural System
- **Advanced Context Resolution**: Manages a resolution stack for pronouns ("it", "that", "them") and maintains conversational flow.
- **Multi-Intent Handling**: Process complex, multi-step commands sequentially (e.g., "Open Spotify and set volume to 50%").
- **Structured JSON Architecture**: Every system response follows a strict `{ reply, intents[] }` schema for high technical transparency.
- **Implicit Learning**: Captures facts organically during conversation.
  - Example: "Remember the wifi password is 12345"
- **Custom Training**: Create personalized shortcuts and macros.
  - Example: "Shortcut morning run open my portfolio then weather in London"
- **Google Gemini Integration**: Advanced AI responses for complex queries.
- **Fallback Intelligence**: Automatic Google/Bing search when local intents or AI link fail.

### 🎨 Command Hub Dashboard
- **Visual App Launcher**: Quick access to all personal projects and tools
- **Categorized Interface**: Organized by Personal Projects and System & Web
- **One-Click Access**: Launch apps with voice or click
- **Includes**:
  - 🎨 Portfolio
  - 📋 Todo List (FocusFlow)
  - 🆔 Digital ID
  - 💸 Payment Tracker
  - 💬 Chat App
  - 📈 Profit Calculator
  - 📧 Email, Google, YouTube

### 🛰️ Immersive HUD Interface
- **Matrix Visualization**: Real-time digital rain and particle effects
- **Rotating AR Rings**: Dynamic visual feedback
- **Live System Metrics**: CPU, Memory, Network status
- **Cinematic Boot Sequence**: Diagnostic terminal with audio feedback
- **Multiple Themes**: Amber, Cyan, Crimson, Matrix

### 🔊 Advanced Audio System
- **Synthesized SFX**: Pure Web Audio API (no external files)
- **UI Interaction Sounds**: Button clicks, notifications, alerts
- **Voice Interface**: 
  - Speech-to-Text (STT) for voice commands
  - Text-to-Speech (TTS) for responses
  - Adjustable voice speed (50-200%)
  - Multiple voice options

### 🌐 Web Integration
- **In-App Browser**: Search results rendered in tactical overlay
- **Smart App Launcher**: Opens system apps via search-ms protocol
- **Website Quick Access**: Voice-activated web navigation
- **Weather Integration**: Real-time weather via Open-Meteo API

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ES6+ Modules)
- **Styling**: Tactical CSS3 with Mesh Gradients
- **Visuals**: HTML5 Canvas & Particle Systems
- **Audio**: Web Audio API Synthesizer
- **Speech**: Web Speech API (STT/TTS)
- **AI**: Google Gemini API Integration
- **Storage**: LocalStorage for persistence

---

## 📥 Installation & Setup

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/avcks.git
   cd avcks.ai-1
   ```

2. **Open the interface**:
   - Simply open `index.html` in any modern web browser
   - Chrome, Edge, or Brave recommended for best compatibility

3. **Grant Permissions**:
   - Allow microphone access for voice commands
   - Allow camera access for biometric scan feature

### Optional: Configure Google Gemini AI
For advanced AI responses, set up a Google Gemini API key:

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In AVCKS, say: **"Set API key YOUR_KEY_HERE"**
3. The system will confirm: "API Key registered. Neural link established."

---

## 🎮 Command Reference

### 🎯 Device & App Control
- **"Open [app]"** / **"Go home"**
- **"Turn [on/off] [wi-fi/bluetooth]"**
- **"Set volume to [0-100]"**
- **"Reboot device"** / **"Lock screen"**

### 💻 Windows & OS Control (UWL)
- **"Open [folder] folder"** (Downloads, Documents, Pictures, etc.)
- **"Open [wifi/bluetooth/battery] settings"**
- **"Open [terminal/calculator/cmd]"**
- **"Search my files for [query]"**

### 📞 Productivity & Communication
- **"Call [contact]"** (on speaker)
- **"Send a message to [contact] saying [text]"**
- **"Email [to] with subject [subject] and say [body]"**
- **"Set an alarm for [time]"** / **"Set a timer for [X] minutes"**
- **"Add [item] to my [name] list"**

### 🌐 Info & Web
- **"Weather in [city]"** / **"Weather tomorrow"**
- **"Take me to [place]"** / **"Find [POI] near me"**
- **"Who is [query]"** / **"Search [query]"**

### 🏠 Smart Home
- **"Turn [on/off] the [device] in the [location]"**
- **"Set [group] lights to [0-100]%"**
- **"Set [location] thermostat to [temp]"**

### 📝 Text & UI
- **"Dictate [text]"**
- **"Scroll [up/down/to top]"**
- **"Tap on [element name]"**

### ⚙️ System & Customization
- **"Change theme to [theme]"**
- **"Boost visuals"** / **"Ambient mode"**
- **"Shortcut [trigger] run [sequence]"**
- **"Export conversation"** / **"Clear terminal"**

---

## 📋 File Structure

```
avcks.ai-1/
├── index.html              # Main application entry point
├── README.md               # This file
├── COMMANDS.txt            # Complete command reference manual
├── Suggestion.txt          # Development suggestions
├── css/
│   └── style.css          # Tactical UI styling
├── js/
│   ├── app.js             # Main application controller
│   └── modules/
│       ├── Core.js        # Event system & logging
│       ├── Brain.js       # Intent matching & processing
│       ├── Commands.js    # Command execution module
│       ├── CommandHub.js  # Visual app launcher
│       ├── SimpleCommander.js  # Quick command overrides
│       ├── Intelligence.js     # Google Gemini integration
│       ├── Memory.js      # Local storage & facts
│       ├── Voice.js       # STT/TTS engine
│       ├── Terminal.js    # Terminal UI
│       ├── Visualizer.js  # Canvas visualizations
│       ├── AudioService.js     # Sound effects
│       └── AppLauncher.js      # System app bridge
└── assets/                # Images and resources
```

---

## 💡 Usage Tips

1. **Natural Language**: AVCKS understands variations
   - "Hey AVCKS" or "Hello" both work
   - "Open YouTube" or "Launch youtube.com" both work

2. **Fallback AI**: If command not recognized:
   - First tries Google Gemini AI (if configured)
   - Falls back to Google search

3. **Persistence**: All data stored locally
   - Theme preferences
   - User profile
   - Custom shortcuts
   - Remembered facts

4. **Voice Activation**: 
   - Click microphone icon to start
   - Grant microphone permissions
   - Works best in quiet environments

5. **Shortcuts**: Create complex sequences
   - Example: "Shortcut morning run open my portfolio then weather in London"
   - Trigger with: "morning"

---

## 🔧 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Voice Commands | ✅ | ✅ | ⚠️ | ⚠️ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Canvas Visuals | ✅ | ✅ | ✅ | ✅ |
| Web Audio | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Chrome or Edge for full Web Speech API support

---

## 🎯 Roadmap

- [ ] Mobile app version (PWA)
- [ ] Multi-language support
- [ ] Custom wake word detection
- [ ] Plugin system for extensions
- [ ] Cloud sync for settings
- [ ] Advanced gesture controls

---

## 🐛 Troubleshooting

### Voice Commands Not Working
- Ensure microphone permissions are granted
- Check browser compatibility (Chrome/Edge recommended)
- Verify microphone is not muted
- Try refreshing the page

### Biometric Scan Not Starting
- Grant camera permissions
- Ensure camera is not in use by another app
- Check browser console for errors

### AI Responses Not Working
- Verify Google Gemini API key is set
- Check internet connection
- Ensure API key has proper permissions

---

## 📜 Development Notes

AVCKS was engineered to demonstrate the power of modern Browser APIs without external frameworks. The system is designed to be:

- **Offline-First**: Most features work without internet
- **Privacy-Focused**: All data stored locally
- **Framework-Free**: Pure vanilla JavaScript
- **Modular**: Easy to extend and customize
- **Performant**: Optimized for smooth 60fps animations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Support

For detailed command reference, see **[COMMANDS.txt](./COMMANDS.txt)**

For issues or feature requests, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Open-Meteo for weather data
- Web Speech API community
- All contributors and testers

---

<div align="center">

**"Efficiency through Intelligence."**

*AVCKS Core Utility v2.1.0-STABLE*

Made with ❤️ by [Aum Sorathiya](https://aumsorathiya.github.io/Aum-Sorathiya/)

</div>
