// Chạy trên Messenger (facebook.com/messages, messenger.com) và Telegram Web K.
// Việc chính: gắn class lên <html>; giao diện nằm hết trong themes/*.css.
// CSS luôn được nạp sẵn nhưng chỉ có hiệu lực khi có class, nên đổi kiểu/tắt bật
// tức thì, không tải lại trang. Phần JS chạm trang chỉ có 3 việc nhỏ:
// đổi tiêu đề tab, chặn cú bấm đầu vào media đang ẩn, và thanh nút nổi.

// Giữ khớp với popup/popup.js.
const DEFAULTS = {
  enabled: true,
  wallpaper: true,
  theme: "telegram", // kiểu cho Messenger
  tgTheme: "github", // kiểu cho Telegram K: "github" | "ai" | "ai-neutral" | "off"
  tgSidebar: true, // Telegram K: true = sidebar mở
  hideMedia: false,
};

const SITE = location.hostname === "web.telegram.org" ? "telegram" : "messenger";
const THEMES = {
  messenger: ["telegram", "github", "ai"],
  telegram: ["github", "ai", "ai-neutral", "off"],
};
const THEME_CLASSES = ["telegram", "github", "ai", "ai-neutral"];

// Tiêu đề tab giả theo từng kiểu. Kiểu không có ở đây thì giữ tiêu đề thật.
const FAKE_TITLES = {
  github: "Files changed · refactor/auth-session",
  ai: "Tối ưu truy vấn MongoDB có index",
  "ai-neutral": "Tối ưu truy vấn MongoDB có index",
};
const ALL_FAKE_TITLES = Object.values(FAKE_TITLES);

// Vùng bấm-để-xem media đang ẩn (xem themes/hide-media.css), và "một tin nhắn"
// để hiện cả tin khi bấm. Telegram: chỉ trong khung chat (.bubble) — ảnh nhỏ ở
// sidebar không chặn bấm, vì bấm vào đó là để mở chat.
const MEDIA_CLICK = {
  messenger: '[role="main"] img:not([src*="emoji.php"]), [role="main"] video',
  telegram: ".bubble .attachment, .bubble .reply-media, .bubble .media-sticker-wrapper, .bubble .media-photo, .bubble .media-video",
};
const MESSAGE_SCOPE = { messenger: '[role="row"]', telegram: ".bubble" };

const root = document.documentElement;
let settings = { ...DEFAULTS };
let realTitle = "";
let lastHide = false;
let toolbar = null;
let sidebarBtn = null;
let mediaBtn = null;

// facebook.com chung domain với News Feed: chỉ áp ở trang tin nhắn.
// messenger.com và Telegram K thì cả trang đều là chat.
function isChatPage() {
  if (SITE === "telegram" || location.hostname === "www.messenger.com") return true;
  return location.pathname.startsWith("/messages");
}

function currentTheme() {
  const value = SITE === "telegram" ? settings.tgTheme : settings.theme;
  const fallback = SITE === "telegram" ? DEFAULTS.tgTheme : DEFAULTS.theme;
  // Giá trị lạ (vd. "zalo" còn lưu từ bản cũ) → về mặc định thay vì mất hết màu.
  return THEMES[SITE].includes(value) ? value : fallback;
}

// Tab ghi "Messenger"/"Telegram" thì giao diện có giống mấy cũng lộ. Trang tự đổi
// tiêu đề liên tục (số tin chưa đọc, tên người chat), nên mỗi nhịp kiểm, thấy khác
// thì ghi đè lại. Giữ "(n)" để vẫn biết có tin mới. fake = null → trả tiêu đề thật.
function disguiseTitle(fake) {
  const title = document.title;
  const showingFake = ALL_FAKE_TITLES.some((t) => title.endsWith(t));
  if (fake) {
    if (title.endsWith(fake)) return;
    // Đang hiện tiêu đề giả của kiểu khác (vừa đổi kiểu) → đừng nhận nó là tiêu đề thật.
    if (!showingFake) realTitle = title;
    const unread = realTitle.match(/^\(\d+\)\s*/)?.[0] ?? "";
    document.title = unread + fake;
  } else if (showingFake && realTitle) {
    document.title = realTitle;
  }
}

// ---------- Ẩn media ----------

function clearReveals() {
  root.classList.remove("tgx-reveal-all");
  for (const el of document.querySelectorAll("[data-tgx-revealed]")) {
    el.removeAttribute("data-tgx-revealed");
  }
}

function toggleRevealAll() {
  if (root.classList.contains("tgx-reveal-all")) clearReveals();
  else root.classList.add("tgx-reveal-all");
  updateToolbar();
}

