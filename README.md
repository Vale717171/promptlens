# PromptLens - Image to AI Prompt

A Chrome extension that turns web images and local image files into structured JSON prompts. Powered by [OpenRouter](https://openrouter.ai).

## What it does

Right-click any image in your browser, select **"PromptLens — Generate JSON Prompt"**, and get a structured JSON description copied to your clipboard, ready to use with Midjourney, Stable Diffusion, FLUX, and other AI image generators.

You can also click the extension icon and upload, drag-and-drop, or paste a local image from your computer. This makes PromptLens useful for screenshots, photos taken with a phone, and personal reference images.

The JSON includes:
- `prompt` - detailed image description
- `style` - visual style (photograph, digital art, illustration...)
- `subject` - main subject
- `setting` - environment or background
- `lighting` - type of lighting
- `mood` - atmosphere
- `colors` - dominant color palette
- `negative_prompt` - elements to avoid
- `tags` - relevant keywords

## Installation

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jinhmaocjgbkmhpkhaelmcoeefkcbodj)
2. Click the extension icon and enter your [OpenRouter API key](https://openrouter.ai/keys) from the settings page
3. Right-click any web image or click the extension icon to upload a local image

## Requirements

- A free or paid [OpenRouter](https://openrouter.ai) account
- Your own API key (stored locally, never sent anywhere except OpenRouter)

## Privacy

- Your API key is stored locally in Chrome's sync storage
- No data is collected or tracked
- Web images and local images are sent directly to OpenRouter for analysis and nowhere else
- Local images are processed only after you explicitly choose, paste, or drop them in the popup

## Contributing

Pull requests are welcome. Feel free to open an issue for bugs or feature requests.

## License

MIT
