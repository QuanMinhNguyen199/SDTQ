# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Người dùng quản lý dữ liệu tổ chức nội bộ. Các vai trò biên tập, thẩm định, quản trị và chỉ xem được đề xuất trong BRD; chưa xác nhận cơ cấu nhân sự thực tế.

## Product Purpose

Quản lý dữ liệu tổ chức nhiều cấp và thể hiện quan hệ bằng sơ đồ 3D. Mỗi đơn vị ở mọi cấp, kể cả đơn vị gốc, có nhiệm vụ và quyền hạn riêng. Đơn vị con khác với nhiệm vụ con.

## Operating Context

Đã có BRD, SRS và đặc tả thiết kế chi tiết Markdown bằng tiếng Việt. Người dùng đã yêu cầu triển khai sơ đồ 3D theo `design.md`; ứng dụng giao diện nằm trong `src`, chạy tại máy bằng Next.js App Router + TypeScript. Dữ liệu mặc định trích từ graph_toan_canh.html; có thể chỉnh sửa trong phiên và xuất/nhập JSON. Chưa có backend. Spline tạm hoãn.

## Capabilities and Constraints

Triển khai giao diện dùng React, React Three Fiber + Drei + Post-processing, Tailwind CSS, Motion (motion.dev), Zustand, Next.js và nguyên tắc Impeccable. Spline tạm hoãn theo yêu cầu người dùng (15/10/2026); khối dựng bằng primitive R3F. Backend, hạ tầng và SSO chưa triển khai. Xuất/nhập JSON là lưu trữ file cục bộ, không phải đồng bộ hoặc duyệt dữ liệu trên máy chủ.

## Evidence on Hand

- graph_toan_canh.html: sơ đồ Ban Tổ chức Trung ương bằng vis-network (SHA-256 khớp SRS). Theo yêu cầu người dùng ngày 15/10/2026, đây là bộ dữ liệu mặc định của ứng dụng (19 đơn vị, 135 nhiệm vụ, 47 ý con, 57 quyền hạn). Chưa đối chiếu văn bản quy định hiện hành; 12 quan hệ nét đứt chưa rõ nghĩa.
- Bài Báo Chính phủ ngày 19/02/2025 về Chính phủ nhiệm kỳ 2021–2026.
- Bài Thư Viện Pháp Luật ngày 19/06/2025 về sơ đồ bộ máy nhà nước.
- Hai nguồn web là tư liệu tham chiếu theo thời điểm, không xác nhận tình trạng hiện hành năm 2026.

## Brand Commitments

Theme phải dựa trên logo trong `assets` theo yêu cầu người dùng. Bốn biến thể hiện có: `logo-ruby.png`, `logo-navy.png`, `logo-charcoal.png`, `logo-dark.png`. Nhận diện gồm đỏ, navy/charcoal và trắng. Quy tắc sử dụng và token UI được đặc tả trong `design.md`; Light Ruby mặc định và Dark Navy bổ sung là đề xuất thiết kế, chưa phải lựa chọn theme được xác nhận riêng.

Yêu cầu ngày 16/10/2026: dùng hướng tham chiếu Pantone cho palette ruby–navy, typography Manrope cho tiêu đề và Be Vietnam Pro cho nội dung; phân bổ nhóm màu theo quy tắc 60–30–10. Màu Pantone trong design.md là hướng tham chiếu, token HEX là mô phỏng sRGB. Font được đóng gói cùng ứng dụng. Giao diện dùng nhãn chữ thay icon theo yêu cầu trước đó.

Người dùng yêu cầu tăng cỡ chữ, thêm màu trang trí và animation cho sơ đồ. Cỡ chữ triển khai: nội dung 16px, đơn vị trong cây/2D 15px, tiêu đề hồ sơ 28px. Theo điều chỉnh tiếp theo, nhãn trong 3D giữ cỡ nhỏ ban đầu: tên 12px, loại/mã 10px, nút nhánh 11px. Màu phụ phân biệt loại đơn vị; chuyển động hữu hạn khi mở nhánh/chọn, giữ hỗ trợ reduced motion.

## Product Principles

- Mỗi quan hệ phải có ngữ nghĩa và nguồn; bố cục không được tự tạo quan hệ tổ chức.
- Phân biệt phạm vi tổ chức khi dùng nhiều nguồn; không bắt buộc ba bộ dữ liệu cố định theo tài liệu tham khảo.
- Dữ liệu quản lý phải đọc và thao tác được ngoài canvas 3D.
- Mọi chỉnh sửa phải truy vết đến người thực hiện và phiên bản.

Top nav đã được đưa về cỡ chữ gọn trước đó (tiêu đề 17px, nút 12px), dùng logo-dark.png có kênh alpha trên nền navy.

Sidebar đã giảm theo yêu cầu để đồng bộ: tên đơn vị và ô tìm kiếm 13px, tiêu đề 14px, nhãn phụ 11px, nút 12px.

## Journey mode — 16/10/2026

Chế độ trải nghiệm trên navbar, dùng cùng store và dữ liệu tổ chức; có camera chuyển trạm, tìm kiếm, lọc cụm/cấp và hồ sơ bốn tab. Bộ dữ liệu doanh nghiệp minh họa riêng gồm 13 đơn vị. Quay về sơ đồ khôi phục trạng thái quản lý trước đó.


## Explore mode — thay Journey, 16/10/2026

Người dùng đã chốt trải nghiệm tòa nhà ở góc nhìn thứ nhất: chọn cửa để vào đơn vị; vào thang máy để zoom ra toàn nhà, chọn tầng rồi zoom về cabin và mở cửa. Đơn vị gốc ở tầng cao nhất, phân cấp xuống dưới; mỗi sảnh chỉ chứa các đơn vị thuộc đúng nhánh. Explore thay Journey, dùng dữ liệu làm việc hiện có và không dùng chuỗi trạm ngang hàng. Giữ nhận diện và cách viết ngắn gọn của prototype.
