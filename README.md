# PromptLens — Convert any image into a structured AI prompt

PromptLens is a lightweight utility designed for digital artists, creators, and AI enthusiasts who need to translate visual content into machine-readable data. Integrated directly into your browser, it analyzes web images and local image files and generates a clean JSON prompt ready for AI image generators and LLMs.

## Main Features

⚡ **Instant Access** — Right-click any image on any website, no extra steps.

🖼️ **Local Image Upload** — Click the extension icon to upload, drag-and-drop, or paste a local image from your computer.

📋 **Structured Output** — Clean JSON with style, subject, setting, lighting, mood, colors, tags, and negative prompt.

🔌 **OpenRouter Powered** — Access vision AI models through your own OpenRouter API key, usually at a very low cost per image.

🤖 **Smart Model Routing** — OpenRouter can automatically select an available vision model for each request when using automatic routing. No manual model configuration needed.

🔒 **Privacy-First** — Your API key stays in your browser. No middleman servers, ever. Images are sent directly to OpenRouter only when you explicitly analyze them.

## How to Use

1. Install PromptLens and enter your OpenRouter API key in the options page.
2. Right-click any image on any website and select **"PromptLens — Generate JSON Prompt"**.
3. Or click the extension icon to upload, drag-and-drop, or paste a local image.
4. The JSON is copied to your clipboard — paste it anywhere.

## Note

The AI model used may vary per request based on OpenRouter's automatic routing. Results may differ slightly between analyses of the same image.

## Requirements

A free or paid OpenRouter account and API key: https://openrouter.ai

## Privacy

- Your API key is stored locally in Chrome's sync storage.
- No data is collected or tracked by PromptLens.
- Web images and local images are sent directly to OpenRouter for analysis and nowhere else.
- Local images are processed only after you explicitly choose, paste, or drop them in the popup.

## Contributing

Pull requests are welcome. Feel free to open an issue for bugs or feature requests.

## License

MIT
