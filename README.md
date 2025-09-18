# Groq Voice Agent Template

A real-time voice AI agent built with Groq API that enables natural voice conversations with configurable AI models, voices, and system prompts.


https://github.com/user-attachments/assets/837f11d5-05e3-4469-bec5-268e095ed5df


## Overview

This application demonstrates real-time voice interaction using Groq API for ultra-fast speech-to-text, AI inference, and text-to-speech capabilities. Built as a complete, end-to-end template that you can fork, customize, and deploy.

👉 [**Live Demo Link**](https://groq-voice-agent-template.vercel.groqcloud.net/) 👈

**Key Features:**
- **Real-time Voice Conversations**: Talk naturally with an AI agent using voice activity detection (VAD)
- **Visual Flow Diagram**: Interactive node-based visualization showing the voice processing pipeline in real-time
- **Configurable AI Models**: Choose from multiple Groq models including Llama 4 Maverick and Scout variants
- **Multiple TTS Voices**: Select from 19 different PlayAI voices for personalized responses
- **Custom System Prompts**: Easily customize the AI's personality and behavior
- **Microphone Selection**: Support for multiple audio input devices
- **Conversation History**: Maintains context across multi-turn conversations
- Sub-second response times, efficient concurrent request handling, and production-grade performance powered by Groq

## Architecture

**Tech Stack:**
- **Frontend:** Svelte 5, TypeScript, Tailwind CSS, Vite
- **UI Components:** Shadcn/ui components for Svelte
- **Voice Processing:** Voice Activity Detection (VAD) with [@ricky0123/vad-web](https://github.com/ricky0123/vad)
- **Audio Handling:** Custom TTS audio buffer with streaming support
- **Flow Visualization:** [@xyflow/svelte](https://www.npmjs.com/package/@xyflow/svelte) for interactive node diagrams
- **AI Infrastructure:** Groq API (Speech-to-Text, LLM, Text-to-Speech)

**Voice Processing Pipeline:**
1. **Microphone Input** → Voice Activity Detection (VAD)
2. **Speech Recording** → Groq Whisper (Speech-to-Text)
3. **Text Processing** → Groq LLM (AI Inference)
4. **Response Generation** → Groq PlayAI (Text-to-Speech)
5. **Audio Output** → Streaming audio playback

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Groq API key ([Create a free GroqCloud account and generate an API key here](https://console.groq.com/keys))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/benank/groq-voice-agent-template
   cd groq-voice-agent-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to http://localhost:5173 and start talking to your AI agent!

### Usage

1. **Add API Key**: Click "Add API Key" and enter your [Groq API key](https://console.groq.com/keys)
2. **Configure Settings**: Select your preferred microphone, voice, AI model, and system prompt
3. **Start Conversation**: Click the play button on the "Start" node in the flow diagram
4. **Talk Naturally**: Speak into your microphone - the AI will respond with voice
5. **Visual Feedback**: Watch the real-time flow diagram showing the processing pipeline

## Customization

This template is designed to be a foundation for you to get started with. Key areas for customization:

- **Model Selection**: Update the [AI model configuration](https://console.groq.com/docs/models) in the AI Model dropdown
- **Voice Selection**: Choose from 19 different [PlayAI voices](https://console.groq.com/docs/text-to-speech)
- **System Prompts**: Customize the AI's behavior by editing the system prompt in the UI

## Next Steps

### For Developers
- **Create your free GroqCloud account**: Access official API docs, the playground for experimentation, and more resources via [Groq Console](https://console.groq.com).
- **Build and customize**: Fork this repo and start customizing to build out your own application.
- **Get support**: Connect with other developers building on Groq, chat with our team, and submit feature requests on our [Groq Developer Forum](https://community.groq.com).

### For Founders and Business Leaders
- **See enterprise capabilities**: This template showcases production-ready AI that can handle realtime business workloads.
- **Discuss Your needs**: [Contact our team](https://groq.com/enterprise-access/) to explore how Groq can accelerate your AI initiatives.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Created by [Julian Francisco](https://www.linkedin.com/in/julian-francisco/).
