const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const fileInput = document.getElementById("fileInput");
const chooseFile = document.getElementById("chooseFile");
const dropZone = document.getElementById("dropZone");
const previewCard = document.getElementById("previewCard");
const previewImage = document.getElementById("previewImage");
const fileName = document.getElementById("fileName");
const fileMeta = document.getElementById("fileMeta");
const analyzeButton = document.getElementById("analyzeButton");
const clearButton = document.getElementById("clearButton");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const copyButton = document.getElementById("copyButton");
const statusEl = document.getElementById("status");
const openOptions = document.getElementById("openOptions");

let selectedFile = null;
let selectedBase64 = null;
let selectedMimeType = null;
let lastResult = "";

chooseFile.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) handleFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) handleFile(file);
});

document.addEventListener("paste", (event) => {
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));
  const file = imageItem?.getAsFile();
  if (file) handleFile(file);
});

analyzeButton.addEventListener("click", analyzeSelectedImage);
clearButton.addEventListener("click", resetSelection);
copyButton.addEventListener("click", copyResult);
openOptions.addEventListener("click", () => chrome.runtime.openOptionsPage());

async function handleFile(file) {
  setStatus("", "");
  resultCard.hidden = true;
  lastResult = "";

  try {
    validateImageFile(file);

    selectedFile = file;
    selectedMimeType = file.type || "image/jpeg";
    selectedBase64 = await fileToBase64(file);

    previewImage.src = URL.createObjectURL(file);
    fileName.textContent = file.name || "Pasted image";
    fileMeta.textContent = `${selectedMimeType} · ${formatBytes(file.size)}`;
    previewCard.hidden = false;
    setStatus("Ready. Generate the JSON prompt when you want.", "info");
  } catch (error) {
    resetSelection();
    setStatus(error.message, "error");
  }
}

function validateImageFile(file) {
  if (!file.type?.startsWith("image/")) {
    throw new Error("Unsupported file type. Please choose an image.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please use an image under 10 MB.");
  }
}

async function analyzeSelectedImage() {
  if (!selectedBase64 || !selectedMimeType) {
    setStatus("Choose an image first.", "error");
    return;
  }

  analyzeButton.disabled = true;
  clearButton.disabled = true;
  setStatus("Analyzing image...", "info");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE_IMAGE_DATA",
      base64: selectedBase64,
      mimeType: selectedMimeType
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Unknown error while analyzing image.");
    }

    lastResult = response.json;
    resultText.textContent = formatJsonIfPossible(lastResult);
    resultCard.hidden = false;
    await copyText(lastResult);
    setStatus("JSON prompt generated and copied to clipboard.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    analyzeButton.disabled = false;
    clearButton.disabled = false;
  }
}

function resetSelection() {
  if (previewImage.src) URL.revokeObjectURL(previewImage.src);
  selectedFile = null;
  selectedBase64 = null;
  selectedMimeType = null;
  fileInput.value = "";
  previewImage.removeAttribute("src");
  previewCard.hidden = true;
  resultCard.hidden = true;
  lastResult = "";
  setStatus("", "");
}

async function copyResult() {
  if (!lastResult) return;
  try {
    await copyText(lastResult);
    setStatus("Copied to clipboard.", "success");
  } catch (error) {
    setStatus("Could not copy to clipboard. Select the text manually.", "error");
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function formatJsonIfPossible(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type ? `status ${type}` : "status";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "unknown size";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
