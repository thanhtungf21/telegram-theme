// Giữ DEFAULTS khớp với src/content.js.
const DEFAULTS = {
  enabled: true,
  wallpaper: true,
  theme: "telegram",
  tgTheme: "github",
  tgSidebar: true,
  hideMedia: true,
};

chrome.storage.sync.get(DEFAULTS, (saved) => {
  for (const key of Object.keys(DEFAULTS)) {
    const input = document.getElementById(key);
    const isCheckbox = input.type === "checkbox";
    if (isCheckbox) input.checked = saved[key];
    // "ai-neutral" (bản cũ) đã gộp vào "ai" → hiện đúng lựa chọn trong ô chọn.
    else input.value = saved[key] === "ai-neutral" ? "ai" : saved[key];
    input.addEventListener("change", () => {
      chrome.storage.sync.set({ [key]: isCheckbox ? input.checked : input.value });
    });
  }
});
