# BRD — Hệ thống dữ liệu và sơ đồ 3D bộ máy hệ thống chính trị

| Thuộc tính | Giá trị |
| --- | --- |
| Mã tài liệu | SDTQ-BRD |
| Phiên bản | 0.3 — dự thảo để rà soát |
| Ngày cập nhật | 16/10/2026 (bản 0.2 và 0.1: 15–16/10/2026) |
| Ngôn ngữ | Tiếng Việt |
| Tài liệu liên quan | [SRS](SRS.md), [Thiết kế 3D](THIET_KE_SO_DO_3D.md) |
| Thay đổi so với 0.2 | Ghi nhận phản hồi đầu tiên trên bản mẫu (mục 2.2); mục tiêu B-08 về điều hướng sơ đồ; phạm vi bản trình diễn công khai (mục 5.5); quy tắc R-15 về chức năng thử nghiệm; rủi ro và câu hỏi Q-08, Q-09 |
| Thay đổi so với 0.1 | Đổi đối tượng từ "cơ cấu phòng ban" sang bộ máy cấp quốc gia; bổ sung căn cứ Nghị quyết 203/2025/QH15, cơ cấu Chính phủ, chính quyền địa phương hai cấp, quan hệ có loại, chiều thời gian, an toàn thông tin |

## 1. Bối cảnh và vấn đề nghiệp vụ

Hệ thống phục vụ việc lưu giữ, tra cứu và trình bày cơ cấu tổ chức của bộ máy cấp quốc gia: các cơ quan nhà nước theo Hiến pháp, Chính phủ cùng các bộ và cơ quan ngang bộ, chính quyền địa phương, và các cơ quan khác trong hệ thống chính trị. Với mỗi cơ quan và đơn vị bên trong, hệ thống lưu chức năng, nhiệm vụ và quyền hạn.

Bài toán này khác cơ cấu phòng ban của một tổ chức ở năm điểm. Mỗi điểm dẫn tới yêu cầu riêng trong tài liệu:

| Đặc điểm | Bằng chứng | Hệ quả với hệ thống |
| --- | --- | --- |
| Cơ cấu và thẩm quyền được xác lập bằng văn bản pháp lý | Nghị quyết 203/2025/QH15 sửa trực tiếp các điều của Hiến pháp về đơn vị hành chính và chính quyền địa phương (SRC-NQ203) | Mỗi cơ quan, nhiệm vụ, quyền hạn và quan hệ phải có căn cứ; dữ liệu không có căn cứ không được duyệt (R-01) |
| Quan hệ giữa các cơ quan có nhiều loại, không chỉ "trực thuộc" | Trên sơ đồ SRC-NN, Chủ tịch nước, Chính phủ, Tòa án nhân dân tối cao và Hội đồng bầu cử quốc gia đều nối với Quốc hội bằng cùng kiểu đường, không có chú giải ý nghĩa | Quan hệ phải có loại và hướng; không suy loại quan hệ từ đường vẽ (R-03, R-04) |
| Cơ cấu thay đổi theo mốc pháp lý | Từ 01/7/2025 kết thúc hoạt động của đơn vị hành chính cấp huyện; đơn vị hành chính tổ chức thành hai cấp (SRC-NQ203) | Phải xem được cơ cấu tại một ngày; dữ liệu trước mốc không bị xóa (R-06, R-07) |
| Cơ quan được hợp nhất, đổi tên theo đợt sắp xếp | Danh sách bộ tại mốc 19/02/2025 có các tên như "Bộ Nông nghiệp và Môi trường", "Bộ Dân tộc và Tôn giáo" (SRC-CP) | Lưu quan hệ kế thừa (hợp nhất, chia, đổi tên) để truy được cơ quan tiền thân (R-08) |
| Dữ liệu thuộc khu vực nhà nước, cần kiểm soát truy cập và nguồn | Diễn giải từ tính chất dữ liệu; chưa có văn bản phân loại cụ thể cho hệ thống này | Phải xác định cấp độ an toàn thông tin và phạm vi dữ liệu được phép trước triển khai (mục 8, Q-04) |

