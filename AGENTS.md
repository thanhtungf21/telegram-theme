# AGENTS.md: Chat Theme extension

Tài liệu cho người hoặc AI agent sửa dự án này: quy tắc, thiết kế, các quyết định đã chốt,
trạng thái triển khai. Hướng dẫn cho người dùng cuối nằm ở [README.md](README.md).

## 1. Dự án là gì

Extension Manifest V3 chỉ đổi **giao diện** của Messenger web và Telegram Web K: đổi kiểu (Telegram,
review code, chat với AI), ẩn media, thu gọn sidebar, đổi tiêu đề tab.

- Không có build, không có dependency, không có test tự động. Code là JS và CSS thuần.
- Muốn thử thì nạp thư mục bằng "Load unpacked", sửa xong bấm ↻ rồi tải lại tab.

## 2. Quy tắc bắt buộc

1. **Chỉ đổi giao diện.**
   - Không đọc, lưu hay gửi nội dung tin nhắn. Không gọi mạng. Không thêm quyền ngoài `storage`.
   - Không đổi logic trang: gửi tin, chặn request, tự động hoá thao tác.
2. **Không dùng tài sản thương hiệu.**
   - Không logo, icon, tên sản phẩm hay ảnh gốc của Telegram, GitHub, GitLab, Claude, ChatGPT, Zalo.
   - Chỉ mô phỏng phong cách: màu, bố cục, font.
   - Hoa văn nền phải tự vẽ bằng SVG.
   - Chữ giả (tiêu đề tab, nhãn) không chứa tên sản phẩm.
3. **CSS trước, JS tối thiểu (mức 1).**
   - JS chỉ được làm 5 việc: gắn class lên `<html>`, đổi tiêu đề tab, đổi icon tab, chặn cú bấm đầu vào media đang ẩn, và thanh nút nổi.
   - **Không** di chuyển, sắp lại hay xoá DOM của trang. Đó là "mức 2", vỡ mỗi khi trang cập nhật.
4. **Mọi luật CSS phải có tiền tố `html.tgx-on`** (hoặc class `tgx-*` khác do JS gắn). Nhờ vậy tắt extension là trang về nguyên bản.
5. **Thứ tự ưu tiên khi chọn cách bám trang:**
   1. Ghi đè biến CSS của trang.
   2. Landmark trợ năng (`role`, `aria-*`).
   3. Class đọc được và ổn định.
   - **Cấm** bám class bị băm hoặc làm rối, như `x1n2onr6` của Meta hay class CSS Modules của tweb.
6. **Telegram ghi bảng màu bằng JS thành style inline trên `<html>`.** Mọi ghi đè biến của Telegram phải có `!important`, nếu không thì style inline thắng.
7. **Selector Telegram phải đối chiếu mã nguồn tweb** (repo `morethanwords/tweb`), không được đoán.
   - Khi đổi selector, ghi ngày hoặc commit đã đối chiếu vào comment đầu file.
   - Cách kiểm: clone sparse `src/scss` + `src/components` ra **ngoài repo**, rồi grep.
8. **Khối chưa kiểm hoặc dễ vỡ** phải tách riêng và ghi `THỬ NGHIỆM` trong comment, để xoá được cả khối mà không ảnh hưởng phần khác.
9. **Comment viết bằng tiếng Việt và giải thích lý do (why)**, không dịch lại cú pháp. Sửa logic thì sửa comment theo.
10. **Giữ đồng bộ các danh sách sau** (sửa một chỗ phải sửa đủ):

| Thứ | Có ở |
| --- | --- |
| `DEFAULTS` (khoá cài đặt + giá trị mặc định) | `src/content.js`, `popup/popup.js`, id các ô trong `popup/popup.html` |
| Danh sách kiểu | `THEMES`, `THEME_CLASSES`, `FAKE_TITLES`, `FAKE_ICONS` trong `src/content.js`; `<option>` trong popup; `css` của `manifest.json` |
| Media cần ẩn và vùng bấm để xem | `themes/hide-media.css` và `MEDIA_CLICK` / `MESSAGE_SCOPE` trong `src/content.js` |

## 3. Cấu trúc

