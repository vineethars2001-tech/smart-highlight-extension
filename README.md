# ✨ Highlight AI — Smart Text Assistant

![Highlight AI Banner](https://img.shields.io/badge/Highlight%20AI-Productivity-blue?style=for-the-badge&logo=googlechrome)

> A modern Chrome/Edge extension that turns any highlighted text into instant AI insights using Hugging Face inference.

---

## 🚀 Project Snapshot

| Metric | Value |
|---|---|
| Platform | Chrome / Edge (Manifest V3) |
| AI Backend | Hugging Face Inference API |
| Actions | 9 text operations |
| UI | Floating top-right action panel |
| Main languages | English, German, Kannada, French, Japanese, Hindi, Spanish |

---

## 🌟 What This Tool Does

`Highlight AI` transforms passive reading into active understanding by providing real-time intelligence on any selected web text.

It is built to support high-value workflows such as:

- **Research and summary extraction**
- **Technical documentation review**
- **Content sentiment & tone analysis**
- **Multilingual translation**
- **Academic note generation**

---

## 💡 Key Features

- ✅ **9 AI-powered actions**
- ✅ **Floating panel** opens automatically in the top-right corner
- ✅ **Hugging Face integration** for real-time inference
- ✅ **Secure popup key configuration**
- ✅ **Copy output instantly**
- ✅ **Reading-time and text statistics**
- ✅ **Formatted output with visual clarity**

### Available Actions

| Action | Purpose |
|---|---|
| 🧠 Explain | Break down complex text into clear meaning |
| ✨ Improve | Rewrite for higher readability and flow |
| ✂️ Simplify | Turn technical content into easy language |
| 📝 Summarize | Generate concise summaries |
| 📋 Notes | Create bullet-point notes |
| 💬 Ask | Answer questions based on selected text |
| 🎭 Tone | Analyze mood and attitude |
| 😊 Sentiment | Detect positive / negative / neutral feeling |
| 🌐 Translate | Convert text into another language |

---

## 🎯 Why This Project Is Novel

`Highlight AI` is not just a highlight tool—it is a browser-native insight engine. It combines the best of productivity and natural language intelligence in a single extension.

### Novel Value

- **Instant contextual assistance** without copying text to external apps
- **Action-oriented UI** tailored for readers, writers, students, and analysts
- **API-driven intelligence** while preserving user control through local popup configuration
- **Multi-output feedback** including confidence, reading time, and key points

---

## 🛠️ Architecture Overview

```text
smart-highlight-extension/
├── background.js       # Hugging Face proxy + keyboard shortcut listener
├── content.js          # Selection detection, panel render, action dispatch
├── panel.css           # Floating panel and action button styles
├── popup.html          # API key settings interface
├── popup.js            # Popup logic and storage handling
├── manifest.json       # Extension metadata and permissions
└── icons/              # Extension branding assets
```

### Core Components

- **Manifest V3**: modern extension lifecycle with secure service worker support
- **Content script**: detects highlighted text and displays the floating assistant
- **Background worker**: manages Hugging Face requests and proxy behavior
- **Popup settings**: stores API token safely with Chrome storage

---

## ⚙️ Installation

1. Clone or download the repository.
2. Open browser extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `smart-highlight-extension` folder.
5. Click the extension icon, paste your Hugging Face API key, and save.

---

## ▶️ Usage Guide

1. Highlight any text on any website.
2. The floating panel appears in the top-right corner.
3. Click the action you want.
4. View the AI response with formatted output, confidence, reading time, and key points.
5. Copy results instantly with one click.

---

## 🔑 Hugging Face Integration

This extension uses the Hugging Face Inference API via `https://router.huggingface.co/v1/chat/completions`.

### API Key Setup

- Open the extension popup.
- Paste your Hugging Face token (must start with `hf_`).
- Click **Save Key & Activate**.

---

## 🧠 Technical Details

- Content script detects text selection and renders the assistant panel.
- Background worker sends user prompts to Hugging Face and returns text responses.
- The UI formats output for readability and adds metadata like word count.
- The settings popup uses `chrome.storage.sync` to keep the token secure.

---

## 📈 Future Enhancements

Potential improvements:

- Model selection and temperature controls
- Offline caching for faster repeat queries
- Custom action presets and user workflows
- Long-text chunking for extended selections
- Expanded language support and auto-detection

---

## 📝 Submission Advantages

This project is an excellent submission because it demonstrates:

- real-world browser extension development
- modern Manifest V3 architecture
- AI integration with a production-ready API
- robust UI and workflow design
- secure token handling and clean state management

---

## 📌 Visual Assets

> Add your own screenshots or workflow graphics here for an even stronger demo.

![Extension Preview](https://via.placeholder.com/800x420?text=Highlight+AI+Preview)

---

## 🧭 Demo Flow: Extension Lifecycle

The following demo flow shows how `Highlight AI` behaves from installation to output delivery.

1. **Install and configure the extension**
   - Load the unpacked extension in Chrome/Edge.
   - Open the popup and enter your Hugging Face API token.
   - Save and activate the extension.

2. **Select text on any webpage**
   - Highlight a paragraph or sentence in the browser.
   - The floating trigger pill appears automatically.

3. **Open the action panel**
   - Click the floating trigger or use the auto-open flow.
   - The top-right panel appears with available actions.

4. **Choose an AI action**
   - Pick Explain, Improve, Simplify, Summarize, Notes, Ask, Tone, Sentiment, Readability, or Translate.
   - The extension creates a prompt and sends it to Hugging Face.

5. **Receive and review the response**
   - The response is formatted and displayed in the panel.
   - Confidence, reading time, statistics, and key points appear.
   - Copy the result directly from the panel.

---

## 📊 Mockup Diagram

```text
[ User highlights text ]
              |
              v
 [ Floating trigger pill appears ]
              |
              v
[ Top-right action panel opens ]
              |
              v
[ User selects AI action ]
              |
              v
[ Prompt sent to Hugging Face API ]
              |
              v
[ AI response received and formatted ]
              |
              v
[ Result displayed with metrics and copy button ]
```

---

## 📚 License

This repository is provided for educational and submission use. Replace or extend the Hugging Face integration as needed for your deployment.

---

Thank you for the prompt—this README now includes a complete mockup diagram and lifecycle flow section for project submission.