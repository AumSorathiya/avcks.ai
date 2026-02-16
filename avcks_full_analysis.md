# 🔬 AVCKS v2.1.0 — Full Project Analysis

Complete audit of all 17 JS modules, HTML, CSS, and supporting files.

---

## 📊 Project Overview

| Metric | Value |
|---|---|
| **Total Files** | 27 (17 JS modules, 3 CSS, 1 HTML, supporting files) |
| **Total JS LOC** | ~1,900 lines |
| **Architecture** | Modular ES6 with event bus (`Core.js`) |
| **Entry Point** | [index.html](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/index.html) → [main.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/main.js) |

---

## 🐛 PART 1: BUGS (Confirmed Issues)

### BUG-01: Duplicate `UI_TAP` Intent (Brain.js:96-97)
Lines 96 and 97 in [Brain.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Brain.js#L96-L97) have an exact duplicate intent definition for `UI_TAP`. The second one is completely redundant.

```diff
- { id: 'UI_TAP', regex: /tap on (.+)/i, extract: (msg) => ({ target_name: msg.match(/tap on (.+)/i)[1] }) },
-
- { id: 'UI_TAP', regex: /tap on (.+)/i, extract: (msg) => ({ target_name: msg.match(/tap on (.+)/i)[1] }) },
+ { id: 'UI_TAP', regex: /tap on (.+)/i, extract: (msg) => ({ target_name: msg.match(/tap on (.+)/i)[1] }) },
```

---

### BUG-02: Timer ID Mismatch (Commands.js:113-122 ↔ Memory.js:112-114)
In [Commands.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Commands.js#L110-L126), `setTimer()` creates `timerId = Date.now()` on line 114, then stores the timer on line 116 via `memory.storeTimer(endTime, label)`. But in [Memory.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Memory.js#L112-L116), `storeTimer()` generates **its own** `id: Date.now()`. These two `Date.now()` calls are microseconds apart, so the `timerId` used in `removeTimer(timerId)` on line 122 will **never match** the stored timer's `id`. Timers will never be properly cleaned up from localStorage.

> [!CAUTION]
> This causes timer data to accumulate in localStorage indefinitely, potentially causing performance degradation over time.

---

### BUG-03: `SYSTEM_OPEN_SETTING` Regex Too Restrictive (Brain.js:16)
The regex `open (wifi|bluetooth|...) accounts? settings` requires the word "accounts" (with optional `s`) after the setting name. This means simply saying "open wifi settings" will **never match**. The user must say "open wifi account settings" — which is unnatural.

```diff
- { id: 'SYSTEM_OPEN_SETTING', regex: /open (wifi|bluetooth|...) accounts? settings/i, ... }
+ { id: 'SYSTEM_OPEN_SETTING', regex: /open (wifi|bluetooth|...) settings/i, ... }
```

---

### BUG-04: `OPEN_APP` Regex Conflicts with Other Intents (Brain.js:21)
`OPEN_APP` uses `/(?:open|launch) (.+)/i` which is extremely greedy. It matches **any** "open X" command. This shadows more specific intents like `SYSTEM_OPEN_FOLDER` ("open downloads folder") because `OPEN_APP` is checked first if the system intent fails, or can conflict in multi-intent parsing. Additionally, "open hub" will trigger `OPEN_APP` instead of `SimpleCommander` because Brain's intent list is checked before SimpleCommander.

---

### BUG-05: `WEATHER_QUERY` Regex is Too Greedy (Brain.js:71)
The regex `/weather(?: in (.+))?(?: (.+))?/i` will match **any** message containing the word "weather" anywhere, even in unrelated sentences like "nice weather today". It also incorrectly captures the date parameter.

---

### BUG-06: `GENERAL_QUERY` Shadows `RECALL_FACT` (Brain.js:74 vs 108)
`GENERAL_QUERY` regex `/who is (.+)|what is (.+)|when was (.+)/i` matches on line 74, while `RECALL_FACT` regex `/(what is|recall) (.+)/i` is on line 108. Since intents are checked in order, "what is the wifi password" will always hit `GENERAL_QUERY` first and never reach `RECALL_FACT`. This means stored facts can never be recalled using natural language.

---

### BUG-07: `HOME_DEVICE_TOGGLE` Conflicts with `TOGGLE_SETTING` (Brain.js:23 vs 83)
Both intents match "turn on/off X" patterns. `TOGGLE_SETTING` on line 23 handles bluetooth/wifi etc., but `HOME_DEVICE_TOGGLE` on line 83 uses a much broader regex. The order prevents conflicts for now, but "turn on the bluetooth in the bedroom" would match `TOGGLE_SETTING` instead of `HOME_DEVICE_TOGGLE`.

---

### BUG-08: `SimpleCommander` time/date Match is Too Greedy (SimpleCommander.js:44,49)
`msg.includes('time')` matches any message containing "time" like "set timer for 5 minutes", "sometime", or "what time zone". Similarly `msg.includes('date')` matches "update" or "outdated". This causes false positives.

---

### BUG-09: Missing `togglePalette`, `filterPalette`, `navigatePalette`, `closePalette` Methods (Terminal.js)
The `handleInput` and `init` methods in [Terminal.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Terminal.js#L50-L77) call `this.togglePalette()`, `this.filterPalette()`, `this.navigatePalette()`, and `this.closePalette()`, but **none of these methods are defined** in the `TerminalModule` class.

> [!WARNING]
> Pressing F1 or Ctrl+Shift+P will throw a runtime error: `TypeError: this.togglePalette is not a function`.

---

### BUG-10: Draggable Events Reference Wrong Element (HUD.js:270,296-297)
In `makeDraggable()`, the check `this.searchWindow.classList.contains('maximized')` on line 270 and `this.searchFrame.style.pointerEvents` on lines 276 and 297 always reference the search popup's elements, even when dragging the **text** or **profile** window. This means dragging the profile window can incorrectly modify the search popup's pointer-events.

---

### BUG-11: `PLAY_MUSIC_GENERIC` Catches Everything After "play" (Brain.js:78)
The regex `/play (.+)/i` matches any message starting with "play", including non-music commands. It will also match before the more specific `PLAY_MUSIC` intent on line 77 if the message doesn't include a provider name.

---

### BUG-12: `auth-overlay` Not Hidden by Default (index.html:275)
The `auth-overlay` div does NOT have the `hidden` class, meaning it appears on page load. While this is likely intentional for login, it exists **outside** the `profile-overlay` div's closing tag (line 273) but **inside** the `profile-overlay`'s parent context, making the HTML structure confusing and potentially breaking CSS scoping.

---

### BUG-13: Hardcoded Default Weather City (Commands.js:196)
When no city is provided, it defaults to `"London"` instead of using the user's detected location from `localStorage.getItem('userLocation')`.

---

### BUG-14: `REMEMBER_FACT` Route Missing from `handleSystemIntents` (Brain.js:285-310)
The `REMEMBER_FACT` intent (line 107) and `RECALL_FACT` intent (line 108) are defined in the intents array but have **no case** in `handleSystemIntents()` and are also **not handled** in `Commands.js`'s `execute()` switch. The `storeMemory()` and `recallMemory()` methods exist in Commands.js but are never called.

> [!CAUTION]
> "Remember that X is Y" and "what is X" (recall) will always fall through to the default case, making the memory/facts system completely non-functional.

---

## ⚡ PART 2: RUNTIME ERRORS & RISKS

### RTE-01: AudioContext Leak (AudioService.js:28)
Every SFX call creates a **new AudioContext**. Browsers limit the number of concurrent AudioContexts (typically 6-8). During boot sequence alone, 5 tones play. Heavy usage will cause: `DOMException: Failed to construct 'AudioContext': Too many AudioContexts`.

**Fix:** Create one shared AudioContext in the constructor and reuse it.

---

### RTE-02: Profile Widget Crash on First Load (HUD.js:170-171)
`updateProfileWidget()` calls `profile.userName.toUpperCase()` and `profile.userRole.toUpperCase()`. If localStorage has corrupted or incomplete data where `userName` or `userRole` is `undefined`, this throws `TypeError: Cannot read properties of undefined (reading 'toUpperCase')`.

---

### RTE-03: `navigator.mediaDevices.getUserMedia` Undefined on HTTP (HUD.js:219)
`getUserMedia` is only available over HTTPS or localhost. On plain HTTP (e.g., from a file:// URL or HTTP server), it's undefined and will throw `TypeError: Cannot read properties of undefined (reading 'getUserMedia')`.

---

### RTE-04: Unhandled Promise Rejections (multiple files)
- [Intelligence.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Intelligence.js#L38): `data.candidates[0].content.parts[0].text` will throw if the API returns an error response without `candidates`.
- [Commands.js](file:///c:/Users/KAC-PC1/Desktop/Project%20AVCKS/T%2021/avcks.ai-1/js/modules/Commands.js#L199-L201): Weather API chain doesn't handle missing results gracefully.

---

### RTE-05: `eval()` Security Risk (Commands.js:395)
The `calculate()` method uses `eval()`. Even with the sanitization regex `/[^-()\d/*+.]/g`, this is a known attack vector. However, `calculate()` is never actually called from any intent, so it's dead code.

---

### RTE-06: `window.location.assign()` Navigates Away (Commands.js:93, AppLauncher.js:52)
Using `window.location.assign()` on system protocols like `search-ms:` or `avcks://` can cause the browser to navigate away from the app or show an error dialog. On hosted environments (GitHub Pages), these protocols will fail silently or show "page not found".

---

### RTE-07: `resolveContext` Lowercases Everything (Brain.js:253)
`resolveContext()` converts the entire message to lowercase on line 253: `let msg = message.toLowerCase()`. This means proper nouns, file paths, and case-sensitive data in commands are destroyed before processing.

---

### RTE-08: Multi-Intent Splitter Breaks Natural Language (Brain.js:163)
Splitting on `and` and `then` breaks commands like "search for bread and butter", "open Simon and Garfunkel on Spotify", or "set timer for cocktails and appetizers".

---

## 🔒 PART 3: SECURITY ISSUES

### SEC-01: API Key Exposed in Source Code (Intelligence.js:5)

> [!CAUTION]
> A **real Google Gemini API key** is hardcoded: `AIzaSyDQj2-IWZOjvCtdlynyjPi3zLuzNZAuMRU`. This is visible to anyone inspecting the page source or viewing the GitHub repository. It should be immediately revoked and replaced with a backend proxy.

### SEC-02: XSS via innerHTML (HUD.js:162, Terminal.js:196)
`showTextPopup()` sets `innerHTML` with unsanitized text. If any user-generated content reaches this path, it creates an XSS vulnerability. Similarly, Terminal.js uses innerHTML for system messages.

### SEC-03: Hardcoded Login Password (LoginModule.js:11)
The passcode `"AVCKS-01"` is visible in plain text in the source. Anyone inspecting DevTools can see it.

---

## 🧹 PART 4: CODE QUALITY ISSUES

| Issue | Location | Description |
|---|---|---|
| Dead code | `Commands.js:392-400` | `calculate()` method is never called |
| Dead code | `Commands.js:276-290` | `exportConversation()` is never called |
| Dead code | `Commands.js:311-321` | `toggleAmbient()` and `toggleFocus()` are never called from intents |
| Dead code | `Commands.js:402-405` | `changeVoice()` never called from any intent |
| Dead code | `Commands.js:329-333` | `setFontSize()` never called |
| Dead code | `Brain.js:351-355` | `extractCity()` is never called |
| Redundant URLs | `SimpleCommander.js` + `Commands.js:222-234` | Same project URLs duplicated in both files |
| No error boundary | `main.js:81-84` | Catch block only logs error, doesn't show user-friendly message |
| Missing `off()` | `Core.js` | No way to unsubscribe from events (memory leak risk) |
| Inconsistent state | `ProfileModule.js` vs `Memory.js` | Two separate profile storage mechanisms (`avcks_profile` key used differently) |

---

## 🚀 PART 5: ADVANCED FEATURE SUGGESTIONS

These features would make AVCKS competitive with or superior to existing AI desktop assistants like Cortana, Siri, Alexa, and Google Assistant.

---

### 🧠 1. Persistent Conversation Memory with RAG
**What:** Store conversation history in IndexedDB and use it to provide contextual responses. When the user asks something, search previous conversations for relevant context.
**Why it's advanced:** No browser-based assistant does this. Even ChatGPT doesn't have persistent cross-session memory in its free tier.
**Implementation:** IndexedDB + vector embeddings (via TensorFlow.js) for semantic search of past conversations.

---

### 🎯 2. Predictive Command Suggestions (Proactive AI)
**What:** Analyze usage patterns (time of day, frequency, sequences) and proactively suggest commands. E.g., "It's 9 AM — should I open your work tools like yesterday?"
**Why:** Moves from reactive to proactive intelligence. Amazon Alexa's "Hunches" feature is similar but limited.
**Implementation:** Track command timestamps in localStorage, build simple Markov chain or time-of-day frequency model.

---

### 🔌 3. Plugin/Extension System
**What:** Allow third-party modules to register new commands, UI widgets, and integrations via a plugin API.
**Why:** Makes AVCKS infinitely extensible. Users can build custom skill packs (weather providers, smart home bridges, custom APIs).
**Implementation:** Dynamic ES module imports via `Core.registerPlugin()` with a manifest-based system.

---

### 🌐 4. Cross-Device Sync via WebRTC/Firebase
**What:** Sync profile, notes, todos, facts, shortcuts, and themes across devices in real-time.
**Why:** No web-based AI assistant offers cross-device sync without a native app.
**Implementation:** Firebase Realtime Database or Supabase for auth + sync. Optional peer-to-peer via WebRTC.

---

### 🤖 5. Multi-Model AI Backbone with Streaming
**What:** Support multiple LLMs (Gemini, Ollama local, OpenAI) with streaming responses displayed character-by-character in the terminal.
**Why:** Streaming makes the AI feel instantaneous. Multiple model support gives users choice.
**Implementation:** Server-Sent Events or WebSocket stream from API → progressive terminal rendering with typing animation.

---

### 📱 6. PWA with Offline Mode & Push Notifications
**What:** Full Progressive Web App with service worker caching, installability, and push notification support for timers/reminders.
**Why:** Timer notifications only work if the tab is open. PWA notifications work even when the browser is closed.
**Implementation:** Service worker, manifest.json, Web Push API with VAPID keys.

---

### 🎨 7. Dynamic Theme Engine with Live Preview
**What:** Full HSL-based theme customizer with live preview, preset gallery (Cyberpunk, Nord, Solarized, Dracula), and user-created theme export/import.
**Why:** Current theme system only has 4 hardcoded themes. A full engine allows unlimited customization.
**Implementation:** CSS custom properties + HSL sliders + theme JSON export/import.

---

### 🗣️ 8. Wake Word Detection ("Hey AVCKS")
**What:** Always-on background listening for a wake word, eliminating the need to click the mic button.
**Why:** Every major assistant has this. Without it, AVCKS requires manual activation.
**Implementation:** TensorFlow.js speech command model for client-side wake word detection (no server needed).

---

### 📊 9. Real System Metrics via Performance API
**What:** Replace fake RAM/CPU metrics with real browser performance data using `performance.memory`, `navigator.hardwareConcurrency`, `navigator.getBattery()`, and `PerformanceObserver`.
**Why:** Current metrics are completely random numbers. Real data builds trust and utility.
**Implementation:** Performance API + Battery Status API + periodic `performance.measure()` calls.

---

### 🧩 10. Natural Language Workflow Builder
**What:** "When I say 'morning routine', open Gmail, check weather, show my todos, and play lofi music" — build complex workflows via natural language.
**Why:** Current shortcut system is basic (one trigger → one action). Workflows support conditionals, delays, and multi-step sequences.
**Implementation:** Extend `MemoryModule.storeRoutine()` with a step-based DSL, add support for delays and conditionals.

---

### 🌍 11. Multi-Language Support with Auto-Detection
**What:** Automatic language detection for voice input and responses in 10+ languages.
**Why:** Siri and Google Assistant support 30+ languages. AVCKS is English-only.
**Implementation:** `SpeechRecognition.lang` dynamic switching + Google Translate API for response translation.

---

### 🔐 12. Real Biometric Auth (WebAuthn + Face ID)
**What:** Replace the hardcoded password with WebAuthn (fingerprint/face) or camera-based face recognition.
**Why:** Current "biometric scan" is purely cosmetic. Real biometrics would be genuinely secure.
**Implementation:** WebAuthn API for hardware security keys/fingerprint, or face-api.js for camera-based face recognition.

---

### 📂 13. Drag-and-Drop File Analysis
**What:** Drop a file onto AVCKS and it analyzes the content — summarizes documents, describes images, extracts text from PDFs.
**Why:** No web assistant does this natively. It adds tangible utility beyond voice commands.
**Implementation:** Drag-and-drop zone + FileReader API + Gemini Vision API for images, PDF.js for documents.

---

### 🧮 14. Smart Context Engine with Entity Graph
**What:** Build a knowledge graph of entities mentioned in conversations. When the user says "he", "it", or "that project", resolve the reference using graph relationships, not just last-mentioned entity.
**Why:** Current context resolution is single-entity only. A graph enables multi-hop reasoning (e.g., "his manager" resolving to the manager of the last-mentioned person).
**Implementation:** In-memory entity graph with relationship tagging, decay-based relevance scoring.

---

### ⌨️ 15. Code Execution Sandbox
**What:** Type "run python: print(2+2)" and AVCKS executes it in a sandboxed environment (Pyodide for Python, V8 for JS).
**Why:** Makes AVCKS a developer tool, not just a command interface. VS Code's Copilot Chat can run code — AVCKS should too.
**Implementation:** Pyodide (Python in WebAssembly) + sandboxed iframe for JS execution.

---

## 📋 PRIORITY FIX ORDER

| Priority | Issue | Impact |
|---|---|---|
| 🔴 **P0** | SEC-01: Exposed API Key | Security — revoke immediately |
| 🔴 **P0** | BUG-14: Memory/Facts system broken | Core feature non-functional |
| 🔴 **P0** | BUG-09: Missing palette methods | Runtime crash on hotkey |
| 🟠 **P1** | BUG-02: Timer ID mismatch | localStorage bloat |
| 🟠 **P1** | RTE-01: AudioContext leak | Browser limit crash |
| 🟠 **P1** | BUG-06: GENERAL_QUERY shadows RECALL_FACT | Fact recall broken |
| 🟡 **P2** | BUG-03: Settings regex broken | Settings commands don't work |
| 🟡 **P2** | BUG-08: SimpleCommander time/date greedy | False positive commands |
| 🟡 **P2** | BUG-13: Hardcoded London weather | Wrong default city |
| 🟢 **P3** | BUG-01: Duplicate UI_TAP | Code quality |
| 🟢 **P3** | BUG-10: Draggable scope leak | Minor UI glitch |
| 🟢 **P3** | Dead code cleanup | Code quality |
