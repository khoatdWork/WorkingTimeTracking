# Đủ giờ — thiết kế

Theo cấu trúc và ngôn ngữ thiết kế QuanLyTaiSan: mobile 320–430px, max-width 480px trên desktop, Be Vietnam Pro, shadcn Radix Nova. Không tạo sidebar desktop.

Tokens: nền #F4F7FB, surface #FFFFFF, chữ #152B46, phụ #53657B, primary #2257C7, border #D8E1EC. Success #087F6D, warning #965100, destructive #B42318. Body 14–16px, số giờ tabular, CTA >=44px. Radius controls 10px, vùng clock 24px, danh sách không shadow từng hàng.

Điểm nhấn là vòng tiến độ theo phút quanh đồng hồ hôm nay, vừa chỉ số giờ vừa cho biết thời điểm đủ giờ. Các tổng tuần/tháng là hai hàng sổ đối chiếu và một lịch tuần, không chia mọi số thành thẻ bằng nhau. Căn trái, đồng hồ căn giữa, số trong ledger căn phải. Màu luôn đi cùng nhãn chữ.

```
Đủ giờ                              Trên thiết bị
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
