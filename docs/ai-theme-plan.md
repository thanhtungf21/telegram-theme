# Kế hoạch chỉnh theme Chat với AI

Theme dùng nền ấm, chữ serif cho tin nhận và nút gửi cam đất để gợi phong cách Claude. Telegram Web K là nơi triển khai bố cục đầy đủ. Messenger dùng cùng hệ màu và font, với bố cục cột giữa hiện có. Việc phân biệt tin gửi và tin nhận trên Messenger cần selector ổn định đã kiểm tra trên DOM thật.

Kích thước bên dưới lấy từ theme hiện tại. [Artifact tham chiếu](https://claude.ai/artifact/888Nc9Bdt4GuiAnFDJ36qM#871f1437-fbd1.m1zn7kfrn43.1813) cần được đối chiếu trước khi chốt các số đo theo mockup.

## Telegram Web K

- Giữ cột chat tối đa 768 px và ô nhập bo 20 px. Dùng chiều rộng sidebar do Telegram tính để cột chat nằm đúng chỗ khi kéo giãn sidebar hoặc mở panel thông tin. Dùng chung lề cho ô nhập, tin nhắn và thanh ghim, với lề nhỏ hơn trên cửa sổ hẹp.
- Giữ phần đầu chat phẳng và tên cuộc hội thoại thật. Bỏ dấu giống nút chọn model và dòng nhắc về câu trả lời AI dưới ô nhập. Giữ nút tìm kiếm, đính kèm, gửi tin và thu gọn sidebar. Từ 926 px, dùng nút thu gọn góc trên trái. Dưới mốc này, đưa nút về thanh dưới để chừa chỗ cho nút quay lại.
- Giữ chiều cao gốc của thanh ghim vì Telegram dùng chiều cao đó để đặt danh sách tin. Giữ luồng bấm lần đầu để hiện media và lần sau để mở trình xem.

## Messenger

- Áp bảng màu ấm sáng và tối, font hệ thống và nền trơn cho theme Chat với AI. Tận dụng các biến và landmark có sẵn, giới hạn thay đổi trong theme `ai`.

## Tiêu chí nghiệm thu

- Kiểm tra sáng và tối, cửa sổ rộng và hẹp, sidebar mở và đóng, panel thông tin bên phải mở. Ô nhập và tin nhắn thẳng hàng, thanh ghim không đè lên tin. Dùng bàn phím để kiểm tra nút thu gọn và các nút sẵn có.
- Kiểm tra tìm kiếm, đính kèm và gửi tin. Thử ảnh, sticker, preview link, tin trả lời có ảnh, nút hiện toàn bộ media và phím tắt.
- Đổi sang kiểu khác và tắt extension để kiểm tra màu, bố cục, tiêu đề và icon tab trở về trạng thái tương ứng. Khi thêm hoặc đổi selector Telegram, đối chiếu [mã nguồn tweb](https://github.com/morethanwords/tweb) và ghi commit ở đầu file CSS.
