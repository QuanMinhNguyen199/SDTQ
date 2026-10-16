# Đặc tả thiết kế sơ đồ 3D — SDTQ

| Thuộc tính | Giá trị |
| --- | --- |
| Phiên bản | 0.1 — đặc tả thiết kế, 16/10/2026 |
| Chế độ trải nghiệm | Operate: tra cứu, kiểm tra và quản lý dữ liệu cơ cấu bộ máy |
| Căn cứ | [BRD](BRD.md), [SRS](SRS.md), [design.md](../design.md) (token, typography, chữ trên giao diện) |
| Phương pháp | Impeccable cho đánh giá và hoàn thiện; frontend-design cho hướng thị giác; humanizer cho chữ trên giao diện |

## 1. Mục tiêu và trạng thái thiết kế

Người dùng cần biết đang xem phạm vi nào, tại ngày nào; một cơ quan hay đơn vị thuộc về đâu và chứa những gì; nội dung nào có căn cứ. Sơ đồ 3D giúp nhìn ra quan hệ "thuộc cơ cấu" và định vị đơn vị. Cây, bảng và hồ sơ là nơi đọc toàn văn và quản lý dữ liệu (SRS FR-17).

| Nhãn | Nội dung |
| --- | --- |
| **Bằng chứng** | Bản mẫu đã dựng và chạy trên trình duyệt; kịch bản kiểm thử tự động đạt (SRS AT-15 đến AT-18); số đo khung hình ngày 16/10/2026 (mục 9); một phản hồi người dùng (BRD 2.2) |
| **Diễn giải** | Hai điểm vướng trong phản hồi xuất phát từ việc nhãn chặn cuộn chuột và từ việc thẻ đang chọn bị hiểu là popup (mục 5) |
| **Giả định** | Người dùng chính là cán bộ tham mưu, tra cứu tổ chức bộ máy (BRD Q-01); sơ đồ 3D giúp hiểu quan hệ trực thuộc nhanh hơn danh sách — **chưa kiểm chứng** |
| **Đề xuất** | Các phần đánh dấu "chưa triển khai" trong tài liệu: hiển thị quan hệ có loại, chiều thời gian, trạng thái dữ liệu chưa xác minh |

Mọi thông số dưới đây là thông số của bản mẫu, dùng để triển khai và đánh giá. Chúng chưa phải lựa chọn đã được chủ sở hữu nghiệp vụ phê duyệt.

## 2. Kiến trúc thông tin

| Khu vực | Nội dung | Hành động chính |
| --- | --- | --- |
| Thanh đầu | Logo, tên sản phẩm, trạng thái thay đổi chưa xuất, nhập và xuất dữ liệu, đổi theme | Đổi dữ liệu làm việc |
| Thanh ngữ cảnh trên canvas | Chế độ xem 3D / 2D / Danh sách; phạm vi đang xem; số đơn vị hiển thị trên tổng số | Đổi cách trình bày, quay về toàn cây |
| Panel trái (cây) | Tìm kiếm, lọc theo loại đơn vị, mở theo cấp, cây đơn vị, ghi chú nguồn | Chọn đơn vị, mở hoặc thu gọn nhánh |
| Không gian chính | Sơ đồ 3D, sơ đồ 2D hoặc bảng | Định vị, khám phá quan hệ |
| Panel phải (hồ sơ) | Loại, cấp, đường dẫn; tab Tổng quan, Nhiệm vụ, Quyền hạn; đơn vị trực thuộc; nguồn | Đọc; chỉnh sửa, thêm đơn vị con, xem riêng nhánh |
| Thanh camera | Thu nhỏ, phóng to, ba góc nhìn, toàn cảnh, định vị, phím tắt | Điều khiển góc nhìn không cần kéo chuột |

