# Thiết kế hệ thống sơ đồ tổ chức đa cấp

| Thuộc tính | Nội dung |
| --- | --- |
| Phiên bản | 0.5 — chữ lớn, màu phân loại và chuyển động sơ đồ |
| Ngày cập nhật | 16/10/2026 |
| Mục đích | Quản lý dữ liệu tổ chức nội bộ và khám phá cơ cấu bằng sơ đồ 3D |
| Nền tảng | Web, hỗ trợ desktop và mobile |
| Phương pháp thiết kế | Impeccable — ưu tiên thao tác, phân cấp thông tin và khả năng đọc |
| Công nghệ định hướng | React Three Fiber + Drei + Post-processing, Tailwind CSS, Motion (motion.dev), Zustand. Spline tạm hoãn (15/10/2026) |
| Trạng thái | Tài liệu triển khai; chưa phải giao diện hoặc tài sản 3D đã xây dựng |

## 1. Cách hiểu sản phẩm đã thống nhất

Hệ thống biểu diễn cơ cấu tổ chức gồm nhiều cấp. Một đơn vị có thể chứa các đơn vị con; mỗi đơn vị, kể cả đơn vị gốc và đơn vị trung gian, có nhiệm vụ và quyền hạn riêng.

```text
Cơ quan A
│  Nhiệm vụ riêng của A
│  Quyền hạn riêng của A
│
├── Ban B
│   │  Nhiệm vụ riêng của B
│   │  Quyền hạn riêng của B
│   ├── Phòng B1
│   │      Nhiệm vụ riêng của B1
│   │      Quyền hạn riêng của B1
│   └── Phòng B2
│          Nhiệm vụ riêng của B2
│          Quyền hạn riêng của B2
│
└── Ban C
       Nhiệm vụ riêng của C
       Quyền hạn riêng của C
```

Ví dụ trên chỉ minh họa cấu trúc, không khẳng định quan hệ của một cơ quan có thật.

### Vai trò của tài liệu tham khảo

`graph_toan_canh.html` là tham khảo về dữ liệu và cách tương tác, không phải khuôn cấu trúc bắt buộc. Không yêu cầu hệ thống mới có đúng số nút, số cạnh, tên đơn vị, màu sắc hoặc tọa độ của HTML.

Hai đường dẫn người dùng cung cấp là tư liệu tham chiếu nội dung theo thời điểm. Chúng không bắt buộc sản phẩm phải có ba bộ dữ liệu cố định và không tự động xác nhận cơ cấu hiện hành.

Tài liệu này cập nhật cách hiểu mô hình thiết kế. Các yêu cầu nhập đúng 258 nút/269 cạnh và ba phạm vi cố định trong BRD/SRS phiên bản 0.1 không phải yêu cầu sản phẩm đã xác nhận; cần hiệu chỉnh các tài liệu đó trước khi dùng làm hợp đồng nghiệm thu. Số liệu HTML có thể dùng cho một bài kiểm thử nhập mẫu nếu sau này cần.

## 2. Nguyên tắc mô hình tổ chức

1. Đơn vị là nút chính của sơ đồ; quan hệ trực thuộc tạo các cấp tổ chức.
2. Nhiệm vụ và quyền hạn là nội dung thuộc một đơn vị, không phải đơn vị cấp dưới.
3. Nhiệm vụ có thể có các ý nhỏ hoặc nhiệm vụ con; việc này không làm tăng cấp tổ chức.
4. Đơn vị cha không tự kế thừa nội dung của đơn vị con và ngược lại.
5. Mọi cấp dùng chung cấu trúc hồ sơ; không chỉ cấp cuối mới được có nội dung.
6. Không hard-code số cấp. Giao diện hiển thị từng phần để xử lý cây sâu hoặc rộng.
7. “Chưa có dữ liệu” khác với “Không có nhiệm vụ/quyền hạn”.
8. Độ sâu trong cây khác độ sâu thị giác 3D; khoảng cách và kích thước không diễn giải thẩm quyền pháp lý.

Mô hình cơ sở đề xuất là cây: một đơn vị có tối đa một cha trực thuộc trong cùng phiên bản cơ cấu. Quan hệ phối hợp, giám sát hoặc quan hệ khác được lưu riêng, không dùng làm cha thứ hai. Nếu nghiệp vụ cần đa cha trực thuộc, phải mở rộng thành đồ thị có hướng và bổ sung quy tắc trước triển khai.

## 3. Mục tiêu trải nghiệm

Người dùng phải trả lời được bốn câu hỏi từ một màn hình:

