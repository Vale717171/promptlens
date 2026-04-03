const MODEL = "openrouter/auto";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

let isProcessing = false;

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

  if (isProcessing) {
    await injectAndSend(tab.id, { type: "STATUS", text: "⏳ Already processing an image, please wait..." });
    return;
  }

  // Check API key
  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (!apiKey) {
    await injectAndSend(tab.id, {
      type: "ERROR",
      text: "❌ API key missing — click the extension icon to configure it"
    });
    chrome.runtime.openOptionsPage();
    return;
  }

  isProcessing = true;
  await injectAndSend(tab.id, { type: "STATUS", text: "⏳ Analyzing image..." });

  try {
    const { base64, mimeType } = await fetchImageAsBase64(imageUrl);
    const json = await callOpenRouter(base64, mimeType, apiKey);
    await injectAndSend(tab.id, { type: "COPY_AND_NOTIFY", text: json });
  } catch (err) {
    await injectAndSend(tab.id, { type: "ERROR", text: "❌ Error: " + err.message });
  } finally {
    isProcessing = false;
  }
});

async function injectAndSend(tabId, msg) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (_ignore) {
    // Safe to ignore: content script may already be injected from a previous
    // call, or the page (e.g. chrome://) may not allow script injection.
  }
  chrome.tabs.sendMessage(tabId, msg).catch(() => {});
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download image (HTTP ${response.status})`);
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return { base64: btoa(binary), mimeType };
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
      "HTTP-Referer": "https://github.com/promptlens",
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
  const parsed = JSON.parse(cleaned);
  return JSON.stringify(parsed, null, 2);
}
