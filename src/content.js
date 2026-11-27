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
  tgTheme: "github", // kiểu cho Telegram K: "github" | "ai" (Claude) | "off"
  tgSidebar: true, // Telegram K: true = sidebar mở
  hideMedia: true, // mặc định ẩn: mở trang lên là không lộ ảnh
};

const SITE = location.hostname === "web.telegram.org" ? "telegram" : "messenger";
const THEMES = {
  messenger: ["telegram", "github", "ai"],
  telegram: ["github", "ai", "off"],
};
const THEME_CLASSES = ["telegram", "github", "ai"];
// Giá trị đã lưu từ bản cũ → đổi sang giá trị hiện tại (ai-neutral gộp vào ai ở 0.10.0).
const THEME_ALIASES = { "ai-neutral": "ai" };

// Tiêu đề tab giả theo từng kiểu. Kiểu không có ở đây thì giữ tiêu đề thật.
const FAKE_TITLES = {
  github: "Files changed · refactor/auth-session",
  ai: "Tối ưu truy vấn MongoDB có index",
};
const ALL_FAKE_TITLES = Object.values(FAKE_TITLES);

// Icon tab giả theo từng kiểu: SVG tự vẽ, hình chung chung, không phải logo sản phẩm nào.
// Kiểu không có ở đây thì giữ icon thật.
const svgIcon = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
const ICON_CODE = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#24292f"/><path d="M12 10l-6 6 6 6M20 10l6 6-6 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
);
const iconChat = (bg) =>
  svgIcon(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M8 10.5a2.5 2.5 0 0 1 2.5-2.5h11a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H14l-4 4v-4h0.5A2.5 2.5 0 0 1 8 17.5z" fill="#fff"/><circle cx="12.5" cy="14" r="1.3" fill="${bg}"/><circle cx="16" cy="14" r="1.3" fill="${bg}"/><circle cx="19.5" cy="14" r="1.3" fill="${bg}"/></svg>`,
  );
const FAKE_ICONS = {
  github: ICON_CODE,
  ai: iconChat("#3d3929"),
};

// Vùng bấm-để-xem media đang ẩn (xem themes/hide-media.css), và "một tin nhắn"
// để hiện cả tin khi bấm. Telegram: chỉ trong khung chat (.bubble) — ảnh nhỏ ở
// sidebar không chặn bấm, vì bấm vào đó là để mở chat.
const MEDIA_CLICK = {
  messenger: '[role="main"] img:not([src*="emoji.php"]), [role="main"] video',
  telegram: [
    ".bubble:not(.emoji-big) .attachment", // ô "đã ẩn" của ảnh/video/album/GIF/sticker
    ".bubble .webpage-preview-resizer", // ô "đã ẩn" của ảnh preview link
    ".bubble .media-sticker-wrapper",
  ].join(","),
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
  const raw = SITE === "telegram" ? settings.tgTheme : settings.theme;
  const value = THEME_ALIASES[raw] ?? raw;
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

// Icon tab cũng lộ y như tiêu đề. Telegram/Meta tự đổi href của thẻ <link rel=icon>
// (vd. chấm đỏ khi có tin mới), nên cũng ghi đè lại mỗi nhịp. Trước khi ghi đè, cất
// href thật vào data-tgx-real-href để trả lại khi tắt kiểu.
// rel~="icon" khớp cả "icon" lẫn "alternate icon", không khớp "apple-touch-icon".
function disguiseIcon(icon) {
  const links = [...document.querySelectorAll('link[rel~="icon"]')];
  if (icon) {
    if (!document.head) return;
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.dataset.tgxCreated = "";
      document.head.append(link);
      links.push(link);
    }
    for (const link of links) {
      if (link.href === icon) continue;
      if (!("tgxCreated" in link.dataset)) link.dataset.tgxRealHref = link.getAttribute("href") ?? "";
      link.removeAttribute("type"); // type="image/png" sai với SVG → trình duyệt bỏ qua
      link.href = icon;
    }
  } else {
    for (const link of links) {
      if ("tgxCreated" in link.dataset) link.remove();
      else if ("tgxRealHref" in link.dataset) {
        link.href = link.dataset.tgxRealHref;
        delete link.dataset.tgxRealHref;
      }
    }
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

// Icon "khung có cột bên trái" cho nút thu gọn sidebar. Dựng bằng createElementNS thay
// vì innerHTML để không vướng Trusted Types/CSP của trang.
function sidebarIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const el = (tag, attrs) => {
    const node = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };
  const svg = el("svg", { viewBox: "0 0 20 20", width: "20", height: "20", "aria-hidden": "true" });
  svg.append(
    el("rect", { x: "2.75", y: "3.75", width: "14.5", height: "12.5", rx: "2.5", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }),
    el("path", { d: "M7.5 4v12", stroke: "currentColor", "stroke-width": "1.5" }),
  );
  return svg;
}

function updateToolbar() {
  if (!document.body) return; // document_start: body chưa có, nhịp sau sẽ gắn
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.id = "tgx-toolbar";
    sidebarBtn = makeButton("Thu gọn / mở sidebar (Alt+Shift+S)", toggleSidebar);
    sidebarBtn.id = "tgx-sidebar-toggle";
    mediaBtn = makeButton("Hiện / ẩn tất cả media (Alt+Shift+M)", toggleRevealAll);
    toolbar.append(mediaBtn);
  }
  const on = root.classList.contains("tgx-on");
  const showSidebarBtn = on && SITE === "telegram";
  const showMediaBtn = root.classList.contains("tgx-hide-media");
  // Kiểu chat AI: nút thu gọn là icon ở góc TRÊN trái như app chat AI (CSS ai.css chừa
  // chỗ cho nó). Kiểu khác: nút chữ trong thanh góc dưới, vì góc trên trái là nút menu
  // của Telegram và không có chỗ chừa.
  const topToggle = root.classList.contains("tgx-theme-ai");

  sidebarBtn.hidden = !showSidebarBtn;
  sidebarBtn.classList.toggle("tgx-top", topToggle);
  if (topToggle) {
    if (sidebarBtn.dataset.mode !== "icon") {
      sidebarBtn.replaceChildren(sidebarIcon());
      sidebarBtn.dataset.mode = "icon";
    }
    if (sidebarBtn.parentElement !== document.body) document.body.append(sidebarBtn);
  } else {
    if (sidebarBtn.dataset.mode !== "text") {
      sidebarBtn.textContent = "";
      sidebarBtn.dataset.mode = "text";
    }
    setLabel(sidebarBtn, settings.tgSidebar ? "☰ Ẩn sidebar" : "☰ Hiện sidebar");
    if (sidebarBtn.parentElement !== toolbar) toolbar.prepend(sidebarBtn);
  }

  mediaBtn.hidden = !showMediaBtn;
  const toolbarHasButton = (showSidebarBtn && !topToggle) || showMediaBtn;
  toolbar.hidden = !toolbarHasButton;
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
  root.classList.toggle("tgx-left-collapsed", on && SITE === "telegram" && !settings.tgSidebar);
  root.classList.toggle("tgx-hide-media", hide);

  // Tắt ẩn media → xoá dấu "đã hiện" để lần bật sau mọi thứ ẩn lại từ đầu.
  if (lastHide && !hide) clearReveals();
  lastHide = hide;

  updateToolbar();
  disguiseTitle(on ? (FAKE_TITLES[theme] ?? null) : null);
  disguiseIcon(on ? (FAKE_ICONS[theme] ?? null) : null);
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