// Media đang ẩn mà người dùng bấm vào → trả về tin nhắn chứa nó, còn không thì null.
// Đánh dấu cả tin chứ không riêng phần tử: một ảnh có nhiều lớp (thumbnail mờ +
// ảnh thật + spoiler), chỉ hiện một lớp thì vẫn không thấy gì.
// Dùng data-attribute chứ không dùng class: trang vẽ lại className thì class lạ mất.
function hiddenMediaMessage(target) {
  if (!root.classList.contains("tgx-hide-media")) return null;
  if (root.classList.contains("tgx-reveal-all")) return null;
  if (!(target instanceof Element)) return null;
  const media = target.closest(MEDIA_CLICK[SITE]);
  if (!media) return null;
  const message = media.closest(MESSAGE_SCOPE[SITE]) ?? media;
  return message.hasAttribute("data-tgx-revealed") ? null : message;
}

// Bấm lần đầu vào media đang ẩn = chỉ hiện nó, KHÔNG mở trình xem ảnh/mở link.
// Bắt ở window + capture để chạy trước listener của trang; chặn cả pointerdown/
// mousedown vì có chỗ trang mở media ngay lúc nhấn chuột xuống.
for (const type of ["pointerdown", "mousedown", "click"]) {
  window.addEventListener(
    type,
    (event) => {
      const message = hiddenMediaMessage(event.target);
      if (!message) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (type === "click") message.setAttribute("data-tgx-revealed", "");
    },
    true,
  );
}

// ---------- Thu gọn sidebar (Telegram K) ----------

function toggleSidebar() {
  // Lưu vào storage → onChanged gọi apply(); nhớ cả lần mở trang sau.
  chrome.storage.sync.set({ tgSidebar: !settings.tgSidebar });
}

// ---------- Phím tắt ----------

window.addEventListener(
  "keydown",
  (event) => {
    if (!event.altKey || !event.shiftKey || !root.classList.contains("tgx-on")) return;
    if (event.code === "KeyM" && root.classList.contains("tgx-hide-media")) {
      event.preventDefault();
      toggleRevealAll();
    } else if (event.code === "KeyS" && SITE === "telegram") {
      event.preventDefault();
      toggleSidebar();
    }
  },
  true,
);

// ---------- Thanh nút nổi góc dưới trái ----------

function makeButton(title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}

function setLabel(button, label) {
  if (button.textContent !== label) button.textContent = label;
}

function updateToolbar() {
  if (!document.body) return; // document_start: body chưa có, nhịp sau sẽ gắn
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "tgx-toolbar";
    sidebarBtn = makeButton("Thu gọn / mở sidebar (Alt+Shift+S)", toggleSidebar);
    mediaBtn = makeButton("Hiện / ẩn tất cả media (Alt+Shift+M)", toggleRevealAll);
    toolbar.append(sidebarBtn, mediaBtn);
  }
  const on = root.classList.contains("tgx-on");
  const showSidebarBtn = on && SITE === "telegram";
  const showMediaBtn = root.classList.contains("tgx-hide-media");

  sidebarBtn.hidden = !showSidebarBtn;
  mediaBtn.hidden = !showMediaBtn;
  toolbar.hidden = !showSidebarBtn && !showMediaBtn;
  setLabel(sidebarBtn, settings.tgSidebar ? "☰ Ẩn sidebar" : "☰ Hiện sidebar");
  setLabel(mediaBtn, root.classList.contains("tgx-reveal-all") ? "Ẩn media" : "Hiện media");
  if (!toolbar.isConnected) document.body.append(toolbar);
}

// ---------- Áp cài đặt ----------

function apply() {
  const on = settings.enabled && isChatPage();
  const theme = currentTheme();
  const styled = on && theme !== "off";
  const hide = on && settings.hideMedia;

  root.classList.add(`tgx-site-${SITE}`);
  root.classList.toggle("tgx-on", on);
  root.classList.toggle("tgx-styled", styled);
  root.classList.toggle("tgx-wallpaper", on && SITE === "messenger" && settings.wallpaper);
  for (const t of THEME_CLASSES) root.classList.toggle(`tgx-theme-${t}`, on && t === theme);
  // Hai biến thể "ai" (ấm / trung tính) dùng chung bố cục, chỉ khác bảng màu:
  // luật bố cục bám tgx-family-ai, bảng màu bám tgx-theme-<tên>.
  root.classList.toggle("tgx-family-ai", on && theme.startsWith("ai"));
  root.classList.toggle("tgx-left-collapsed", on && SITE === "telegram" && !settings.tgSidebar);
  root.classList.toggle("tgx-hide-media", hide);

  // Tắt ẩn media → xoá dấu "đã hiện" để lần bật sau mọi thứ ẩn lại từ đầu.
  if (lastHide && !hide) clearReveals();
  lastHide = hide;

  updateToolbar();
  disguiseTitle(on ? (FAKE_TITLES[theme] ?? null) : null);
}

chrome.storage.sync.get(DEFAULTS, (saved) => {
  settings = saved;
  apply();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
  apply();
});

// Áp lại mỗi 500ms. Lý do: cả hai trang là SPA (đổi URL không tải lại, content
// script không nghe được pushState), trang có thể ghi đè class của <html> hoặc
// tiêu đề tab, và lúc document_start thì <body> chưa có để gắn thanh nút. apply()
// chỉ toggle class/so chuỗi nên chạy lặp rất rẻ.
setInterval(apply, 500);