- Tôi đang xem cơ cấu và phiên bản nào?
- Đơn vị này thuộc đơn vị nào và có những đơn vị con nào?
- Nhiệm vụ và quyền hạn riêng của đơn vị này là gì?
- Nội dung này ở trạng thái nào và dựa trên nguồn nào?

Chế độ trải nghiệm theo Impeccable: **Operate**. Sơ đồ giúp định vị và hiểu cấu trúc; nội dung dài được đọc trong panel; chỉnh sửa dùng biểu mẫu. Hiệu ứng không được cản trở tìm kiếm hoặc kiểm tra dữ liệu.

## 4. Bố cục màn hình

### Desktop

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Tên cơ cấu  [Phiên bản ▾]  Trạng thái     Tìm đơn vị        Tài khoản    │
├─────────────────┬───────────────────────────────┬──────────────────────┤
│ CÂY TỔ CHỨC     │ [3D] [2D] [Danh sách]          │ HỒ SƠ ĐƠN VỊ         │
│                 │                               │ Tên đầy đủ           │
│ ▾ Cơ quan A     │           Cơ quan A            │ Đường dẫn cấp cha    │
│   ▾ Ban B       │           /      \             │                      │
│     Phòng B1    │        Ban B    Ban C          │ Tổng quan            │
│     Phòng B2    │        /   \                   │ Đơn vị trực thuộc    │
│   ▸ Ban C       │      B1     B2                 │ Nhiệm vụ             │
│                 │                               │ Quyền hạn            │
│ Mở theo cấp     │ [−] [+] [Về gốc] [Định vị]    │ Nguồn / Lịch sử      │
├─────────────────┴───────────────────────────────┴──────────────────────┤
│ Chú giải • Số đơn vị đang hiển thị • Trạng thái lưu                      │
└────────────────────────────────────────────────────────────────────────┘
```

Thông số khởi điểm ở viewport 1440 × 900: header 64px; cây trái 260px; hồ sơ phải 380px; vùng sơ đồ dùng phần diện tích còn lại. Panel có cuộn độc lập. Khi đóng hồ sơ, sơ đồ mở rộng mà không mất lựa chọn.

### Mobile và tablet

- Dưới 768px: mặc định danh sách phân cấp; người dùng chủ động bật 3D.
- Cây và hồ sơ mở thành từng màn/panel, tránh chồng hai drawer.
- Tên cơ cấu và phiên bản vẫn hiện ở vùng đầu trang.
- Biểu mẫu một cột; nút chính không bị bàn phím ảo che.
- Điều khiển chạm tối thiểu 44 × 44px; luôn có nút thay cho thao tác kéo hoặc pinch.
- 768–1199px: mở một panel phụ tại một thời điểm nếu vùng sơ đồ quá hẹp.

Các kích thước là đề xuất triển khai, cần kiểm tra trên nội dung và thiết bị thực tế.

## 5. Cấu trúc nút và hồ sơ

### Nút đơn vị trên sơ đồ

Mỗi nút thể hiện tên ngắn, loại đơn vị nếu có và nút mở/thu gọn khi có con. Tên đầy đủ xuất hiện trong hồ sơ và accessible name. Có thể hiện số đơn vị con trực tiếp; không gộp số nhiệm vụ vào con số này.

Không đưa toàn bộ nhiệm vụ và quyền hạn lên mặt khối 3D. Không tự mở mọi nội dung thành hàng trăm nút khi tải trang.

### Hồ sơ đơn vị

| Mục | Nội dung |
| --- | --- |
| Tổng quan | Tên, mã, loại đơn vị, mô tả, cha trực tiếp, trạng thái, thời gian áp dụng |
| Đơn vị trực thuộc | Danh sách con trực tiếp; mở từng đơn vị; phân biệt tổng hậu duệ nếu có |
| Nhiệm vụ | Danh sách nhiệm vụ riêng, số hiệu, toàn văn, các ý con |
| Quyền hạn | Danh sách quyền hạn riêng, số hiệu, toàn văn |
| Nguồn | Văn bản hoặc tư liệu liên quan đến hồ sơ và từng nội dung |
| Lịch sử | Các thay đổi, người thực hiện và phiên bản |

Đơn vị gốc được hiển thị đầy đủ các mục giống mọi đơn vị khác. Thu gọn nhánh không ẩn hoặc xóa nhiệm vụ của đơn vị cha.

## 6. Quy tắc tương tác đa cấp

| Hành động | Hành vi |
| --- | --- |
| Chọn thân nút | Chọn đơn vị và mở hồ sơ; không tự bung nhánh |
| Bấm nút mở rộng | Hiện con trực tiếp; giữ đơn vị đang chọn |
| Thu gọn | Ẩn hậu duệ khỏi cảnh; không thay đổi dữ liệu |
| Thu gọn nhánh chứa đơn vị đang chọn | Chuyển lựa chọn về nút vừa thu gọn và thông báo ngắn |
| Mở theo cấp | Hiện tới độ sâu được chọn tính từ gốc đang xem |
| Xem nhánh này | Giới hạn cảnh vào đơn vị và hậu duệ; giữ breadcrumb trở về toàn cây |
| Chọn kết quả tìm kiếm | Mở đường tổ tiên cần thiết, chọn và định vị đơn vị |
| Chọn Nhiệm vụ/Quyền hạn trong hồ sơ | Đổi nội dung panel; không đổi cấp tổ chức |
| Bấm vùng trống | Đóng tooltip tạm; không làm mất biểu mẫu đang sửa |
| Đổi 3D/2D/Danh sách | Giữ phiên bản, lựa chọn, nhánh đã mở và bộ lọc |
| Về gốc | Đưa camera về toàn cảnh hiện hành, không tự đóng mọi nhánh |

Mở mặc định hai cấp đầu nếu kích thước cây cho phép. Với nhánh lớn, tải con theo yêu cầu và hiển thị trạng thái tải tại chính nhánh. Không có nút “Mở tất cả” không giới hạn khiến giao diện bị treo; cảnh báo quy mô hoặc mở theo từng cấp.

Nếu cần xem tổng hợp nhiệm vụ của cả nhánh, cung cấp chế độ riêng “Gồm đơn vị cấp dưới”, mặc định tắt. Mỗi mục tổng hợp phải ghi đơn vị sở hữu; không biến nhiệm vụ con thành nhiệm vụ riêng của cha.

## 7. Luồng quản lý dữ liệu

### Tạo đơn vị con

Chọn cha → Thêm đơn vị con → nhập tên, mã và thông tin cần thiết → lưu nháp → đơn vị mới xuất hiện dưới cha trong bản nháp. Có thể bổ sung nhiệm vụ/quyền hạn ngay hoặc sau đó; trạng thái thiếu nội dung phải rõ ràng.

### Chỉnh sửa nội dung riêng

Chọn đơn vị ở bất kỳ cấp nào → mở Nhiệm vụ hoặc Quyền hạn → thêm/sửa/sắp xếp mục → lưu nháp. Số thứ tự hiển thị không được dùng làm khóa dữ liệu.

### Chuyển đơn vị sang cha khác

Chọn “Chuyển đơn vị” → chọn cha mới → xem trước đường dẫn cũ/mới và phạm vi nhánh bị chuyển → xác nhận lưu nháp. Không cho chuyển vào chính mình hoặc hậu duệ. Nhiệm vụ/quyền hạn gắn với ID đơn vị nên vẫn được giữ nguyên.

Kéo thả trên 3D không được dùng làm thao tác đổi cha trong phiên bản đầu; kéo cảnh chỉ điều khiển góc nhìn.

### Ngừng hoạt động

Không xóa cứng đơn vị đã có lịch sử. Nếu còn con đang hoạt động, yêu cầu xử lý các đơn vị con trước hoặc lập thay đổi nhánh rõ ràng. Không tự ngừng toàn bộ hậu duệ sau một lần bấm không mô tả hệ quả.

### Duyệt thay đổi

Luồng đề xuất: Nháp → Chờ duyệt → Đã duyệt hoặc Trả lại. Bản đã duyệt chỉ đọc; chỉnh sửa tạo bản nháp mới. Quyền biên tập và quyền duyệt áp dụng theo phạm vi được cấp, kiểm tra tại máy chủ. Chi tiết vai trò cần chốt với đơn vị vận hành.

## 8. Thiết kế không gian 3D

Three.js dựng cảnh từ dữ liệu tổ chức. Đơn vị là khối hộp mỏng, cạnh là đường nối có hướng cha → con. Tầng tổ chức theo trục Y; X phân nhánh; Z tách cụm để giảm che khuất.

- Layout ổn định: cùng dữ liệu và trạng thái mở nhánh cho cùng vị trí tương đối.
- Cạnh cha–con lấy từ quan hệ dữ liệu, không suy ra từ khoảng cách.
- Nút được chọn có viền và nhãn rõ; không chỉ đổi màu.
- Nhãn luôn hướng về người xem; không nghiêng chữ theo mặt khối.
- Khi nhãn chồng nhau, ưu tiên nút chọn, tổ tiên và kết quả tìm kiếm; cây bên trái vẫn truy cập đủ các đơn vị.
- Nhiều gốc hợp lệ hiển thị thành các cây riêng trong cùng phạm vi, không tạo cơ quan cha giả.
- Quan hệ khác nếu được bật dùng kiểu nét và chú giải riêng, không làm thay đổi tầng trực thuộc.

Camera khởi điểm phối cảnh nhẹ, có preset Trước/Chéo/Trên. Giới hạn góc xoay để tránh lật cảnh. Không tự quay, không dùng hiệu ứng hạt hoặc vật liệu kính làm khó đọc.

Thông số thử nghiệm ban đầu: khối 120 × 44 × 12 đơn vị cảnh; khoảng tầng 150; khoảng nhánh tối thiểu 180; FOV 35°. Layout phải giãn theo bounds và nội dung thực, không cố định cứng các tọa độ từ HTML.

## 9. Vai trò Motion, Three.js và Spline

> **Cập nhật 15/10/2026 — theo yêu cầu người dùng:** tạm bỏ Spline. Stack triển khai: R3F + Drei + `@react-three/postprocessing` cho cảnh 3D, Tailwind CSS cho lớp giao diện 2D phủ trên canvas, Motion cho panel/popup, Zustand làm store duy nhất. Cập nhật 16/10/2026: trở lại camera phối cảnh FOV 35° (§8) theo yêu cầu "có chiều sâu, không nhìn từ trên xuống", preset Phối cảnh / Từ trên / Chính diện; thêm mặt bằng lồng nhau, bóng đổ, sương mù và hoạt cảnh chuyển trạng thái. Post-processing (SMAA + Vignette) chỉ ở bậc chất lượng cao, tắt mặc định vì làm tụt dưới 60 fps trên GPU tích hợp; bỏ N8AO và Outline; không dùng bloom theo §10.4. Các mục Spline dưới đây giữ làm tham chiếu nếu khôi phục tuyến tài sản GLB.

| Thành phần | Trách nhiệm | Ranh giới |
| --- | --- | --- |
| Motion | Chuyển động panel, tab, danh sách và phản hồi thao tác DOM | Không đồng thời ghi transform camera với Three.js |
| Three.js | Dựng sơ đồ động, camera, picking, cạnh nối, bố cục không gian | Không giữ một bản dữ liệu nghiệp vụ riêng ngoài store ứng dụng |
| Spline | Thiết kế mẫu khối, vật liệu và góc nhìn để bàn giao tài sản | Không nhập thủ công toàn bộ cơ cấu vào scene làm nguồn dữ liệu chính |

Tuyến tài sản đề xuất: dựng mẫu trong Spline → thử xuất GLB → kiểm tra scale/pivot/vật liệu → dùng trong Three.js. Tương tác và quan hệ tổ chức do ứng dụng xử lý; không giả định GLB giữ được event của Spline. Quyền xuất và khả năng chuyển vật liệu cần xác nhận trên tài khoản thực tế.

Nếu mẫu GLB không cần thiết cho hình khối đơn giản, có thể dựng primitive Three.js theo thông số được duyệt và dùng Spline làm tài liệu mẫu. Không bắt buộc hai runtime cùng render một sơ đồ.

Tài liệu kỹ thuật tham khảo: [Motion](https://motion.dev/docs/react), [Three.js](https://threejs.org/docs/), [Spline GLB](https://docs.spline.design/exporting-your-scene/files/exporting-as-gtlf-glb).

## 10. Theme dựa trên logo trong assets

### 10.1. Nguồn nhận diện

Theme lấy nhận diện **đỏ — navy — trắng** của logo THEHEGEO. Màu xanh accent ở bản thiết kế trước được thay bằng đỏ thương hiệu. Không tự đổi tên hệ thống thành tên trên logo; tên sản phẩm và logo là hai trường riêng.

| Tài sản | Đặc điểm đã kiểm tra | Cách sử dụng |
| --- | --- | --- |
| [logo-ruby.png](assets/logo-ruby.png) | Đỏ ruby, chữ navy, nền sáng liền | Biến thể dùng trên bề mặt trắng |
| [logo-navy.png](assets/logo-navy.png) | Đỏ ấm, chữ trắng, nền navy liền | Tham chiếu theme tối; dùng trong vùng nền phù hợp |
| [logo-charcoal.png](assets/logo-charcoal.png) | Đỏ, chữ trắng, nền charcoal liền | Biến thể dùng khi có bề mặt charcoal |
| [logo-dark.png](assets/logo-dark.png) | Có kênh alpha, chữ trắng và đỏ; còn chi tiết nền | Logo header navy cho cả hai theme; đã kiểm tra nền/viền ở kích thước hiển thị |

Các ảnh có kích thước 2172 × 724, tỷ lệ 3:1. Không kéo giãn, đổi màu bằng CSS filter hoặc tự cắt biểu tượng thành logo mới. Chiều rộng hiển thị đề xuất 144–168px, giữ tỷ lệ; kiểm tra chữ còn rõ trên mobile. Ảnh có nền liền không được giả định là PNG trong suốt. Nếu nền ảnh lệch nền header, đặt trong vùng logo riêng hoặc yêu cầu bản vector/transparent chuẩn; không sửa file gốc.

Lấy mẫu raster theo nhóm màu cho thấy ruby xấp xỉ `#D81840`, navy tối xấp xỉ `#081830`, charcoal xấp xỉ `#101028`, trắng lạnh xấp xỉ `#F0F0F8`. Đây là mẫu gần đúng từ ảnh có biến thiên màu, không phải mã màu từ brand guideline. Token UI dưới đây được điều chỉnh để dùng cho chữ, nền và trạng thái.