```text
manifest.json                 2 khối content_scripts: Messenger và Telegram K, mỗi khối nạp bộ CSS riêng
src/content.js                gắn class lên <html>, đổi tiêu đề tab, bấm-để-xem media, thanh nút, phím tắt
popup/                        bảng cài đặt (chrome.storage.sync)
themes/hide-media.css         ẩn media, dùng chung 2 trang
themes/toolbar.css            thanh nút nổi, dùng chung
themes/messenger/base.css     luật Messenger dùng chung, chỉ đọc biến --tgx-*
themes/messenger/{telegram,github,ai}.css   bảng màu và luật riêng từng kiểu
themes/telegram-web/base.css  Telegram K dùng chung: bỏ ảnh nền, cột liền mạch, thư mục, thu gọn sidebar
themes/telegram-web/{github,ai}.css         từng kiểu: bảng màu, ghi đè biến Telegram, bố cục
```

### Class trên `<html>` do `content.js` gắn

| Class | Khi nào |
| --- | --- |
| `tgx-site-messenger` / `tgx-site-telegram` | Luôn gắn, theo trang |
| `tgx-on` | Extension bật và đang ở trang chat |
| `tgx-styled` | `tgx-on` và kiểu khác "Giữ nguyên" (Telegram) |
| `tgx-theme-<tên>` | Kiểu đang chọn: `telegram`, `github`, `ai` (Claude) |
| `tgx-wallpaper` | Messenger, bật ảnh nền |
| `tgx-left-collapsed` | Telegram, sidebar đang thu gọn |
| `tgx-hide-media` / `tgx-reveal-all` | Đang ẩn media / đang tạm hiện tất cả |

Thuộc tính `data-tgx-revealed` gắn lên tin nhắn đã bấm xem. Dùng attribute thay vì class vì trang
vẽ lại `className` thì class lạ sẽ mất.

### Luồng chạy

- `content.js` chạy ở `document_start`. Nó đọc `chrome.storage.sync` rồi `apply()`.
- `storage.onChanged` gọi lại `apply()`, nên đổi cài đặt trong popup là trang đổi ngay.
- `setInterval(apply, 500)` chạy liên tục, vì ba lý do:
  - Trang là SPA, content script không nghe được `pushState`.
  - Trang có thể ghi đè class của `<html>` hoặc tiêu đề tab.
  - Lúc `document_start` thì `<body>` chưa có để gắn thanh nút.
- `apply()` chỉ toggle class và so chuỗi, nên chạy lặp rất rẻ.

## 4. Quyết định đã chốt

| Ngày | Quyết định | Lý do |
| --- | --- | --- |
| 2026-11-27 | Làm "mức 1" (CSS) thay vì "mức 2" (sắp lại DOM) | Meta và Telegram đổi DOM thường xuyên. Mức 1 hỏng thì chỉ lệch màu, không làm trang không dùng được |
| 2026-11-27 | Bỏ kiểu Zalo | Người dùng không cần |
| 2026-11-27 | Thêm kiểu Review code, đổi tiêu đề tab | Mục đích chính là nhìn qua màn hình không thấy là đang chat |
| 2026-11-27 | Ẩn media bằng `filter: blur` mạnh, không dùng `display:none` | Giữ chỗ trống nên khung chat không nhảy. Áp được cho cả `img`, `video`, `canvas` |
| 2026-11-27 | Bấm vào media thì hiện **cả tin**, không riêng phần tử | Một ảnh có nhiều lớp (thumbnail, ảnh thật, spoiler), hiện một lớp thì vẫn không thấy |
| 2026-11-27 | Telegram **chỉ hỗ trợ bản K** (`/k/`), bỏ bản A | Người dùng chỉ dùng K. Bản A dùng nhiều class bị băm |
| 2026-11-27 | Bỏ ảnh nền Telegram bằng cách ẩn `body > div[aria-hidden]:first-child` và làm cột liền mạch | Ảnh nền là lớp dưới cùng của body (`chatBackground.tsx`). Cột bản K có khoảng hở và bo góc nên nền lộ ở mép |
| 2026-11-27 | Thu gọn sidebar tự làm (`display:none` cột trái) thay vì dùng chế độ "collapsed" có sẵn của Telegram | Chế độ có sẵn chỉ còn avatar, mà kiểu AI lại ẩn avatar, nên sẽ thành cột trống |
| 2026-11-27 | Kiểu AI bám sát Claude web (màu, kích thước, vị trí nút); vẫn không dùng logo | Người dùng yêu cầu giống bản web thật |
| 2026-11-27 | Gộp 2 tông AI thành một kiểu Claude; giá trị cũ `ai-neutral` tự đổi sang `ai` | Người dùng chỉ cần kiểu Claude |
| 2026-11-27 | Ẩn media mặc định bật; Telegram thay media bằng ô "đã ẩn" gọn thay vì làm mờ | Ô mờ to bằng ảnh trông như lỗi và vẫn lộ hình khối |
| 2026-11-27 | Tin ghim giữ nguyên chiều cao gốc, chỉ đổi dáng | Telegram dùng chiều cao đó để đẩy danh sách tin; đổi là bị chồng |