Theo SRS, cần bổ sung khi có máy chủ: bộ chọn phạm vi và **ngày xem** (FR-02, FR-13) luôn hiện trên thanh ngữ cảnh; bộ bật/tắt loại quan hệ (FR-15); vùng tác vụ gửi duyệt và thẩm định (FR-11). Không đặt nút Duyệt lên đối tượng 3D. Không bắt người dùng xoay camera để làm thao tác quản lý.

## 3. Bố cục

### 3.1. Desktop

Canvas 3D chiếm toàn bộ vùng làm việc. Panel cây và panel hồ sơ nổi đè lên canvas; camera căn sơ đồ vào phần còn trống giữa hai panel, nên mở hay đóng panel không làm sơ đồ bị che.

| Thành phần | Kích thước bản mẫu |
| --- | --- |
| Thanh đầu | 64px |
| Panel cây | 320px; 340px từ 1600px |
| Panel hồ sơ | 360px (768–1199px), 408px (1200–1599px), 440px (từ 1600px) |
| Khoảng cách panel với mép | 12px |

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Logo  Sơ đồ tổ chức                         [Nhập] [Xuất JSON] [Theme]  │
├──────────────┬───────────────────────────────────────┬───────────────────┤
│ Cây tổ chức  │ [3D][2D][Danh sách]   Phạm vi · n/N   │ Hồ sơ đơn vị      │
│ Tìm…         │                                       │ Loại · Cấp        │
│ Lọc theo loại│      Mặt bằng của Ban                 │ Tên đơn vị        │
│ Mở tới cấp   │        ┌──┐ ┌──┐ ┌──┐ ┌──┐            │ Tổng quan|NV|QH   │
│ ▾ Ban        │        └──┘ └──┘ └──┘ └──┘            │ …                 │
│   Vụ …       │        ┌──┐ ┌──┐ ┌─────────┐          │                   │
│   ▸ Văn phòng│        └──┘ └──┘ │ mặt bằng│          │                   │
│              │                  │ con     │          │ [Chỉnh sửa]       │
│ Nguồn: …     │ Chú giải   [− + ⟲ ▣ ▢ ⛶ ◎ ⌨]          │ [Thêm đơn vị con] │
└──────────────┴───────────────────────────────────────┴───────────────────┘
```

Từ 768 đến 1199px chỉ mở một panel tại một thời điểm.

### 3.2. Mobile

- Dưới 768px: mặc định là bảng; 3D là lựa chọn chủ động.
- Panel cây và hồ sơ mở toàn màn hình.
- Nút điều khiển camera thay cho pinch và xoay; vùng chạm tối thiểu 40px trên thanh camera, 44px với nút hành động chính.

## 4. Ngữ pháp đồ họa 3D

### 4.1. Hình và ý nghĩa

| Đối tượng | Hình | Ý nghĩa và giới hạn |
| --- | --- | --- |
| Cơ quan, đơn vị | Khối hộp bo góc 200 × 124 × 44 đơn vị cảnh, có viền | **Mọi khối cùng chiều cao** ở mọi cấp; kích thước không biểu thị quyền lực (BRD R-11) |
| Mặt bằng | Nền phẳng dày 9 đơn vị dưới một đơn vị có nhánh đang mở, chứa đơn vị đó và các hậu duệ đang hiện | Thể hiện quan hệ "thuộc cơ cấu" (SRS `partOf`). Nền của cấp sâu hơn nằm chồng lên nền cấp trên. Độ cao của nền là hệ quả của lồng nhau, không biểu thị thứ bậc |
| Đường nối | Đường mảnh trên mặt bằng của đơn vị cha, mũi tên ở đầu đơn vị con | Chỉ vẽ `partOf`. Nhiều con đi qua một trục chung bên trái nhóm con |
| Nhiệm vụ, quyền hạn | **Không dựng thành vật thể 3D** | Đọc trong panel hồ sơ, giữ số hiệu và ý con. Lý do: hàng trăm mục nội dung làm cảnh quá dày và nhãn chồng nhau; toàn văn cần đọc ở DOM |
| Dữ liệu chưa xác minh | Chưa triển khai | Đề xuất: nét chấm và biểu tượng cảnh báo, chỉ hiện trong bản nháp với người có quyền (SRS FR-10) |

### 4.2. Màu

Token đầy đủ nằm ở design.md §10. Trong cảnh 3D:

| Trạng thái | Cách hiển thị | Ghi chú |
| --- | --- | --- |
| Mặc định | Mặt trên màu nền token; mặt bên tối dần do ánh sáng; viền `blockSide` | Đèn được hiệu chỉnh để mặt trên đúng màu token |
| Loại đơn vị | Thẻ loại trên nhãn và thanh nhấn trên mặt khối theo màu từng loại: Ban, Vụ, Cục, Văn phòng, Phòng | **Chỉ để phân loại**, không biểu thị thứ bậc hay trạng thái duyệt. Màu luôn đi kèm chữ (tên loại) |
| Đang chọn | Màu ruby, khối nhấc lên 16, vòng viền dưới chân, thanh nhấn dày hơn, nhãn có viền | Không chỉ dựa vào màu |
| Rê chuột | Đổi màu nhẹ, khối nhấc lên 8, hiện tooltip | Không dùng tooltip làm cách duy nhất để đọc tên |
| Đường tới đơn vị chọn | Đường nối từ gốc tới đơn vị chọn chuyển sang màu ruby, đậm hơn | Giúp đọc đường dẫn trực thuộc |
| Không khớp bộ lọc | Khối và nhãn mờ 30–40% | Không ẩn hẳn, để giữ ngữ cảnh cây |

Không dùng bloom hay ánh sáng màu phủ cảnh, vì làm lệch màu trạng thái.

### 4.3. Quan hệ có loại (SRS 5.1) — chưa triển khai

Mặc định chỉ hiện `partOf`. Các loại khác bật riêng từ bộ lọc. Khi bật, mỗi loại có **kiểu nét và nhãn riêng**, không chỉ khác màu:

| kind | Kiểu nét đề xuất | Hướng |
| --- | --- | --- |
| partOf | Liền, mảnh, mũi tên tới con | Cha → con |
| electedOrApprovedBy | Đứt dài, ký hiệu "bầu" ở giữa | Cơ quan bầu → cơ quan được bầu |
| accountableTo | Đứt ngắn, mũi tên hai nét | Cơ quan chịu trách nhiệm → cơ quan nhận báo cáo |
| directs | Liền, đậm hơn partOf, mũi tên đặc | Bên chỉ đạo → bên chịu chỉ đạo |
| guides | Chấm | Bên hướng dẫn → bên được hướng dẫn |
| supervises | Chấm – gạch | Bên giám sát → bên bị giám sát |
| systemTier | Liền, hai vạch song song | Cấp trên → cấp dưới trong cùng hệ thống |
| ledBy | Đứt, khác màu nền của phạm vi | Tổ chức lãnh đạo → tổ chức được lãnh đạo |

- Quan hệ ngoài `partOf` bay vòng phía trên mặt bằng, để không lẫn với đường trực thuộc.
- Chọn một đường thì hồ sơ hiện loại, hai đầu, căn cứ và hiệu lực.
- Quan hệ chưa rõ loại không có mũi tên và không hiện như quan hệ đã xác thực (BRD R-04).
- Không suy loại quan hệ từ vị trí hay màu.

### 4.4. Bố cục

- Cây nằm trên mặt sàn: X trải ngang các đơn vị cùng cấp, Z đi sâu theo cấp. Trục Y không dùng để xếp thứ bậc.
- Đơn vị có nhiều con thì xếp con thành lưới: tối đa 3 cột khi có tới 6 con, 4 cột khi nhiều hơn. Ví dụ 12 vụ, cục được xếp thành lưới 4 × 3, nên tên vẫn đọc được ở mức zoom mặc định.
- Khoảng cách: 80 giữa hai khối cùng hàng, 110 giữa các hàng, 174 từ cha tới hàng con đầu tiên.
- Bố cục ổn định: cùng dữ liệu và cùng trạng thái mở nhánh thì cho cùng vị trí.
- Mỗi phạm vi (BRD 5.1) là một cảnh riêng. Không ghép cơ quan của Đảng, Mặt trận Tổ quốc hay chính quyền địa phương vào nhánh của cơ quan nhà nước khác (BRD R-02).
- Đơn vị có nhiều quan hệ với nhiều cơ quan vẫn chỉ có một khối; quan hệ ngoài `partOf` được thể hiện bằng đường nối, không nhân đôi khối.

### 4.5. Chiều thời gian (SRS FR-13, FR-22) — chưa triển khai

- Ngày xem quyết định tập đơn vị và quan hệ được dựng.
- Đơn vị đã hết hiệu lực (ví dụ cấp huyện sau 01/7/2025) không hiện trên cảnh, nhưng tra được trong hồ sơ lịch sử và qua tìm kiếm tên cũ.
- Đề xuất cho so sánh hai mốc: đơn vị thêm mới, bị bỏ, hợp nhất hoặc đổi tên được đánh dấu bằng nhãn chữ và biểu tượng, không chỉ bằng màu.

### 4.6. Nhãn và mật độ

- Nhãn là DOM chiếu từ tọa độ 3D, chữ luôn thẳng, rộng 124px, chữ tối thiểu 12px.
- Khi một khối hiện nhỏ hơn 90px trên màn hình, nhãn chỉ còn thẻ loại và nút mở nhánh bị ẩn. Đơn vị đang chọn hoặc đang rê chuột luôn hiện đủ tên.
- Cuộn chuột trên nhãn được chuyển xuống camera, để zoom hoạt động ở mọi vị trí (SRS FR-18).
- Tên dài rút gọn tối đa hai dòng trên cảnh; tên đầy đủ có trong hồ sơ và trong tên đọc cho trình đọc màn hình.

## 5. Camera và thao tác

Camera phối cảnh FOV 35°. Ba góc nhìn có sẵn:

| Góc nhìn | Dùng khi |
| --- | --- |
| Phối cảnh (mặc định) | Nhìn chéo thấp, thấy chiều sâu, mặt bên khối và mặt bằng lồng nhau |
| Từ trên | Đọc như sơ đồ phẳng |
| Chính diện | Nhìn gần ngang tầm mắt |

Giới hạn: góc nghiêng 0,02–1,38 rad để không lật cảnh; khoảng cách camera 180–9.000 đơn vị cảnh. Khi mở trang, camera bay vào từ trên cao rồi xoay về góc làm việc. Camera không tự quay.

| Thao tác | Kết quả | Giữ nguyên |
| --- | --- | --- |
| Bấm khối hoặc nhãn | Chọn đơn vị, mở hồ sơ, tô đường dẫn tới gốc | Bộ lọc, nhánh đang mở |
| Nhấp đúp khối hoặc nhãn | Chọn và bay camera tới đơn vị | Như trên |
| Chọn trong cây hoặc kết quả tìm | Chọn, mở đường tổ tiên, định vị camera | Từ khóa tìm |
| Bấm vùng trống (lệch ≤ 2px) | Bỏ chọn, tắt tooltip, đóng hồ sơ (SRS FR-26) | Dữ liệu, bộ lọc, nhánh đang mở |
| Escape | Như bấm vùng trống. Trong hộp thoại, Escape đóng hộp thoại trước | Biểu mẫu chưa lưu được cảnh báo |
| Kéo chuột trái | Di chuyển trên mặt sàn | Lựa chọn |
| Kéo chuột phải | Xoay quanh điểm nhìn | Lựa chọn |
| Cuộn chuột | Thu phóng về phía con trỏ, ở mọi vị trí kể cả trên nhãn | Lựa chọn |
| Bàn phím (SRS FR-25) | Mũi tên hoặc W A S D: di chuyển theo hướng nhìn; Shift + mũi tên hoặc Q, E: xoay; +, − hoặc PageUp, PageDown: thu phóng; Home: toàn cảnh | Không tác động khi focus ở ô nhập, biểu mẫu, hộp thoại, panel |
| Toàn cảnh | Căn mọi đơn vị đang hiện vào phần canvas không bị panel che | Phạm vi, chế độ |
| Chuyển 3D / 2D / Danh sách | Đổi cách trình bày | Lựa chọn, bộ lọc, nhánh đang mở |

**Lý do bấm vùng trống thì bỏ chọn:** theo phản hồi người dùng (BRD 2.2), thẻ của đơn vị đang chọn được hiểu như một popup, và người dùng mong bấm ra ngoài sẽ đóng nó. Kéo chuột không bị tính là bấm, nên thao tác di chuyển hay xoay không làm mất lựa chọn.

Kéo khối để đổi cha không được hỗ trợ; đổi cha làm trong biểu mẫu chỉnh sửa.

## 6. Quy tắc giao diện

- Token màu, typography (Manrope cho tiêu đề, Be Vietnam Pro cho nội dung) và quy tắc 60–30–10 theo design.md §10. Không lặp lại bảng token ở đây để tránh hai nguồn lệch nhau.
- Chữ trên giao diện theo design.md §18: nút nói đúng việc sẽ xảy ra, thông báo lỗi nói nguyên nhân và cách sửa, giọng trung tính.
- Một tác vụ chính theo ngữ cảnh: với hồ sơ là Chỉnh sửa và Thêm đơn vị con; với bản nháp là Lưu và Gửi duyệt (khi có máy chủ).
- Không dùng glow liên tục, hạt, glassmorphism hay chữ bay làm giảm khả năng đọc sơ đồ nghiệp vụ.

## 7. Chuyển động

Motion điều khiển DOM (panel, tab, popup, thông báo). Cảnh 3D tự nội suy bằng damping trong vòng render. Camera chỉ do camera-controls ghi; không có hai nơi cùng ghi một thuộc tính.

| Sự kiện | Thông số bản mẫu | Khi bật giảm chuyển động |
| --- | --- | --- |
| Mở trang | Camera bay vào khoảng 1,5 giây; khối mọc lên lần lượt theo cấp rồi theo thứ tự trong hàng, độ trễ tối đa 0,28 giây | Hiện ngay ở vị trí cuối |
| Mở hoặc thu gọn nhánh | Khối trượt về vị trí mới, mặt bằng co giãn (damping 0,2 giây) | Chuyển thẳng tới bố cục cuối |
| Chọn đơn vị | Khối nhấc lên (0,12 giây), đổi màu; một chấm sáng chạy một lần dọc đường từ gốc tới đơn vị (0,65 giây) | Đổi màu và viền ngay, không nhấc, không chấm chạy |
| Rê chuột | Khối nhấc nhẹ; tooltip hiện trong 0,14 giây | Tooltip hiện ngay |
| Định vị, đổi góc nhìn | Camera nội suy, smoothTime 0,25 giây | Nhảy tới góc cuối |
| Mở panel | 180ms, mờ dần và trượt 16px | Chỉ mờ dần |
| Đổi tab | 150ms mờ dần | Đổi ngay |

- Mọi chuyển động chạy một lần để phản hồi thao tác. Không có vòng lặp tự chạy; khi không thao tác, cảnh không render.
- Thao tác mới thay đích chuyển động cũ. Kéo camera hủy chuyển động camera đang chạy.
- Không trì hoãn cập nhật dữ liệu để chờ chuyển động.

## 8. Kiến trúc triển khai

```text
Dữ liệu (JSON nhập/xuất; sau này: API có phân quyền theo SRS mục 6)
                 │
                 ▼
     Store Zustand duy nhất
     units / activeDeptId / hoveredDeptId / expanded / bộ lọc / camera
        │                 │                         │
        ▼                 ▼                         ▼
  Cây, bảng, 2D     Hồ sơ, biểu mẫu         Cảnh R3F (React Three Fiber)
  DOM, Tailwind     Motion cho DOM          Drei: CameraControls, Html, Line,
                                            RoundedBox; postprocessing ở bậc cao
