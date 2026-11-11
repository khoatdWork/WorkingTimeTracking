# Đủ giờ — thiết kế

Theo cấu trúc và ngôn ngữ thiết kế QuanLyTaiSan: mobile 320–430px, max-width 480px trên desktop, Be Vietnam Pro, shadcn Radix Nova. Không tạo sidebar desktop.

Tokens: nền #F4F7FB, surface #FFFFFF, chữ #152B46, phụ #53657B, primary #2257C7, border #D8E1EC. Success #087F6D, warning #965100, destructive #B42318. Body 14–16px, số giờ tabular, CTA >=44px. Radius controls 10px, vùng clock 24px, danh sách không shadow từng hàng.

Điểm nhấn là vòng tiến độ theo phút quanh đồng hồ hôm nay, vừa chỉ số giờ vừa cho biết thời điểm đủ giờ. Các tổng tuần/tháng là hai hàng sổ đối chiếu và một lịch tuần, không chia mọi số thành thẻ bằng nhau. Căn trái, đồng hồ căn giữa, số trong ledger căn phải. Màu luôn đi cùng nhãn chữ.

```
Đủ giờ
Hôm nay    Lịch sử    Báo cáo    Cài đặt
Thứ Hai, 09 tháng 11                 Đang làm
[ Văn phòng | Work from home ]
          vòng tiến độ
           06:42:18
    [Đã lên công ty / Tạm dừng / Đã về]
    Nghỉ trưa 60 phút · Đủ giờ lúc …
WFH request chưa gửi (chỉ hiện khi WFH)
Tuần này                  6 giờ / 40 giờ
T2  T3  T4  T5  T6  T7  CN
Tháng này        mục tiêu / đã làm / còn lại
```

Review trước build: giữ palette/mobile của project tham chiếu theo yêu cầu; dùng clock có hành động thay vì hero marketing. Badge và trạng thái có nghĩa nghiệp vụ. Không tạo dữ liệu mẫu mặc định. Màn rỗng chỉ dẫn bấm bắt đầu hoặc bổ sung giờ. Loading/error riêng, focus rõ, hỗ trợ reduced motion.

P6: theo yêu cầu09/11/2026, Cài đặt là tab thứ tư ngay sau Báo cáo ở thanh điều hướng dưới; bỏ nút bánh răng trên header. Ngày nghỉ lễ có Từ ngày/Đến ngày (tính cả hai đầu), tên tùy chọn và danh sách theo tháng. Form giữ một cột để ngày vẫn dễ chọn ở320px, không thêm bộ chọn hoặc thư viện lịch riêng.

P7: Nghỉ phép xuất hiện ngay sau phần chấm công ở Hôm nay. Mặc định chỉ hiện nút Thêm ngày nghỉ phép và danh sách theo tháng; mở form mới hiện Từ ngày/Đến ngày, mặc định ngày mai Việt Nam và ghi chú tùy chọn. Dùng chung bố cục một cột, native date, Be Vietnam Pro và palette hiện tại (#F4F7FB nền, #FFFFFF surface, #152B46 chữ, #53657B phụ, #2257C7 hành động, #D8E1EC viền). Không thêm điều hướng hoặc thư viện. Ngày hiện tại nghỉ phép/lễ hiện thông báo thay đồng hồ, vẫn có Chỉnh sửa ngày. Lịch tuần ghi P kèm chú giải Nghỉ phép; danh sách giữ nhãn chữ/ghi chú và đường kẻ sẵn có.

P8: theo yêu cầu10/11/2026, Cài đặt theo kiểu danh sách nhóm của iPhone. Giữ nền #F4F7FB, nhóm #FFFFFF, chữ #152B46/phụ #53657B, hành động #2257C7 và viền #D8E1EC; icon dùng blue/green/slate hiện có. Be Vietnam Pro, một cột max480px, chữ căn trái, chevron căn phải. Ba nhóm có ý nghĩa: tài khoản; quy tắc giờ/ngày lễ; ứng dụng/bản sao lưu. Mỗi hàng cao tối thiểu76px, icon màu, tên và tóm tắt ngắn; không thêm shadow từng hàng. Chạm hàng mở duy nhất phần chỉnh sửa tương ứng, có Quay lại Cài đặt; tab dưới luôn dùng được. Giữ form sẵn có, nhắc trước khi bỏ nháp và mở thẳng Cài ứng dụng từ thông báo cập nhật. Review trước build: danh sách nhóm đáp ứng yêu cầu iPhone và rút ngắn màn đầu; không thêm công tắc hoặc điều hướng mới không có chức năng.

P9: theo yêu cầu11/11/2026, nhãn nơi lưu và các trạng thái local/Firebase/mất mạng chỉ nằm tại Cài đặt → Tài khoản & đồng bộ, cùng nút Thử đồng bộ lại. Header chỉ giữ thương hiệu; Hôm nay/Lịch sử/Báo cáo không có thông báo lưu trữ thường trực. Tái sử dụng panel, màu/chữ/role status hiện có; thông báo nằm trong chiều rộng panel và xuống dòng ở320px. Thông báo cập nhật ứng dụng vẫn có hành động mở Cài ứng dụng; lỗi lưu/mở sổ và phản hồi thao tác giữ nguyên.