## 5. Trạng thái triển khai (2026-11-27, bản 0.9.0)

| Phần | Trạng thái |
| --- | --- |
| Khung extension, popup, lưu cài đặt | Xong |
| Telegram K: Review code, kiểu Claude, tin ghim, tab thư mục, ô media đã ẩn (0.10.0), bỏ ảnh nền, thu gọn sidebar, ẩn media | Selector đã đối chiếu mã nguồn tweb 2026-11-24. **Chưa kiểm trên trang thật** sau lần sửa này |
| Messenger: 3 kiểu, ẩn media | Selector **đoán theo hiểu biết**, chưa kiểm DOM thật. Tên biến màu của Meta chưa xác nhận |
| Messenger: màu riêng cho tin của mình | **Chưa làm.** Cần tìm selector phân biệt (xem `themes/messenger/base.css` mục 4) |
| Đổi tiêu đề tab | Xong |
| Kiểu Chat AI bám sát Claude web (0.9.0) | Bảng màu kem/cam đất, sidebar 288px, dòng chat 32px, ô nhập bo 20px, nút gửi vuông bo; nút thu gọn sidebar dạng icon góc trên trái. Số đo theo hiểu biết, chưa đo trực tiếp |
| Đổi icon tab | Xong (bản 0.8.0). Ghi đè href của `link[rel~=icon]` mỗi 500ms, cất href thật vào `data-tgx-real-href` |
| Ẩn ảnh preview link (Telegram K) | Thêm `.webpage-preview(-resizer)`, `.webpage-thumb` ở bản 0.8.0, chưa kiểm trên trang thật |

## 6. Cách làm các việc thường gặp

**Thêm một kiểu:**
1. Tạo file CSS trong `themes/messenger/` và/hoặc `themes/telegram-web/`. Đặt bảng màu dưới `html.tgx-on.tgx-theme-<tên>`, chế độ tối dưới `.night` (Telegram) hoặc `.__fb-dark-mode` (Messenger).
2. Thêm file vào `css` của khối tương ứng trong `manifest.json`.
3. Thêm `<tên>` vào `THEMES[site]` và `THEME_CLASSES`. Thêm `FAKE_TITLES[<tên>]` nếu muốn đổi tiêu đề tab.
4. Thêm `<option>` vào popup.

**Sửa selector Telegram:** clone sparse tweb ra ngoài repo, tìm class trong `src/scss` và `src/components`, sửa CSS, rồi cập nhật ngày đối chiếu ở comment đầu file.

**Sửa selector Messenger:** mở DevTools trên trang thật. Chỉ bám `role`, `aria-*`, `dir`, thuộc tính `src` hoặc biến CSS, không bám class.

**Kiểm tra sau khi sửa:** hiện chưa có test tự động. Kiểm tay trên trang thật:
- Bật/tắt extension, đổi từng kiểu, chế độ sáng/tối của trang.
- Bật ẩn media: bấm một ảnh, dùng nút "Hiện media".
- Thu gọn/mở sidebar, mở chat có ảnh, sticker, preview link, trả lời có ảnh.
