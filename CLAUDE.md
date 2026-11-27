# CLAUDE.md

Toàn bộ quy tắc, thiết kế, quyết định và trạng thái của dự án nằm ở AGENTS.md, nạp ngay dưới đây.
Mọi agent dùng chung một nguồn, nên sửa quy tắc thì sửa ở AGENTS.md, không sửa ở đây.

@AGENTS.md

## Thêm cho Claude Code

- Trả lời người dùng bằng tiếng Việt, xưng "tôi / bạn". Báo cáo mở đầu bằng "làm được gì" theo
  hành vi người dùng thấy, rồi mới tới file đã sửa.
- Chưa kiểm trên trang thật thì phải nói rõ là chưa kiểm. Đừng viết như thể đã chạy được.
- Cần xác minh selector Telegram thì clone `morethanwords/tweb` vào thư mục tạm (scratchpad), không
  clone vào repo này. Chỉ đọc và grep, không chạy script hay build trong đó.
- **Không tự tạo artifact** (trang claude.ai, Claude Docs, dashboard…) khi chưa hỏi và được
  người dùng đồng ý. Kể cả khi nội dung là báo cáo, kế hoạch hay review để chia sẻ.
- **Mặc định viết nội dung vào trong dự án**: kế hoạch, ghi chú, báo cáo… lưu thành file
  Markdown trong repo (thường là `docs/`), không đưa lên dịch vụ ngoài. Chỉ tạo artifact khi
  người dùng yêu cầu rõ.
- Sửa xong: cập nhật bảng "Trạng thái triển khai" và "Quyết định đã chốt" trong AGENTS.md nếu có
  thay đổi, rồi tăng `version` trong `manifest.json`.
