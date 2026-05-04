const MODEL = "openrouter/auto";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const SYSTEM_PROMPT = `Analyze this image and return ONLY a valid JSON object (no markdown, no backticks, no extra text) with this exact structure:
{
  "prompt": "detailed description of the image suitable as a prompt for AI image generators",
  "style": "main visual style (e.g. photograph, digital art, illustration, 3d render)",
  "subject": "main subject",
  "setting": "environment or background",
  "lighting": "type of lighting",
  "mood": "atmosphere or mood",
  "colors": ["color1", "color2"],
  "negative_prompt": "elements to avoid to replicate this image",
  "tags": ["tag1", "tag2", "tag3"]
}`;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-image",
    title: "🔍 PromptLens — Generate JSON Prompt",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "analyze-image") return;
  const imageUrl = info.srcUrl;
  if (!imageUrl) return;

  // Check API key
  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (!apiKey) {
    sendToTab(tab.id, {
      type: "ERROR",
      text: "❌ Missing API key — click the extension icon to configure PromptLens"
    });
    chrome.runtime.openOptionsPage();
    return;
  }

  sendToTab(tab.id, { type: "STATUS", text: "⏳ Analyzing image..." });

  try {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);
    const json = await callOpenRouter(base64, mimeType, apiKey);
    sendToTab(tab.id, { type: "COPY_AND_NOTIFY", text: json });
  } catch (err) {
    sendToTab(tab.id, { type: "ERROR", text: "❌ Error: " + err.message });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "ANALYZE_IMAGE_DATA") return;

  analyzeImageData(msg)
    .then((json) => sendResponse({ ok: true, json }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true;
});

async function analyzeImageData({ base64, mimeType }) {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("No image data received.");
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("Unsupported file type. Please choose an image.");
  }

  assertBase64ImageSize(base64);

  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (!apiKey) {
    throw new Error("Missing API key. Save your OpenRouter API key first.");
  }

  return callOpenRouter(base64, mimeType, apiKey);
}

function sendToTab(tabId, msg) {
  chrome.tabs.sendMessage(tabId, msg).catch(() => {});
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download image (HTTP ${response.status})`);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please use an image under 10 MB.");
  }
  const mimeType = blob.type || "image/jpeg";
  return { base64: await blobToBase64(blob), mimeType };
}

function assertBase64ImageSize(base64) {
  const approximateBytes = Math.ceil((base64.length * 3) / 4);
  if (approximateBytes > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please use an image under 10 MB.");
  }
}

async function blobToBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function callOpenRouter(base64, mimeType, apiKey) {
  const body = {
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.2,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: SYSTEM_PROMPT },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
      ]
    }]
  };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/Vale717171/promptlens",
      "X-Title": "PromptLens"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

  const rawText = data.choices?.[0]?.message?.content || "";
  let cleaned = rawText.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];
  JSON.parse(cleaned);
  return cleaned;
}