Phạm vi và các vai trò bên dưới là **đề xuất** cần chủ sở hữu nghiệp vụ rà soát. Tài liệu không xác nhận pháp lý và không thay thế văn bản gốc.

## 2. Nguồn tham chiếu và giới hạn

| Mã | Nguồn | Sử dụng | Giới hạn |
| --- | --- | --- | --- |
| SRC-NQ203 | Nghị quyết 203/2025/QH15 sửa đổi, bổ sung một số điều của Hiến pháp, Quốc hội thông qua ngày 16/6/2025. Bản tổng hợp do Thư Viện Pháp Luật đăng; văn bản gốc trên [Cổng Xây dựng chính sách, pháp luật — Chính phủ](https://xaydungchinhsach.chinhphu.vn/nghi-quyet-203-2025-qh15-sua-doi-bo-sung-mot-so-dieu-cua-hien-phap-nuoc-cong-hoa-xa-hoi-chu-nghia-viet-nam-119250616181735552.htm) | Đơn vị hành chính hai cấp (Điều 110), chính quyền địa phương (Điều 111), Mặt trận Tổ quốc (Điều 9), Công đoàn (Điều 10), quy định chuyển tiếp về chỉ định chức danh | Tài liệu này dựa trên bản tổng hợp; phải đối chiếu văn bản gốc trước khi dùng làm căn cứ duyệt |
| SRC-NN | [Thư Viện Pháp Luật — Sơ đồ bộ máy nhà nước theo Hiến pháp 2013 (sửa đổi 2025)](https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/so-do-bo-may-nha-nuoc-viet-nam-moi-nhat-nam-2025-theo-hien-phap-2013-sua-doi-2025-nhu-the-nao-511954-222125.html) | Khung các khối cơ quan nhà nước và các cấp | Nguồn tổng hợp, không phải văn bản pháp lý; đường nối trên sơ đồ không có chú giải loại quan hệ |
| SRC-CP | [Báo Chính phủ — Infographics Chính phủ nhiệm kỳ 2021–2026](https://media.chinhphu.vn/infographics-chinh-phu-nhiem-ky-2021-2026-102250218175455942.htm), đăng 19/02/2025 | Cơ cấu thành viên Chính phủ, danh sách bộ và cơ quan ngang bộ tại mốc bài viết | Ảnh chụp tại một mốc; không áp dụng cho thời điểm khác. Bài không ghi số hiệu nghị quyết của Quốc hội |
| SRC-L72 | Luật Tổ chức chính quyền địa phương số 72/2025/QH15, [toàn văn trên Cổng Xây dựng chính sách](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-so-72-2025-qh15-to-chuc-chinh-quyen-dia-phuong-119250618161434371.htm) | Hai cấp đơn vị hành chính: tỉnh, thành phố trực thuộc trung ương; xã, phường, đặc khu | **Chưa đọc toàn văn**; mới biết qua kết quả tìm kiếm. Phải đọc trước khi chốt danh mục cấp |

Tài liệu ghi nhận trạng thái các nguồn tại ngày cập nhật; nguồn chưa xác minh được đánh dấu riêng. Đến 16/10/2026, SRC-CP đã hơn 18 tháng tuổi, và tài liệu **chưa xác minh** cơ cấu Chính phủ hiện hành có thay đổi sau mốc đó hay không. Không gán nhãn "hiện hành" hoặc "mới nhất" cho dữ liệu khởi tạo (R-10).

### 2.1. Dữ kiện đã đọc từ nguồn

**Khung bộ máy nhà nước (SRC-NN, sơ đồ):** Quốc hội; Hội đồng bầu cử quốc gia; Chủ tịch nước; Chính phủ; Tòa án nhân dân tối cao; Viện kiểm sát nhân dân tối cao; Kiểm toán nhà nước. Dưới Chính phủ: bộ, cơ quan ngang bộ → sở; Ủy ban nhân dân cấp tỉnh → cấp xã. Hội đồng nhân dân cấp tỉnh → cấp xã. Tòa án nhân dân và Viện kiểm sát nhân dân: cấp tỉnh và cấp dưới tỉnh.

> Cần đối chiếu: sơ đồ ghi "TAND cấp xã" và "VKSND cấp xã". Phải kiểm tra tên gọi cấp tòa án và viện kiểm sát dưới cấp tỉnh trong luật tổ chức tương ứng sửa đổi năm 2025 trước khi đưa vào danh mục. Không lấy nhãn trên sơ đồ làm tên chính thức.

**Chính quyền địa phương (SRC-NQ203, SRC-L72):** đơn vị hành chính tổ chức thành hai cấp; đơn vị hành chính – kinh tế đặc biệt do Quốc hội thành lập. Cấp chính quyền địa phương gồm Hội đồng nhân dân và Ủy ban nhân dân, tổ chức phù hợp đặc điểm nông thôn, đô thị, hải đảo. Đơn vị hành chính cấp huyện kết thúc hoạt động từ 01/7/2025. Một nguồn tin cho biết từ 01/7/2025 cả nước có 3.321 xã, phường, đặc khu. Con số này **chưa đối chiếu** với nghị quyết sắp xếp và chỉ dùng để ước lượng quy mô.

**Hệ thống chính trị ngoài bộ máy nhà nước (SRC-NQ203):** Mặt trận Tổ quốc Việt Nam là bộ phận của hệ thống chính trị, do Đảng Cộng sản Việt Nam lãnh đạo. Công đoàn Việt Nam là tổ chức chính trị – xã hội, đại diện duy nhất của người lao động ở cấp quốc gia. Hai tổ chức này không thuộc nhánh của cơ quan nhà nước nào.

**Chính phủ tại mốc 19/02/2025 (SRC-CP):** 25 thành viên, gồm Thủ tướng, 7 Phó Thủ tướng, 14 Bộ trưởng và 3 Thủ trưởng cơ quan ngang bộ.

| Nhóm | Cơ quan (theo chức danh ghi trên infographic) |
| --- | --- |
| Bộ (14) | Ngoại giao; Quốc phòng; Công an; Nội vụ; Tư pháp; Tài chính; Công Thương; Nông nghiệp và Môi trường; Xây dựng; Văn hóa, Thể thao và Du lịch; Khoa học và Công nghệ; Giáo dục và Đào tạo; Y tế; Dân tộc và Tôn giáo |
| Cơ quan ngang bộ (3) | Ngân hàng Nhà nước Việt Nam; Thanh tra Chính phủ; Văn phòng Chính phủ |

Infographic có cả họ tên, ngày sinh, quê quán và quá trình công tác của từng thành viên. Các thông tin cá nhân này nằm ngoài phạm vi hệ thống (R-12).

### 2.2. Phản hồi trên bản mẫu giao diện

| Ngày | Nguồn | Bằng chứng (nguyên văn) | Diễn giải | Xử lý | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| 16/10/2026 | Một người xem bản mẫu; chưa rõ vai trò, phản hồi qua tin nhắn kèm ảnh chụp sơ đồ 3D | "zoom khó thế" | Nhãn tên đặt đè lên khối chặn thao tác cuộn chuột, nên zoom chỉ chạy khi con trỏ ở chỗ trống | Cuộn chuột hoạt động ở mọi vị trí trên sơ đồ; nhấp đúp để bay tới đơn vị (SRS FR-18) | Đã sửa trên bản mẫu; **chưa kiểm chứng lại** với người phản hồi |
| 16/10/2026 | Như trên | "ấn ra ngoài ko thấy tự tắt cái popup" | Thẻ đơn vị đang chọn bị hiểu là popup. Thiết kế cũ cố ý giữ lựa chọn khi bấm vùng trống | Bấm vùng trống hoặc nhấn Escape để bỏ chọn và đóng hồ sơ; kéo để di chuyển vẫn giữ lựa chọn (SRS FR-26) | Như trên |

Đây là phản hồi từ một người, không qua thử nghiệm có kịch bản. Bảng này chỉ xác nhận hai điểm gây vướng có thật với ít nhất một người dùng; chưa cho biết mức độ phổ biến của vấn đề.

## 3. Mục tiêu và chỉ tiêu đề xuất

| Mã | Mục tiêu | Cách đo nghiệm thu |
| --- | --- | --- |
| B-01 | Có hồ sơ cơ cấu tập trung theo từng phạm vi | Khởi tạo phạm vi "Chính phủ" tại mốc 19/02/2025: đúng 14 bộ, 3 cơ quan ngang bộ, 25 chức danh thành viên; báo cáo đối soát với nguồn không còn sai lệch |
| B-02 | Mọi phát biểu tổ chức đều có căn cứ | 100% cơ quan, nhiệm vụ, quyền hạn và quan hệ đã duyệt có ít nhất một căn cứ, ghi số hiệu văn bản và vị trí điều, khoản; mục chưa có căn cứ không duyệt được |
| B-03 | Kiểm soát thay đổi | 100% lần duyệt có người duyệt, phiên bản và nhật ký; người sửa không tự duyệt |
| B-04 | Đọc đúng loại quan hệ | 100% đường nối hiển thị có loại và chú giải; ít nhất 4/5 người thử phân biệt đúng "bầu ra" với "chỉ đạo" trên sơ đồ mà không cần hỏi |
| B-05 | Xem cơ cấu tại một thời điểm | Xem ngày 30/6/2025 và 01/7/2025 cho kết quả khác nhau đúng với chuyển tiếp của Nghị quyết 203: cấp huyện chỉ còn ở ngày trước |
| B-06 | Tra cứu thuận tiện | Ít nhất 4/5 người thử tìm một bộ và mở đúng nhiệm vụ của một đơn vị thuộc bộ trong 60 giây |
| B-07 | Dùng được khi không có 3D | Luồng xem, tìm, sửa, duyệt hoàn tất qua cây, bảng và biểu mẫu |
| B-08 | Điều hướng sơ đồ 3D không cần kỹ năng đồ họa 3D | Ít nhất 4/5 người thử, không được hướng dẫn trước, phóng to tới một vụ và đóng thẻ đang chọn trong 30 giây; làm được bằng chuột hoặc bàn phím (căn cứ: mục 2.2) |

Chỉ tiêu là mục tiêu đề xuất, chưa có số đo vận hành hoặc kết quả thử nghiệm.

## 4. Người dùng và vai trò đề xuất

**Giả định cần xác nhận (Q-01):** người dùng chính là cán bộ làm công tác nghiên cứu, tham mưu về tổ chức bộ máy, và người cần tra cứu thẩm quyền giữa các cơ quan. Chưa có nghiên cứu người dùng.

| Vai trò | Trách nhiệm | Giới hạn |
| --- | --- | --- |
| Chủ sở hữu nghiệp vụ theo phạm vi | Quyết định danh mục, nguồn được chấp nhận và nghiệm thu cho từng phạm vi (Nhà nước trung ương, Chính phủ, chính quyền địa phương, các cơ quan khác của hệ thống chính trị) | Chưa chỉ định; một phạm vi có thể có chủ sở hữu khác |
| Người xem | Tra cứu bản đã duyệt trong phạm vi được cấp; đọc căn cứ | Không chỉnh sửa |
| Biên tập viên | Tạo nháp; cập nhật cơ quan, nội dung, quan hệ, căn cứ; gửi duyệt | Theo phạm vi; không tự duyệt bản mình sửa |
| Người duyệt | Đối chiếu căn cứ với văn bản gốc; duyệt hoặc trả lại | Không bỏ qua lỗi bắt buộc về căn cứ |
| Quản trị hệ thống | Cấp quyền, vận hành, sao lưu | Quyền kỹ thuật không bao gồm quyền duyệt nội dung |

## 5. Phạm vi triển khai

### 5.1. Phạm vi dữ liệu

Dữ liệu tổ chức theo **phạm vi** (dataset). Không trộn các phạm vi vào một cây chỉ vì cùng hiển thị trên một màn hình.

| Phạm vi | Nội dung | Giai đoạn đề xuất |
| --- | --- | --- |
| P-NN — Bộ máy nhà nước trung ương | Quốc hội, Chủ tịch nước, Chính phủ, Tòa án nhân dân tối cao, Viện kiểm sát nhân dân tối cao, Hội đồng bầu cử quốc gia, Kiểm toán nhà nước; quan hệ hình thành và chịu trách nhiệm giữa các cơ quan | MVP |
| P-CP — Chính phủ | Thành viên theo chức danh; bộ, cơ quan ngang bộ; đơn vị thuộc bộ khi có căn cứ | MVP |
| P-DP — Chính quyền địa phương | Đơn vị hành chính cấp tỉnh, cấp xã, đặc khu; Hội đồng nhân dân, Ủy ban nhân dân; sở và cơ quan chuyên môn | MVP cho khung và cấp tỉnh; cấp xã theo quyết định Q-03 vì quy mô |
| P-TP — Hệ thống tòa án, viện kiểm sát | Các cấp theo luật tổ chức tương ứng | Sau khi đối chiếu tên cấp (mục 2.1) |
| P-HTCT — Các cơ quan khác của hệ thống chính trị | Cơ quan của Đảng ở trung ương và đơn vị bên trong; Mặt trận Tổ quốc; tổ chức chính trị – xã hội | Theo quyết định Q-02; luôn là phạm vi riêng, không đặt dưới cơ quan nhà nước |

### 5.2. Chức năng MVP

- Danh mục phạm vi, loại cơ quan, loại quan hệ và cấp hành chính có định nghĩa.
- Hồ sơ cơ quan và đơn vị bên trong: chức năng, nhiệm vụ, quyền hạn (có số hiệu và ý con), căn cứ pháp lý, thời gian hiệu lực.
- Quan hệ có loại, hướng, căn cứ và thời gian; quan hệ kế thừa khi hợp nhất, chia, đổi tên.
- Xem cơ cấu tại một ngày; xem lịch sử thay đổi của một cơ quan.
- Tìm kiếm tiếng Việt có và không dấu; lọc theo phạm vi, loại cơ quan, cấp, loại quan hệ và trạng thái.
- Sơ đồ 3D, cây và bảng đồng bộ lựa chọn; chú giải từng loại quan hệ.
- Tạo, sửa, ngừng hiệu lực; gửi duyệt, trả lại, duyệt; nhật ký và xuất JSON theo quyền.

### 5.3. Giai đoạn sau

So sánh cơ cấu giữa hai mốc thời gian; danh sách người giữ chức danh (nếu được phép, xem Q-05); toàn bộ cấp xã; xuất PDF; liên kết tới cơ sở dữ liệu văn bản pháp luật. Mọi bổ sung phải có yêu cầu riêng.

### 5.4. Ngoài phạm vi

- Hồ sơ cá nhân: ngày sinh, quê quán, quá trình công tác, đánh giá cán bộ.
- Thông tin thuộc danh mục bí mật nhà nước, cho tới khi có hạ tầng và phê duyệt phù hợp (Q-04).
- Tự suy luận thẩm quyền hoặc quan hệ pháp lý; tự đồng bộ từ báo chí.
- Công bố **hệ thống vận hành** và dữ liệu đã duyệt ra internet. Bản trình diễn ở mục 5.5 là ngoại lệ có giới hạn.
- VR/AR.
- Các chức năng thử nghiệm chưa được đặc tả trong BRD/SRS (xem R-15).

### 5.5. Bản trình diễn công khai

Từ 16/10/2026, bản mẫu giao diện được đăng trên GitHub Pages để các bên liên quan xem và góp ý.

| Nội dung | Quy định |
| --- | --- |
| Mục đích | Xem và góp ý giao diện; không dùng để tra cứu chính thức |
| Dữ liệu | Chỉ dữ liệu tham khảo đang dùng trong bản mẫu, có nhãn nguồn và mốc. Chỉnh sửa chỉ nằm trong trình duyệt của người xem, không lưu lên máy chủ |
| Chức năng | Chỉ các chức năng đã có trong BRD/SRS. Chức năng thử nghiệm bị khóa (R-15) |
| Không có | Đăng nhập, phân quyền, duyệt, lưu trữ máy chủ |
| Điều kiện | Phải xác nhận dữ liệu trên bản trình diễn được phép công khai (Q-08). Nếu chưa được phép thì gỡ bản trình diễn hoặc chuyển sang hình thức giới hạn người xem |

## 6. Quy trình nghiệp vụ mục tiêu

1. Biên tập viên chọn phạm vi và mốc thời gian, tạo nháp từ bản đã duyệt hoặc nhập dữ liệu có cấu trúc.
2. Với mỗi thay đổi, biên tập viên gắn căn cứ: văn bản, số hiệu, ngày ban hành, ngày hiệu lực, vị trí điều, khoản.
3. Hệ thống kiểm tra cấu trúc, căn cứ, thời gian, loại quan hệ và quyền.
4. Biên tập viên rà cây, bảng và sơ đồ để phát hiện quan hệ sai loại hoặc sai thời điểm.
5. Gửi duyệt một bản sửa đổi không đổi được; người duyệt đối chiếu văn bản gốc, rồi duyệt hoặc trả lại kèm lý do.
6. Bản đã duyệt được dùng trong phạm vi được cấp quyền; bản cũ vẫn truy xuất được.
7. Khi có văn bản mới về sắp xếp bộ máy, tạo bản sửa đổi mới, ghi ngày hiệu lực và quan hệ kế thừa. Không ghi đè dữ liệu cũ.

"Duyệt" không có nghĩa công bố. Ngày ban hành văn bản, ngày hiệu lực, ngày nguồn đăng tải và ngày duyệt trong hệ thống là bốn thông tin riêng.

## 7. Quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| R-01 | Cơ quan, nhiệm vụ, quyền hạn và quan hệ chỉ được duyệt khi có căn cứ. Báo chí và trang tổng hợp chỉ là nguồn tham khảo, không thay văn bản gốc |
| R-02 | Phân biệt bộ máy nhà nước với hệ thống chính trị. Cơ quan của Đảng, Mặt trận Tổ quốc và tổ chức chính trị – xã hội không đặt vào nhánh của cơ quan nhà nước |
| R-03 | Mọi quan hệ có loại thuộc danh mục và hướng xác định. "Bầu, phê chuẩn", "chịu trách nhiệm và báo cáo", "lãnh đạo, chỉ đạo", "hướng dẫn chuyên môn", "giám sát", "thuộc cơ cấu" và "kế thừa" là các loại khác nhau |
| R-04 | Không suy loại quan hệ từ đường vẽ, vị trí hoặc màu trên sơ đồ tham khảo. Quan hệ chưa rõ loại được lưu ở nháp nhưng không hiển thị như quan hệ đã xác thực |
| R-05 | Một cơ quan có thể có nhiều quan hệ với nhiều cơ quan cùng lúc (ví dụ được bầu bởi một cơ quan và chịu sự chỉ đạo của cơ quan khác). Chỉ quan hệ "thuộc cơ cấu" mới tạo cây và bị cấm chu trình |
| R-06 | Mọi bản ghi có thời gian hiệu lực. Không tự đồng nhất ngày đăng bài với ngày hiệu lực; chưa rõ thì để trống và ghi lý do |
| R-07 | Đơn vị đã kết thúc hoạt động (ví dụ cấp huyện từ 01/7/2025) chuyển sang trạng thái hết hiệu lực. Không xóa |
| R-08 | Hợp nhất, chia, đổi tên được ghi bằng quan hệ kế thừa có căn cứ. Tìm theo tên cũ phải dẫn tới cơ quan kế thừa |
| R-09 | Tên cơ quan ghi theo văn bản, kể cả cách viết hoa. Tên tắt và tên thông dụng lưu riêng làm bí danh |
| R-10 | Không gắn nhãn "hiện hành", "mới nhất" khi chưa đối chiếu mốc cập nhật. Mỗi màn hình luôn hiển thị phạm vi và mốc dữ liệu |
| R-11 | Bố cục, khoảng cách, màu và chiều cao trên sơ đồ 3D không biểu thị thứ bậc quyền lực pháp lý |
| R-12 | Không lưu thông tin cá nhân của người giữ chức danh trong MVP |
| R-13 | Hồ sơ có mâu thuẫn giữa các nguồn phải trả lại, hoặc ghi quyết định xử lý kèm người chịu trách nhiệm |
| R-14 | Nội dung trống hiển thị "Chưa có dữ liệu trong nguồn đã duyệt", không hiển thị "Không có nhiệm vụ". Không tự suy nhiệm vụ của đơn vị từ đơn vị cấp trên hoặc cấp dưới |
| R-15 | Chức năng thử nghiệm chưa được đặc tả trong BRD/SRS chỉ chạy ở môi trường máy cục bộ. Chức năng này không xuất hiện trên bản trình diễn công khai hay môi trường vận hành cho tới khi được đặc tả và chủ sở hữu nghiệp vụ duyệt |

## 8. Rủi ro, phụ thuộc và biện pháp

| Rủi ro, phụ thuộc | Ảnh hưởng | Cách xử lý đề xuất |
| --- | --- | --- |
| Dữ liệu lỗi thời sau các đợt sắp xếp bộ máy | Người dùng hiểu sai cơ cấu hiện tại | Hiển thị mốc dữ liệu; có quy trình rà soát khi có văn bản mới; không gắn nhãn "hiện hành" (R-10) |
| Nguồn tổng hợp khác văn bản gốc (ví dụ tên cấp tòa án, viện kiểm sát) | Sai danh mục | Đối chiếu văn bản gốc trước khi duyệt; nguồn tổng hợp chỉ dùng tham khảo |
| Hiểu sai quan hệ "nối với" thành "trực thuộc" | Sai lệch nghiêm trọng về thẩm quyền | Quan hệ có loại bắt buộc, chú giải luôn hiện, kiểm thử B-04 |
| Quy mô cấp xã (hàng nghìn đơn vị) | Sơ đồ quá dày, chậm | Mở theo nhánh, giới hạn số khối hiển thị; bảng ảo hóa |
| Yêu cầu an toàn thông tin của cơ quan nhà nước chưa xác định | Không triển khai được hoặc phải làm lại kiến trúc | Xác định cấp độ an toàn hệ thống thông tin và nơi lưu trữ trước khi xây dựng (Q-04) |
| Phụ thuộc dịch vụ hoặc CDN nước ngoài | Rò rỉ dữ liệu, không vận hành được trên mạng nội bộ | Mọi tài nguyên (thư viện, font, mô hình 3D) đóng gói và phục vụ nội bộ |
| Thiết bị không có GPU hoặc WebGL bị chặn | Không xem được 3D | Cây và bảng là đường thao tác đầy đủ (B-07) |
| Bản trình diễn công khai bị hiểu là trang chính thức hoặc dữ liệu hiện hành | Người xem dùng sai thông tin | Luôn hiện nhãn nguồn, mốc và "chưa đối chiếu văn bản hiện hành"; không dùng tên miền hay tên gọi gợi ý cơ quan nhà nước (Q-08) |
| Thao tác 3D khó với người không quen | Người dùng bỏ sơ đồ, quay về bảng | Zoom ở mọi vị trí, nhấp đúp để bay tới, bàn phím, bấm vùng trống để đóng; kiểm chứng bằng B-08 |

## 9. Lộ trình theo điều kiện hoàn thành

| Mốc | Đầu ra | Điều kiện chuyển bước |
| --- | --- | --- |
| M1 — Chuẩn hóa danh mục | Danh mục phạm vi, loại cơ quan, cấp hành chính, loại quan hệ có định nghĩa và căn cứ | Chủ sở hữu nghiệp vụ duyệt danh mục; đối chiếu xong SRC-L72 và tên cấp tư pháp |
| M2 — Dữ liệu khởi tạo | P-NN và P-CP tại mốc đã chọn, có căn cứ | Đạt B-01, B-02 trên dữ liệu khởi tạo |
| M3 — Quản lý | Tạo, sửa, duyệt, lịch sử, xem theo ngày | Kiểm thử phân quyền, đồng thời và B-05 đạt |
| M4 — Trực quan | 3D, cây, bảng, chú giải quan hệ | Đạt B-04, B-06, B-07 trong thử nghiệm người dùng |
| M5 — Bàn giao | UAT, vận hành, sao lưu và khôi phục, hồ sơ an toàn thông tin | Chủ sở hữu nghiệp vụ nghiệm thu; rủi ro còn lại được ghi nhận |

Chưa ấn định ngân sách, nhân lực và ngày hoàn thành.

## 10. Quyết định còn mở

| Mã | Câu hỏi | Ảnh hưởng nếu chưa chốt |
| --- | --- | --- |
| Q-01 | Ai là người dùng chính và đơn vị chủ quản hệ thống? | Không xác định được phạm vi ưu tiên và người duyệt |
| Q-02 | Phạm vi P-HTCT (cơ quan Đảng, Mặt trận, tổ chức chính trị – xã hội) có vào đợt đầu không? | Ảnh hưởng danh mục loại cơ quan và quyền truy cập |
| Q-03 | Có đưa toàn bộ cấp xã vào MVP không? | Quyết định quy mô dữ liệu và yêu cầu hiệu năng |
| Q-04 | Cấp độ an toàn hệ thống thông tin, nơi lưu trữ, mạng triển khai, phân loại dữ liệu | Quyết định kiến trúc và có triển khai được hay không |
| Q-05 | Có lưu người giữ chức danh (chỉ họ tên và thời gian giữ chức) không? | Mở rộng mô hình dữ liệu và yêu cầu bảo vệ dữ liệu cá nhân |
| Q-06 | Mốc dữ liệu khởi tạo: 19/02/2025 theo SRC-CP, hay mốc mới hơn khi có nguồn chính thức? | Quyết định dữ liệu nghiệm thu B-01 |
| Q-07 | Nguồn văn bản gốc nào được chấp nhận làm căn cứ (Công báo, Cổng thông tin Chính phủ, cơ sở dữ liệu quốc gia về văn bản pháp luật)? | Quyết định quy tắc R-01 khi duyệt |
| Q-08 | Dữ liệu đang hiển thị trên bản trình diễn công khai đã được phép công khai chưa? Ai xác nhận? | Nếu chưa được phép, bản trình diễn phải gỡ hoặc giới hạn người xem (mục 5.5) |
| Q-09 | Giữ bản trình diễn công khai đến khi nào, và ai được thông báo khi có bản mới? | Quyết định vòng đời bản trình diễn và cách thu góp ý |
