chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "COPY_AND_NOTIFY") {
    copyToClipboard(msg.text);
  } else if (msg.type === "STATUS") {
    showToast(msg.text, "info");
  } else if (msg.type === "ERROR") {
    showToast(msg.text, "error");
  }
});

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("✅ Prompt JSON copied to clipboard!", "success");
  } catch (e) {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0.01;top:0;left:0;width:1px;height:1px;font-size:16px;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showToast("✅ Prompt JSON copied to clipboard!", "success");
    } catch (e2) {
      showToast("⚠️ Could not copy — check browser console", "error");
      console.log("PROMPT JSON:", text);
    }
  }
}

function showToast(message, type = "info") {
  const existing = document.getElementById("promptlens-toast");
  if (existing) existing.remove();

  const colors = { success: "#10b981", error: "#ef4444", info: "#6366f1" };

  const toast = document.createElement("div");
  toast.id = "promptlens-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 28px; right: 28px;
    z-index: 2147483647;
    background: ${colors[type]};
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    max-width: 380px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, type === "info" ? 8000 : 4000);
}
