// Load saved key on page open
document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await chrome.storage.sync.get("apiKey");
  if (apiKey) {
    document.getElementById("apiKey").value = apiKey;
  }
});

async function saveKey() {
  const input = document.getElementById("apiKey");
  const status = document.getElementById("status");
  const key = input.value.trim();

  if (!key) {
    status.className = "status error";
    status.textContent = "Please enter a valid API key.";
    return;
  }

  if (!key.startsWith("sk-or-")) {
    status.className = "status error";
    status.textContent = "This doesn't look like an OpenRouter key (should start with sk-or-).";
    return;
  }

  await chrome.storage.sync.set({ apiKey: key });
  status.className = "status success";
  status.textContent = "✅ API key saved! You can now close this tab and start using PromptLens.";
}

async function clearKey() {
  const input = document.getElementById("apiKey");
  const status = document.getElementById("status");
  await chrome.storage.sync.remove("apiKey");
  input.value = "";
  status.className = "status success";
  status.textContent = "🗑️ API key removed from storage.";
}

// Allow saving with Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveKey();
});
