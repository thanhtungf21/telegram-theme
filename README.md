# Chat Theme: đổi giao diện Messenger web và Telegram Web K

Extension cho Chrome, Edge và Cốc Cốc (Manifest V3). Đổi giao diện chat trên web để nhìn như đang
**review code** hoặc đang **chat với trợ lý AI**. Có thêm công tắc **ẩn ảnh, sticker, preview link**,
và nút **thu gọn sidebar** cho Telegram.

- Extension chỉ đổi giao diện. Nó không đọc, không lưu, không gửi nội dung tin nhắn đi đâu, và không gọi mạng.
- Extension chỉ xin một quyền là `storage`, dùng để nhớ cài đặt.
- Extension không dùng logo, icon hay tên sản phẩm của Telegram, GitHub, GitLab, Claude hay ChatGPT. Nó chỉ mô phỏng phong cách.

## Hỗ trợ trang nào

| Trang | Kiểu có sẵn |
| --- | --- |
| `messenger.com` và `facebook.com/messages/…` | Telegram · Review code · Chat với AI |
| `web.telegram.org/k/` (**chỉ bản K**) | Review code · Chat với AI · Giữ nguyên |

Bản `web.telegram.org/a/` **không** được hỗ trợ. Hãy chuyển sang `/k/` trong cài đặt của Telegram.
News Feed của Facebook không bị ảnh hưởng.

## Cài đặt

1. Mở `chrome://extensions` và bật **Developer mode**.
2. Bấm **Load unpacked** rồi chọn thư mục này.
3. Mở trang chat, bấm icon extension để chọn kiểu.

Mỗi lần sửa code: bấm nút ↻ của extension ở `chrome://extensions`, rồi tải lại tab chat.
Extension không cần build.

## Cách dùng

### Popup

| Mục | Tác dụng |
| --- | --- |
| Bật extension | Tắt thì trang trở về nguyên bản ngay, không cần tải lại |
| Messenger: Kiểu, Ảnh nền | Chọn kiểu cho Messenger. Ảnh nền chỉ áp cho kiểu Telegram |
| Telegram: Kiểu | Chọn kiểu cho Telegram K |
| Telegram: Hiện sidebar | Mở hoặc thu gọn cột danh sách chat |
| Ẩn ảnh, sticker, preview link | Làm mờ toàn bộ media, bấm vào mới xem |

### Thanh nút góc dưới trái và phím tắt

| Nút | Phím | Tác dụng |
| --- | --- | --- |
| ☰ Ẩn/Hiện sidebar | `Alt+Shift+S` | Thu gọn hoặc mở sidebar (Telegram K). Extension nhớ trạng thái cho lần sau |
| Hiện media / Ẩn media | `Alt+Shift+M` | Hiện tạm tất cả media đang ẩn, hoặc ẩn lại tất cả |

Ẩn media **bật sẵn**. Trên Telegram, ảnh, video, GIF, sticker, ảnh xem trước link hiện thành ô "… đã ẩn · Bấm để xem"; bấm vào ô thì **cả tin đó** hiện ra. Lần bấm này không mở trình xem ảnh.
Bấm lần nữa mới mở như bình thường.

## Các kiểu giao diện

**Review code** (Messenger, Telegram):
- Nền trắng hoặc xám như trang diff, chữ tin nhắn là monospace.
- Tin của mình có nền xanh và vạch bên trái, giống dòng `+` trong diff.
- Có số dòng ở lề (đang thử nghiệm).
- Tiêu đề tab đổi thành `Files changed · refactor/auth-session`.

**Chat với AI** (đầy đủ trên Telegram K):
- Sidebar thành "lịch sử hội thoại": có nhãn "Gần đây", mỗi chat chỉ một dòng, không avatar, không xem trước tin. Chat chưa đọc in đậm kèm một chấm.
- Thanh đầu chat phẳng, hiển thị tên cuộc hội thoại.
- Tin nhắn và ô nhập thẳng hàng trong cột giữa rộng tối đa 768px. Tin nhận dùng chữ serif, tin gửi có nền riêng và bo góc.
- Nền kem ở chế độ sáng, nền xám ấm ở chế độ tối. Ô nhập bo 20px, nút gửi vuông bo màu cam đất.
- Nút thu gọn sidebar ở góc trên trái trên cửa sổ rộng. Trên cửa sổ hẹp, nút nằm trong thanh dưới.
- Tin ghim, tab thư mục và ngày phân cách được làm nhạt cho hợp bố cục. Theme ẩn dải story.
- Tiêu đề tab: `Tối ưu truy vấn MongoDB có index`.
- Trên Messenger dùng cùng tông ấm cho màu, font và nền, với bố cục cột giữa hiện có.

**Telegram** (chỉ cho Messenger): màu, bong bóng và nền hoa văn kiểu Telegram.

Mọi kiểu đều theo chế độ sáng/tối mà bạn đang chọn trong Facebook hoặc Telegram.

## Giới hạn đã biết

- Kiểu Review code và Chat với AI đổi cả **icon tab** (icon tự vẽ, không phải logo sản phẩm nào).
- Địa chỉ trên thanh URL không đổi được. Phần mềm giám sát của công ty vẫn thấy bạn đang vào Facebook hoặc Telegram.
- **Messenger:** Meta dùng tên class bị làm rối và đổi thường xuyên.
  - Chưa tách được tin của mình với tin người khác.
  - Ẩn media sẽ ẩn cả avatar trong khung chat.
  - Nhiều phần trên Messenger chưa được kiểm trên trang thật.
- **Telegram K:**
  - Selector được đối chiếu với mã nguồn tweb ngày 2026-11-24. Telegram cập nhật thì có thể lệch.
  - Các khối `THỬ NGHIỆM` có thể gỡ riêng nếu gây lệch bố cục.

## Giấy phép

MIT. Xem [LICENSE](LICENSE).

## Sửa và mở rộng

Đọc [AGENTS.md](AGENTS.md) để biết cấu trúc, quy tắc và các quyết định thiết kế.
Thêm kiểu mới, sửa selector hay thêm trang mới đều có hướng dẫn trong đó.
Phạm vi và tiêu chí kiểm tra theme Chat với AI nằm trong [kế hoạch chỉnh theme](docs/ai-theme-plan.md).
