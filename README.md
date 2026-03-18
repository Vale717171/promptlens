# PromptLens ‚Äî Image to AI Prompt

A Chrome extension that turns any web image into a structured JSON prompt with one right-click. Powered by [OpenRouter](https://openrouter.ai).

![PromptLens in action](icons/icon128.png)

## What it does

Right-click any image in your browser ‚Üí select **"Analyze image ‚Üí JSON prompt"** ‚Üí get a structured JSON description copied to your clipboard, ready to use with Midjourney, Stable Diffusion, FLUX, and other AI image generators.

The JSON includes:
- `prompt` ‚Äî detailed image description
- `style` ‚Äî visual style (photograph, digital art, illustration‚Ä¶)
- `subject` ‚Äî main subject
- `setting` ‚Äî environment or background
- `lighting` ‚Äî type of lighting
- `mood` ‚Äî atmosphere
- `colors` ‚Äî dominant color palette
- `negative_prompt` ‚Äî elements to avoid
- `tags` ‚Äî relevant keywords

## Installation

1. Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/jinhmaocjgbkmhpkhaelmcoeefkcbodj)
2. Click the extension icon and enter your [OpenRouter API key](https://openrouter.ai/keys)
3. Right-click any image and select **"Analyze image ‚Üí JSON prompt"**

## Requirements

- A free or paid [OpenRouter](https://openrouter.ai) account
- Your own API key (stored locally, never sent anywhere except OpenRouter)

## Privacy

- Your API key is stored locally in Chrome's sync storage
- No data is collected or tracked
- Images are sent directly to OpenRouter for analysis and nowhere else

## Contributing

Pull requests are welcome. Feel free to open an issue for bugs or feature requests.

## License

MIT