### 10.2. Color palette và hướng tham chiếu Pantone

| Màu | Token sRGB dùng trên web | Hướng tham chiếu / vai trò |
| --- | --- | --- |
| Ruby | `#BF0D3E` | Hướng Pantone 193 C; nút chính, lựa chọn và cạnh đang chọn |
| Navy | `#0C2340` | Hướng Pantone 289 C; cấu trúc điều hướng và chữ chính |
| Paper | `#F3F5F8` | Nền sáng trung tính của khu vực làm việc |
| White | `#FFFFFF` | Panel hồ sơ, biểu mẫu và khối mặc định |
| Slate | `#52657C` | Chữ phụ trên nền sáng |
| Blush | `#FCECF1` | Nền lựa chọn sáng; đi cùng viền hoặc chữ ruby |

Mã Pantone là hướng tham chiếu màu cho nhận diện, chưa được đối chiếu với bộ mẫu in hoặc brand guideline. Các mã HEX trong tài liệu là lựa chọn sRGB mô phỏng cho giao diện, không phải công thức chuyển đổi Pantone được chứng nhận. [Pantone 193 C](https://www.pantone.com/hk/en-hk/color-finder/193-c) cũng lưu ý màu màn hình là mô phỏng. Giữ nguyên màu pixel của logo gốc.

### 10.3. Quy tắc 60–30–10

| Tỷ trọng định hướng | Nhóm màu | Áp dụng |
| --- | --- | --- |
| 60% — nền chính | Paper, White và các sắc trung tính cùng họ | Canvas, panel đọc nội dung, biểu mẫu, khoảng trống và mặt khối |
| 30% — màu hỗ trợ | Navy và các sắc slate cùng họ | Header, panel cây tổ chức, cấu trúc thông tin và đường nối |
| 10% — điểm nhấn | Ruby và sắc hồng nhạt/tối cùng họ | Hành động chính, lựa chọn, focus, tab và cạnh đang chọn |

Đây là tỷ lệ thị giác định hướng theo nhóm màu, không phải phép đếm pixel cứng. Không tô thêm đỏ chỉ để đủ 10%; trạng thái thường có thể dùng ít hơn. Khi đóng cây hoặc chuyển sang mobile, ưu tiên khả năng đọc thay vì cố giữ đúng tỷ lệ diện tích.

Theme sáng đặt nền làm việc trung tính và panel cây/header navy, panel hồ sơ trắng. Theme tối đảo nền chính sang navy sâu, dùng navy sáng hơn cho vùng hỗ trợ và ruby sáng hơn cho trạng thái tương tác. Nội dung nghiệp vụ và mọi thao tác vẫn đồng nhất giữa hai theme.

Không tô màu theo cấp để ngụ ý quyền lực. Màu lỗi/success/warning chỉ xuất hiện theo trạng thái, kèm nhãn chữ. Theo yêu cầu người dùng, giao diện sử dụng nhãn chữ thay toàn bộ icon minh họa.

### 10.4. Token giao diện và cảnh 3D

| Token | Light Ruby | Dark Navy |
| --- | --- | --- |
| `background` | #F3F5F8 | #08192E |
| `surface` | #FFFFFF | #102841 |
| `surface-raised` | #FFFFFF | #183654 |
| `text` | #0C2340 | #F3F6FC |
| `text-muted` | #52657C | #B5C5D8 |
| `brand` | #BF0D3E | #FF8CA4 |
| `action-bg` | #BF0D3E | #BF0D3E |
| `action-text` | #FFFFFF | #FFFFFF |
| `action-hover` | #9E0B34 | #9E0B34 |
| `selected-bg` | #FCECF1 | #3E2943 |
| `border-subtle` | #D8E0EA | #38516D |
| `border-control` | #71849B | #8CA1B9 |
| `navigation-bg` | #0C2340 | #183654 |
| `navigation-text` | #F6F8FC | #F6F8FC |
| `navigation-muted` | #BDCBDB | #BDCBDB |
| `navigation-selected` | #3E2943 | #3E2943 |
| `navigation-accent` | #FF97AE | #FF97AE |

CSS nằm trong `src/styles.css`, vật liệu cảnh trong `src/theme.js`. Cảnh sáng dùng mặt bằng slate nhạt, khối trắng, cạnh ruby khi chọn; cảnh tối dùng các lớp navy và accent hồng ruby. Nhãn DOM giữ màu chữ theo theme, không chịu ảnh hưởng ánh sáng. Đổi theme không reset camera, lựa chọn hoặc cây đang mở.

Các màu ruby/pink dành cho chữ trong từng bề mặt khác với màu nền nút; không dùng hồng sáng làm nền nút chữ trắng. Khi bổ sung tài sản Spline, dùng cùng bảng màu, vật liệu mờ và ánh sáng trung tính để hạn chế lệch màu khi render.

### 10.5. Typography — Manrope × Be Vietnam Pro

| Vai trò | Font | Cỡ / weight / line-height |
| --- | --- | --- |
| Tên không gian trong header | Manrope | 17px / 650 / 1.4 |
| Tiêu đề hồ sơ, biểu mẫu | Manrope | 28px / 700 / 1.4 |
| Tiêu đề mục | Manrope | 15–16px / 700 / 1.4 |
| Tên đơn vị trong sơ đồ 2D | Manrope | 15px / 700 / 1.25–1.4 |
| Tên đơn vị trong sơ đồ 3D | Manrope | 12px / 700 / 1.25; nhãn loại 10px, nút nhánh 11px |
| Nội dung nhiệm vụ, quyền hạn | Be Vietnam Pro | 16px / 400 / 1.8 |
| Cây tổ chức (sidebar) | Be Vietnam Pro | 13px / 400–600 / 1.5; tiêu đề 14px, nhãn phụ 11px |
| Bảng dữ liệu | Be Vietnam Pro | 15px / 400–600 / 1.5–1.65 |
| Nút và tab | Be Vietnam Pro | 14px / 500–600 / 1.5 |
| Mã, số lượng, metadata | Be Vietnam Pro | 12px / 400–600 / 1.5; tabular numerals khi cần |

Tiêu đề dùng tracking -0.02em; văn bản dài dùng tracking bình thường, căn trái và giữ đủ khoảng cho dấu tiếng Việt. Không dùng uppercase hoặc tăng tracking cho nội dung dài. Chỉ dùng đậm để chỉ phân cấp/lựa chọn.

Top nav giữ cỡ chữ trước khi tăng: tiêu đề 17px, nút 12px, trạng thái 11px, nhãn phiên bản 10px. Header dùng logo-dark.png có kênh alpha để tránh ô nền ảnh lệch màu với thanh navy. Các khu vực khác tiếp tục dùng thang chữ lớn.

Font được cài qua `@fontsource-variable/manrope` và `@fontsource/be-vietnam-pro`, import trong `src/main.jsx`, build kèm ứng dụng. Manrope là variable font; Be Vietnam Pro dùng các weight 400/500/600/700. Các subset tiếng Việt và Latin tải theo glyph cần dùng; không gọi Google Fonts lúc chạy. Giấy phép OFL đi kèm tại `public/font-licenses`.

### 10.6. Kiểm chứng

Đo tương phản chữ chính, chữ phụ, nút, focus và trạng thái chọn trên cả nền sáng lẫn vùng navy. Kiểm tra font thực sự đã tải, dấu tiếng Việt, tên đơn vị dài, nội dung nhiều dòng và viewport mobile. Không chỉ dựa vào CSS font-family để khẳng định font được render.

Kiểm tra lại zoom 2D, chuyển 2D/3D và các nút chữ sau khi thay typography để phát hiện tràn hoặc nút bị che. Không đưa icon trở lại giao diện.

### 10.7. Màu trang trí theo loại đơn vị

Màu chỉ thể hiện loại đơn vị, không thể hiện cấp bậc, quyền lực hoặc tình trạng duyệt. Nhãn loại luôn đi kèm; không dựa riêng vào màu.

| Loại | Accent sáng | Accent tối | Vị trí |
| --- | --- | --- | --- |
| Ban | #BF0D3E | #FF9AB2 | Nhãn loại, dải trên khối |
| Vụ | #41658D | #A8C8EF | Nhãn loại, dải trên khối |
| Cục | #176F68 | #8ED7CA | Nhãn loại, dải trên khối |
| Văn phòng | #886024 | #EAC68B | Nhãn loại, dải trên khối |
| Phòng | #625786 | #C8BBE4 | Nhãn loại, dải trên khối |

Các accent nằm trong cùng phần điểm nhấn nhỏ của quy tắc 60–30–10; không chia thêm 10% cho mỗi màu. Ruby vẫn là màu lựa chọn/hành động chính. Màu phân loại chỉ dùng trên badge, nút lọc và dải mỏng, giữ phần lớn mặt khối và vùng đọc trung tính. `unitTone` trong `src/theme.js` dùng chung cho UI, 2D và 3D.

## 11. Chuyển động

| Tình huống | Thời lượng đề xuất | Khi giảm chuyển động |
| --- | ---: | --- |
| Mở/đóng panel | 180ms | Hiện/ẩn không trượt |
| Mở/thu gọn nhánh | 240ms | Chuyển thẳng đến bố cục cuối |
| Định vị camera | 450ms | Đổi ngay góc nhìn |
| Chọn đơn vị | 120ms | Đổi viền ngay |
| Đổi tab hồ sơ | 150ms | Đổi nội dung ngay |

Người dùng thao tác camera sẽ hủy animation camera đang chạy. Chọn nút mới thay thế đích chuyển động cũ. Không chờ hiệu ứng kết thúc mới lưu hoặc cập nhật dữ liệu. Tôn trọng `prefers-reduced-motion`; không dùng chuyển động lặp để báo trạng thái chờ duyệt.

### Chuyển động được triển khai

- Cảnh 3D: các khối hiện theo nhánh với độ trễ tối đa 280ms, trượt khi bố cục thay đổi; màu vật liệu nội suy khi hover/chọn, đồng thời nâng nhẹ khối trong chế độ chuyển động thường.
- Khi chọn đơn vị, một điểm ruby chạy dọc đường tổ tiên đúng một lượt (650ms + độ trễ theo đoạn tối đa 210ms), rồi ẩn. Không có luồng sáng chạy lặp hoặc render liên tục khi cảnh đã nghỉ.
- Sơ đồ 2D: đường nối hiện trong 420ms; vị trí nút nội suy trong 320ms khi mở/thu gọn nhánh; viền/nền phản hồi trong 180ms.
- Cây bên trái: nhánh mới mở được hiện bằng mask trong 260ms, không đổi cỡ chữ trong hoạt cảnh.
- Reduced motion: bỏ điểm chạy và nâng khối, đặt ngay trạng thái hình học cuối; 2D không dịch chuyển hoặc vẽ đường theo thời gian. Màu và trạng thái chọn vẫn rõ.
- Khối 3D cùng kích thước 200 × 124 × 44, khoảng ngang được tăng để dành chỗ cho nhãn lớn. Theo điều chỉnh của người dùng, chữ trên khối 3D trở về cỡ trước: tên 12px, loại/mã 10px, nút nhánh 11px, nhãn rộng 124px; tên đầy đủ vẫn đọc được qua cây và hồ sơ khi thu nhỏ toàn cảnh.

## 12. Mô hình dữ liệu phục vụ thiết kế

```typescript
type OrgUnit = {
  id: string;
  structureId: string;
  name: string;
  code?: string;
  type?: string;
  parentId: string | null;
  description?: string;
  order: number;
};

type UnitContent = {
  id: string;
  unitId: string;
  kind: 'duty' | 'authority';
  parentContentId: string | null;
  number?: string;
  text: string;
  order: number;
  sourceIds: string[];
};

type ViewState = {
  structureId: string;
  revisionId: string;
  selectedUnitId: string | null;
  expandedUnitIds: string[];
  view: '3d' | '2d' | 'list';
  activeTab: 'overview' | 'children' | 'duties' | 'authorities' | 'sources' | 'history';
  focusedRootId: string | null;
  query: string;
};
```

Đây là mô hình logic rút gọn, không thay schema production. Metadata phiên bản, trạng thái, hiệu lực và audit nằm ở lớp quản lý bản ghi. `parentId` cùng structure/phiên bản, không tự nối sang cơ cấu khác. `parentContentId` phải thuộc cùng đơn vị và cùng loại nội dung; không có chu trình. ID ổn định khi đổi tên hoặc đổi cha.

`depth` tính từ quan hệ cha–con, không nhập tay. Tọa độ 3D là trạng thái trình bày có thể tính lại; không thay thế `parentId`. Nhiệm vụ của đơn vị cha không được tính bằng phép cộng nội dung của các đơn vị con.

## 13. Trạng thái và khả năng tiếp cận

| Trạng thái | Cách xử lý |
| --- | --- |
| Chưa có cơ cấu | Giải thích ngắn và nút tạo khi có quyền |
| Đơn vị không có con | Không hiện nút mở rộng giả |
| Nhiệm vụ/quyền hạn trống | “Chưa có dữ liệu” và tác vụ bổ sung khi được phép |
| Nhánh đang tải | Chỉ báo tại nhánh, không khóa toàn trang |
| Không tìm thấy | Hiện từ khóa và cách xóa bộ lọc |
| Dữ liệu sai quan hệ | Chặn thao tác gây chu trình và chỉ ra lỗi |
| Lưu thất bại | Giữ nội dung đang nhập, cho thử lại |
| Xung đột phiên bản | Giữ bản nhập, mở so sánh; không ghi đè âm thầm |
| WebGL không khả dụng | Chuyển 2D hoặc danh sách, giữ lựa chọn và bộ lọc |
| Không có quyền | Không lộ nội dung; nút UI và API cùng tuân thủ quyền |

Mọi tác vụ phải thực hiện được bằng bàn phím qua cây/danh sách và biểu mẫu. Nhãn có tên đầy đủ cho trình đọc màn hình. Focus hiển thị rõ và được trả về đúng nơi sau khi đóng panel/modal. Canvas không là cách duy nhất truy cập nội dung.

Không chèn `fullText` thành HTML chưa làm sạch. Không đưa dữ liệu tổ chức nội bộ vào tài sản Spline hoặc dịch vụ bên ngoài chỉ để dựng hình mẫu.

## 14. Hiệu năng và điều kiện kiểm chứng

Chỉ dựng các nhánh đang mở. Có thể tải con theo yêu cầu, phân trang nội dung dài và giới hạn nhãn DOM. Dừng render khi tab ẩn, giải phóng tài nguyên khi đổi cảnh; giữ giao diện tra cứu hoạt động trong lúc tải tài sản 3D.

Mục tiêu đề xuất: phản hồi chọn nút dưới 200ms sau khi dữ liệu đã tải; tối thiểu 30fps khi điều hướng trên bộ dữ liệu và thiết bị nghiệm thu. Quy mô dữ liệu, cấu hình thiết bị và cách đo phải được ghi rõ trước khi đánh giá; số nút trong HTML không phải giới hạn sản phẩm.

## 15. Tiêu chí chấp nhận thiết kế

- Cây thử nghiệm có ít nhất bốn cấp; ở mỗi cấp đều mở được nhiệm vụ và quyền hạn riêng.
- Chọn đơn vị cha khi nhánh đang thu gọn vẫn đọc được nội dung của cha.
- Mở nhiệm vụ con không làm xuất hiện thêm tầng đơn vị trong cây.
- Thu gọn nhánh không xóa dữ liệu và xử lý lựa chọn đang nằm trong nhánh nhất quán.
- Tìm đơn vị sâu tự mở đúng đường tổ tiên; chọn trong cây và trong 3D mở cùng hồ sơ.
- Chuyển đơn vị sang cha mới giữ nguyên ID và nội dung, từ chối chuyển vào hậu duệ.
- 3D, 2D và danh sách giữ cùng lựa chọn, phiên bản và trạng thái mở nhánh.
- Không có thao tác quản lý nào bắt buộc người dùng phải xoay hoặc kéo đối tượng 3D.
- Tên dài, nhiều đơn vị cùng tên, đơn vị trống, cây sâu và nhánh rộng có thể phân biệt bằng đường dẫn/mã.
- Giảm chuyển động và lỗi WebGL không chặn việc tra cứu hoặc chỉnh sửa.
- HTML và hai bài viết chỉ là nguồn tham khảo; không hard-code cơ cấu hoặc số lượng từ chúng.

## 16. Phạm vi bàn giao và quyết định còn mở

File này là định hướng thiết kế để xây dựng ứng dụng, không phải báo cáo tính năng đã chạy. Chưa tạo dự án Spline, mô hình GLB, bản mẫu web hoặc kết quả kiểm thử trình duyệt.

Trước triển khai cần chốt: danh mục cơ cấu thực tế, trường hồ sơ bắt buộc, vai trò người dùng, quy trình duyệt, nguồn dữ liệu chính thức, quy mô mục tiêu, framework/backend và môi trường triển khai. Các quyết định này không thay đổi nguyên tắc đã xác nhận: tổ chức đa cấp và nội dung riêng tại mọi cấp.