```

- Nền tảng: Next.js xuất tĩnh. Trang chỉ chạy phía trình duyệt, vì WebGL và tệp cục bộ không dùng được phía máy chủ.
- Nhãn và tooltip render qua một lớp DOM cố định đặt trên canvas, không gắn trực tiếp vào canvas.
- Render theo nhu cầu (`frameloop="demand"`): chỉ vẽ khi có thay đổi hoặc đang có chuyển động. Mọi lệnh camera tự yêu cầu một khung hình.
- Shadow map chỉ vẽ lại khi cảnh đổi (khối di chuyển, lọc, theme), không vẽ lại khi chỉ xoay camera.
- Store không giữ bản dữ liệu nghiệp vụ thứ hai trong cảnh. Mesh chỉ tham chiếu ID đơn vị.
- Toàn văn hiển thị dạng văn bản thường, không chèn HTML.
- Mọi tài nguyên (thư viện, font, mô hình) đóng gói cùng bản build; không tải từ dịch vụ bên ngoài (SRS NFR-05).

## 9. Hiệu năng

| Bậc | Độ phân giải tối đa | Bóng đổ | Hậu kỳ |
| --- | --- | --- | --- |
| 0 | 1× | Không | Không |
| 1 (mặc định) | 1,25× | Có | Không |
| 2 | 1,5× | Có | SMAA, Vignette |

- Cảnh tự hạ một bậc khi trung vị thời gian khung hình trong lúc chuyển động vượt 1/55 giây.
- Số đo ngày 16/10/2026, 19 khối, GPU Intel tích hợp, Edge, tỉ lệ màn hình 1,5×:
  - Bậc 1: khoảng 7 ms mỗi khung khi render liên tục không thao tác; khoảng 68 fps khi xoay bằng chuột tự động.
  - Bậc 2: khoảng 38 fps. Vì vậy hậu kỳ không bật mặc định.
- SRS NFR-09 đặt mục tiêu ≥ 60 fps với tối đa 300 khối hiển thị. **Chưa đo với 300 khối.**
- Với quy mô cấp xã (hàng nghìn đơn vị), chỉ dựng nhánh đang mở và giới hạn số khối hiển thị. Không giảm độ chính xác dữ liệu để đạt fps.

## 10. Tài sản 3D

Spline tạm hoãn từ 15/10/2026. Khối được dựng bằng primitive (RoundedBox, Box, Line) theo token. Nếu sau này dùng mô hình GLB:

- Kiểm tra một mẫu trước khi sản xuất cả bộ: tỉ lệ, điểm gốc, vật liệu, tải được trong R3F.
- Lưu nội bộ cùng bản build, có tệp mô tả gồm checksum, phiên bản và quyền sử dụng.
- Không đưa tên hay dữ liệu cơ quan vào tài sản; nhãn luôn dựng bằng DOM.
- Không giả định GLB mang theo sự kiện hay tương tác; mọi tương tác do ứng dụng xử lý.

## 11. Trạng thái màn hình

| Trạng thái | Nội dung | Hành động |
| --- | --- | --- |
| Đang tải 3D | "Đang mở không gian sơ đồ…"; cây và bảng đã dùng được | Tiếp tục ở bảng |
| Không tìm thấy | Số kết quả bằng 0 | Xóa bộ lọc |
| Nội dung trống | "Nguồn dữ liệu chưa có nhiệm vụ riêng của đơn vị này…" (BRD R-14) | Chỉnh sửa nếu có căn cứ |
| Lỗi WebGL hoặc mất context | "Không mở được 3D. Đã chuyển sang 2D." | Dùng 2D hoặc bảng; lựa chọn giữ nguyên |
| Nhập file lỗi | Nêu lỗi cụ thể; dữ liệu đang làm việc không đổi | Sửa file rồi nhập lại |
| Thay đổi chưa xuất | Nhãn trên thanh đầu; cảnh báo khi rời trang | Xuất JSON |
| Chưa có nguồn, chờ duyệt, trả lại, xung đột | Theo SRS UC-02, UC-04 | Chưa triển khai (cần máy chủ) |

## 12. Khả năng tiếp cận

- Cây, bảng và biểu mẫu là đường thao tác đầy đủ, không cần canvas (SRS FR-17).
- Vùng sơ đồ nhận focus bằng Tab và có mô tả phím cho trình đọc màn hình. Nhãn khối là nút có tên đọc "Xem [tên đơn vị]".
- Thông báo thao tác đi qua vùng aria-live lịch sự, không đọc mỗi khung hình.
- Focus luôn nhìn thấy được; hộp thoại giữ và trả focus đúng chỗ.
- Tôn trọng giảm chuyển động của hệ điều hành (mục 7).

## 13. Checklist nghiệm thu

| ID | Điều kiện | Trạng thái bản mẫu 16/10/2026 |
| --- | --- | --- |
| D-01 | Phạm vi, nguồn và mốc dữ liệu luôn nhìn thấy, kể cả khi mở panel | Một phần: có nhãn nguồn; chưa có bộ chọn phạm vi và ngày xem |
| D-02 | Bấm khối, nhãn, cây hoặc kết quả tìm cho cùng đơn vị và cùng hồ sơ | Đạt (kiểm thử tự động) |
| D-03 | Không có quan hệ nào được tạo hay suy ra từ vị trí hoặc màu | Đạt với `partOf`; các loại khác chưa triển khai |
| D-04 | Mọi khối cùng chiều cao; màu loại đơn vị không biểu thị thứ bậc | Đạt |
| D-05 | Mọi thao tác quản lý làm được qua DOM, không cần 3D | Đạt với các thao tác hiện có |
| D-06 | Giảm chuyển động bỏ bay camera, nhấc khối và chấm chạy | Đạt |
| D-07 | Zoom bằng cuộn chuột ở mọi vị trí, kể cả trên nhãn (FR-18) | Đạt (AT-15) |
| D-08 | Bấm vùng trống hoặc Escape bỏ chọn; kéo không bỏ chọn (FR-26) | Đạt (AT-16) |
| D-09 | Điều khiển bàn phím; không chiếm phím khi đang gõ (FR-25) | Đạt (AT-17) |
| D-10 | Quan hệ có loại hiện bằng kiểu nét và chú giải riêng (FR-15) | Chưa triển khai |
| D-11 | Xem tại một ngày cho đúng tập đơn vị; đơn vị hết hiệu lực không bị xóa (FR-13) | Chưa triển khai |
| D-12 | Bản trình diễn công khai không có chức năng thử nghiệm (BRD R-15) | Đạt (AT-18) |
| D-13 | ≥ 60 fps với 300 khối trên máy tham chiếu (NFR-09) | Chưa đo |
| D-14 | Thử nghiệm người dùng B-08: phóng tới một vụ và đóng thẻ đang chọn trong 30 giây, không cần hướng dẫn | Chưa thực hiện |

## 14. Thứ tự triển khai tiếp theo

1. Thử nghiệm B-08 với 4–5 người dùng mục tiêu trên bản trình diễn hiện tại, để xác nhận hai điểm đã sửa theo phản hồi.
2. Bổ sung bộ chọn phạm vi và ngày xem trên thanh ngữ cảnh (D-01, D-11).
3. Hiển thị quan hệ có loại theo mục 4.3, bắt đầu với `electedOrApprovedBy` và `directs` trong phạm vi P-NN (D-10).
4. Đo hiệu năng với dữ liệu thử 300 khối và với quy mô cấp xã (D-13).
5. Khi có máy chủ: trạng thái nháp, chờ duyệt, trả lại và xung đột theo SRS.
