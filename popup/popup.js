// Giữ DEFAULTS khớp với src/content.js.
const DEFAULTS = {
  enabled: true,
  wallpaper: true,
  theme: "telegram",
  tgTheme: "github",
  tgSidebar: true,
  hideMedia: false,
};

chrome.storage.sync.get(DEFAULTS, (saved) => {
  for (const key of Object.keys(DEFAULTS)) {
    const input = document.getElementById(key);
    const isCheckbox = input.type === "checkbox";
    if (isCheckbox) input.checked = saved[key];
    else input.value = saved[key];
    input.addEventListener("change", () => {
      chrome.storage.sync.set({ [key]: isCheckbox ? input.checked : input.value });
    });
  }
});
