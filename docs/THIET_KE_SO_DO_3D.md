# Đặc tả thiết kế sơ đồ 3D — SDTQ

| Thuộc tính | Giá trị |
| --- | --- |
| Phiên bản | 0.1 — đề xuất thiết kế, 15/10/2026 |
| Định dạng đã xác nhận | Đặc tả chi tiết Markdown |
| Chế độ trải nghiệm | Operate: quản lý và kiểm tra dữ liệu nội bộ |
| Căn cứ | [BRD](BRD.md), [SRS](SRS.md), [HTML](../graph_toan_canh.html) |
| Phương pháp | [Impeccable](C:/Users/admin/.agents/skills/impeccable/SKILL.md) |

## 1. Mục tiêu và trạng thái thiết kế

Người dùng cần biết đang xem bộ dữ liệu nào, đơn vị liên quan đến ai, nội dung nào đã được duyệt và căn cứ cho quan hệ. Sơ đồ 3D hỗ trợ định vị và kiểm tra; biểu mẫu và bảng là nơi quản lý nội dung dài.

Tài liệu áp dụng nguyên tắc Impeccable cho công cụ vận hành: phân cấp thông tin rõ, giảm tải nhận thức, phản hồi có mục đích, trạng thái lỗi đầy đủ và đường thao tác tiếp cận được. Đây là đề xuất bàn giao; chưa có bản dựng, ảnh kiểm chứng, tài sản Spline hay kiểm thử UX. Màu, bố cục và thông số camera dưới đây là thông số khởi điểm để triển khai và đánh giá, không phải lựa chọn thẩm mỹ đã được người dùng phê duyệt.

Kế thừa nền sáng, chữ tối, xanh cho lựa chọn và ba chế độ của HTML. Giữ nguyên nội dung gốc khi nhập. Thay cách ẩn toàn bộ nhãn đơn vị trong chế độ nội dung bằng nhãn ưu tiên để người dùng vẫn nhận diện được đơn vị đang làm việc.

## 2. Kiến trúc thông tin

| Khu vực | Nội dung | Hành động chính |
| --- | --- | --- |
| Thanh ngữ cảnh | Dataset, snapshot/trạng thái nháp, mốc nguồn | Đổi phạm vi và bản xem |
| Điều hướng trái | Tìm kiếm, cây đơn vị, bộ lọc | Chọn đơn vị, xem cảnh báo dữ liệu |
| Không gian chính | 3D hoặc cây/bảng, chuyển Tổ chức/Nhiệm vụ/Quyền hạn | Khám phá quan hệ, định vị |
| Hồ sơ phải | Tên đầy đủ, nội dung, quan hệ, nguồn, lịch sử | Đọc, mở chỉnh sửa nếu có quyền |
| Vùng tác vụ biên tập | Trạng thái lưu, lỗi, Lưu nháp, Gửi duyệt | Thực hiện mutation rõ ràng |
| Khu vực thẩm định | Diff, nguồn, lý do trả lại, Duyệt | Ra quyết định có căn cứ |

Không đặt nút Duyệt lên đối tượng 3D. Không bắt người dùng xoay camera để truy cập chức năng CRUD. Dataset và mốc nguồn luôn nhìn thấy cả khi mở hồ sơ.

## 3. Bố cục và wireframe

### 3.1. Desktop — viewport mẫu 1440 × 900

Thanh đầu cao 64px. Cột trái 272px. Hồ sơ phải rộng 368px khi mở; canvas co theo vùng còn lại. Khoảng đệm 16–24px. Ở độ rộng dưới 1200px, chỉ mở một panel phụ để canvas còn đủ chỗ.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ SDTQ  [Bộ dữ liệu ▾] [Phiên bản ▾]  Mốc nguồn  Trạng thái  Tài khoản       │
├────────────────┬───────────────────────────────────┬─────────────────────┤
│ Tìm đơn vị     │ Tổ chức | Nhiệm vụ | Quyền hạn    │ Tên đơn vị đầy đủ   │
│ Bộ lọc        │ [3D] [Cây/Bảng]                    │ Đã duyệt / Bản nháp │
│ Cây đơn vị    │                                   │ Tổng quan           │
│              │      Cụm đơn vị và quan hệ         │ Nhiệm vụ / Quyền hạn│
│ Cảnh báo      │      chỉ của phạm vi đang chọn    │ Quan hệ / Nguồn     │
│ cần rà soát   │                                   │ Lịch sử             │
│              │ [−] [+] [Toàn cảnh] [Góc nhìn]      │ [Chỉnh sửa]         │
├────────────────┴───────────────────────────────────┴─────────────────────┤
│ Chú giải • Số kết quả • Thông báo thao tác / trạng thái lưu               │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Tablet và mobile

- 768–1199px: cây mở bằng drawer; hồ sơ là panel, không mở cùng cây nếu không đủ chiều rộng.
- 360–767px: mặc định bảng/danh sách; 3D là lựa chọn chủ động. Dòng ngữ cảnh có thể xuống hàng.
- Chi tiết mở thành trang/panel toàn chiều rộng, biểu mẫu một cột; hành động cuối biểu mẫu giữ khoảng an toàn bàn phím ảo.
- Canvas mobile không chiếm gesture cuộn trang ngoài vùng của nó. Có nút điều khiển thay pinch/rotate.
- Nút chạm mục tiêu tối thiểu 44 × 44px; không dùng tooltip hover làm cách duy nhất đọc tên.

## 4. Ngữ pháp đồ họa 3D

### 4.1. Ý nghĩa hình dạng

| Đối tượng | Hình | Nhãn và cách đọc |
| --- | --- | --- |
| Đơn vị | Khối hộp mỏng, góc mềm | Tên đơn vị; luôn hiện khi được chọn |
| Nhiệm vụ | Đĩa tròn nổi thấp | Số hiệu; toàn văn trong panel |
| Nhiệm vụ con | Lăng trụ tam giác nhỏ | Số hiệu và tên cha trong panel |
| Quyền hạn | Khối vuông nhỏ | Số hiệu; nhãn “Quyền hạn” trong panel |
| Dữ liệu chưa xác minh | Biểu tượng cảnh báo + nét chấm | Chỉ hiện trong nháp có quyền; không giả như cạnh hợp lệ |

Hình dạng nhiệm vụ/quyền hạn kế thừa chú giải HTML. Màu không phải tín hiệu duy nhất. Không dùng kích thước lớn hơn để ám chỉ quyền lực nếu không có định nghĩa dữ liệu.

### 4.2. Quan hệ

Quan hệ phân cấp dùng đường liền và mũi tên theo chiều được quy định trong schema. Quan hệ phối hợp dùng nét đứt, nhãn loại; chỉ hiện khi bật bộ lọc phù hợp. Quan hệ nội dung nối đơn vị với nhiệm vụ không được trình bày như cơ quan trực thuộc. Khi chọn cạnh, panel hiện loại, hai đầu, nguồn và khoảng thời gian.

Loại chưa rõ không dùng mũi tên khẳng định; đặt trong danh sách cần rà soát. Hướng của `subDutyOf` được chuẩn hóa là con → cha; renderer có thể sắp xếp cha ở trên nhưng phải giữ mũi tên theo dữ liệu.

### 4.3. Tọa độ và phân cụm

Dùng Y là trục đứng. X chia nhánh; Z tách các cụm để giảm giao cắt. Với một cây đã xác minh, khởi điểm khoảng cách ngang 180 đơn vị cảnh, cách tầng Y 140, độ sâu cụm Z 120. Kích thước đơn vị mẫu 120 × 40 × 12; camera tự fit theo bounds. Các thông số không phải thước đo nghiệp vụ.

Thuật toán đề xuất: chia thành phần liên thông → tách các cạnh phân cấp → xếp tầng ổn định theo ID/order → giãn nhánh bằng bounding box nhãn → route cạnh phụ ngoài cụm. Nếu một nút có nhiều cha hợp lệ, chỉ có một mesh và nhiều cạnh; không nhân đôi hồ sơ để ép thành cây. Cạnh phi phân cấp không quyết định tầng.

Mỗi dataset là một cảnh riêng. Không xếp ba nguồn thành ba tầng quyền lực. Chính quyền địa phương hoặc cơ quan trung ương chỉ được bố trí thành nhóm khi dữ liệu đã có phân loại được duyệt.

### 4.4. Mật độ và nhãn

- Toàn cảnh chỉ hiện đơn vị và số lượng nội dung, không mở đồng thời 239 nút nội dung của baseline.
- Khi chọn chế độ nhiệm vụ/quyền hạn và một đơn vị, mở nội dung của đơn vị đó; có tùy chọn toàn cảnh nội dung để giữ khả năng cũ.
- Nhãn HTML chiếu từ tọa độ 3D, chữ luôn thẳng; ưu tiên selected → đường tổ tiên → kết quả tìm → nút còn lại.
- Khi nhãn giao nhau, ẩn nhãn ưu tiên thấp và giữ truy cập bằng cây; không thu chữ xuống dưới 12px để nhét đủ.
- Nút chọn được phải có hit area tối thiểu 24px ở không gian màn hình hoặc có lựa chọn tương đương trong cây/bảng.
- Tên dài rút gọn trên cảnh, đầy đủ trong panel và accessible name; không làm mất tên gốc.

## 5. Camera và thao tác

Camera phối cảnh khởi điểm FOV 35°, góc nhìn chéo nhẹ; có preset Trước, Chéo, Trên và Toàn cảnh. Giới hạn xoay tránh lật cảnh. Không tự quay khi người dùng đang đọc hoặc gõ.

| Tác động | Kết quả | Bảo toàn trạng thái |
| --- | --- | --- |
| Click/chọn trong cây | Chọn entity, mở hồ sơ, nhấn mạnh cạnh liên quan | Không đổi mode |
| Chọn kết quả tìm | Định vị entity, bỏ che nhãn | Giữ query và snapshot |
| Chọn Nhiệm vụ/Quyền hạn | Lọc loại nội dung | Giữ đơn vị chọn; có nút “Toàn bộ đơn vị” |
| Click vùng trống | Bỏ hover/tooltip | Không xóa lựa chọn hoặc biểu mẫu đang sửa |
| Kéo trên nền | Xoay/pan theo chế độ điều khiển | Không chỉnh dữ liệu tổ chức |
| Toàn cảnh | Fit các nút đang lọc | Không reset dataset và mode |
| Escape | Đóng overlay trên cùng, trả focus về nút mở | Biểu mẫu bẩn cần cảnh báo |
| Chuyển 3D/Bảng | Đổi cách trình bày | Giữ selection, query, mode, revision |

Khác HTML cũ: đổi chế độ không tự xóa focus; bấm đơn vị lần hai không ngầm hủy bộ lọc, dùng nút rõ nghĩa. Kéo nút tự do chỉ nên bổ sung ở chế độ bố cục riêng, không có trong MVP quản lý nghiệp vụ.

## 6. Quy tắc giao diện theo Impeccable

| Token đề xuất | Giá trị | Mục đích |
| --- | --- | --- |
| canvas | #F5F6F8 | Nền dịu, không cạnh tranh dữ liệu |
| surface | #FFFFFF | Panel và biểu mẫu |
| text | #202936 | Văn bản chính |
| text-muted | #526171 | Văn bản phụ; phải đo tương phản |
| accent | #185ABC | Lựa chọn, focus, hành động chính |
| border | #D7DDE5 | Phân vùng |
| danger | #B42318 | Lỗi, thao tác ngừng hiệu lực |
| warning | #8A4B08 | Cần rà soát |
| success | #176B47 | Đã duyệt; luôn kèm chữ |

Font ưu tiên hệ thống hỗ trợ tiếng Việt: Segoe UI, Arial, sans-serif. Nội dung 14–16px, line-height 1.5–1.6; tiêu đề hồ sơ 22px; nhãn điều khiển 13–14px. Khoảng cách theo thang 4/8/12/16/24/32px. Panel dùng đường phân cách, không bọc mọi trường trong thẻ riêng. Nội dung dài căn trái, không căn đều như tooltip cũ.

Một màn hình có một tác vụ chính theo trạng thái: nháp là Lưu/Gửi duyệt, thẩm định là Duyệt/Trả lại. Nút nguy hiểm có mô tả hệ quả cụ thể. Không dùng glow liên tục, nền hạt, glassmorphism hoặc hiệu ứng bay chữ làm giảm khả năng đọc sơ đồ nghiệp vụ.

## 7. Đặc tả chuyển động — Motion và Three.js

Motion dùng cho DOM: panel, bộ lọc, thông báo, focus feedback; Three.js quản lý camera và transform cảnh. Một thuộc tính chỉ có một nơi ghi; không để Motion và render loop cùng cập nhật camera.position. Tài liệu chính thức: [Motion for React](https://motion.dev/docs/react).

| Sự kiện | Thời lượng đề xuất | Cách chuyển | Reduced motion |
| --- | ---: | --- | --- |
| Hover nút | 100ms | Đổi màu/viền | Đổi tức thì |
| Mở panel | 180ms | Opacity + translate 8px | Không dịch chuyển |
| Thay bộ lọc | 160ms | Fade kết quả, giữ vùng bố cục | Cập nhật tức thì |
| Chọn node | 120ms | Viền và màu nhấn | Cập nhật tức thì |
| Camera định vị | 450ms | Nội suy vị trí + target, ease-out | Nhảy đến góc cuối |
| Bung cụm | 240ms | Nội suy đến layout đã tính | Dùng layout cuối |
| Lưu thành công | 150ms | Hiện thông báo text | Hiện text tức thì |

Chuyển động phải ngắt được khi người dùng kéo camera hoặc chọn mục khác; chỉ chạy đích mới nhất. Không có vòng lặp tự chạy lúc rảnh. Reduced motion lấy từ hệ điều hành và có cấu hình người dùng; vẫn giữ phản hồi trạng thái bằng chữ. Không trì hoãn cập nhật dữ liệu để đợi animation.

## 8. Kiến trúc triển khai đề xuất

```text
API có phân quyền + kho snapshot
              │
              ▼
       Store trạng thái ứng dụng
       dataset / revision / mode / selection / filters
          │              │                  │
          ▼              ▼                  ▼
      Cây & bảng    Hồ sơ / biểu mẫu    Bộ dựng Three.js
      DOM chuẩn      Motion cho DOM     layout / camera / picking
                                             ▲
                                             │
                                GLB mẫu thiết kế từ Spline
```

Frontend React + TypeScript là đề xuất thuận tiện cho Motion; chưa chốt với người dùng. Có thể dùng Three.js trực tiếp trong component quản lý vòng đời. Không yêu cầu React Three Fiber để hoàn thành thiết kế. Backend và cơ sở dữ liệu lựa chọn sau khi chốt hạ tầng.

Three.js nhận graph đã kiểm tra, tạo mesh/edges, chọn đối tượng và đồng bộ selection. Khi unmount hoặc đổi cảnh phải dispose geometry/material/texture, bỏ listeners và hủy animation frame. Có resize observer; pixel ratio giới hạn đề xuất 1.5 trên mobile, 2 trên desktop. Render theo thay đổi, tiếp tục loop chỉ trong chuyển động hoặc điều khiển có damping. Tham chiếu API: [Three.js documentation](https://threejs.org/docs/).

Store không giữ một bản dữ liệu nghiệp vụ khác trong Spline. Mesh lưu entityId, không lưu fullText nhạy cảm trong metadata tài sản dùng lại. DOM xử lý toàn văn bằng text an toàn, không tái sử dụng innerHTML của HTML gốc.

## 9. Quy trình thiết kế và bàn giao Spline

Spline được dùng để dựng bộ mẫu khối, kiểm tra góc nhìn và vật liệu. Đề xuất xuất GLB của hình học để Three.js dựng cảnh dữ liệu động. Spline hỗ trợ xuất glTF/GLB theo [tài liệu xuất định dạng 3D](https://docs.spline.design/exporting-your-scene/files/exporting-as-gtlf-glb); cần thử xuất trên tài khoản thực tế trước cam kết quy trình.

### 9.1. Cấu trúc scene cần dựng ở giai đoạn triển khai

```text
SDTQ_Component_Study
  Cameras
    Camera_Oblique
    Camera_Front
  Lighting
    KeyLight
    FillLight
  Components
    Unit_Default
    Unit_Selected
    Duty_Default
    SubDuty_Default
    Authority_Default
  Samples
    Sample_Parent_Child
    Sample_MultiParent
    Sample_LongName
```

Tên mẫu không chứa dữ liệu nội bộ. Pivot từng khối ở tâm, trục Y lên; khối đơn vị chuẩn 1 × 0.33 × 0.10 trước khi scale trong Three.js. Vật liệu mờ, ánh sáng đơn giản, không transmission hoặc texture lớn cho khối cơ bản. Nhãn tiếng Việt dựng bằng DOM trong ứng dụng để tìm kiếm và tiếp cận được.

### 9.2. Gói bàn giao tài sản tương lai

| Tài sản | Nội dung kiểm tra |
| --- | --- |
| Dự án Spline gốc | Đúng hierarchy, tên đối tượng, camera, vật liệu và quyền truy cập |
| unit.glb, duty.glb, sub-duty.glb, authority.glb | Scale, pivot, màu, normals, khả năng load qua Three.js |
| asset-manifest.json | Tên file, checksum, phiên bản, nguồn, quyền sử dụng |
| Ảnh tham chiếu | Trước/chéo và trạng thái selected để so với runtime |

Không giả định GLB mang theo event, biến hay tương tác Spline; những phần này phải dựng lại trong ứng dụng. Nếu vật liệu xuất lệch, dùng vật liệu Three.js tương đương và đối chiếu ảnh mẫu. Nếu quyền xuất không đáp ứng, dùng primitive Three.js theo kích thước đã đặc tả; ghi nhận đây là phương án thay thế tài sản Spline.

Không nhúng Spline Runtime cùng canvas Three.js để render cùng một graph. Nếu sau này chọn runtime Spline cho màn giới thiệu riêng, tách route và load theo yêu cầu; đây không phải MVP. Không có `.spline` hoặc `.splinecode` được tạo trong lần bàn giao tài liệu này.

## 10. Trạng thái màn hình và nội dung hiển thị

| Trạng thái | Nội dung | Hành động |
| --- | --- | --- |
| Đang tải dữ liệu | “Đang tải phiên bản…” | Không hiển thị dữ liệu cũ dưới nhãn mới |
| Đang tải 3D | Cây/bảng đã dùng được | “Tiếp tục ở bảng” |
| Dataset rỗng | “Chưa có hồ sơ trong bộ dữ liệu này” | Nhập/Tạo khi có quyền |
| Không tìm thấy | Hiện từ khóa và bộ lọc | Xóa lọc; không mất dataset |
| Chưa có nguồn | “Cần bổ sung căn cứ” | Mở trường nguồn trong nháp |
| Không có quyền | Thông báo ngắn, không lộ nội dung | Quay về danh sách được phép |
| Lỗi WebGL | “Không thể mở chế độ 3D” | Chuyển cây/bảng |
| Lưu lỗi | Giữ nguyên biểu mẫu | Thử lại; không báo thành công |
| Xung đột | Hiện bản nhập và phiên bản máy chủ | So sánh, chọn cách xử lý |
| Chờ duyệt | Nội dung chỉ đọc, người gửi và thời gian | Người duyệt mở diff |
| Trả lại | Lý do hiển thị trước biểu mẫu | Tạo lượt sửa mới |
| Đã duyệt | Dấu trạng thái + thời gian + nguồn | Tạo nháp mới nếu được phép |

## 11. Khả năng tiếp cận và hiệu năng

Canvas có mô tả, nhưng cây/bảng DOM mới là đường tương tác thay thế đầy đủ. Chọn node thông báo qua vùng aria-live lịch sự; không đọc mọi frame. Các nút có accessible name; focus outline rõ; modal đúng focus trap và trả focus. Trong bảng, dùng semantic table; trong cây, tuân theo điều khiển bàn phím của tree hoặc dùng danh sách phân cấp đơn giản.

Ngân sách khởi điểm: tối đa 200 nhãn DOM đồng thời; mô hình mẫu tổng ≤ 1MB nén; tránh shadow thời gian thực cho mỗi nút. Các mức này là ngân sách đề xuất, phải đo trên build. Với hàng nghìn node, ưu tiên phân cụm, culling và instancing cho geometry giống nhau; không giảm chính xác dữ liệu để đạt FPS.

Đạt các mục tiêu NFR trong SRS trên baseline trước mở rộng. Khi FPS thấp kéo dài, giảm chi tiết và gợi ý chế độ bảng; giữ nguyên selection và dữ liệu. Dừng render khi tab ẩn. Không bắt buộc tải tài sản Spline trước khi người dùng tìm hoặc chỉnh hồ sơ.

## 12. Checklist nghiệm thu thiết kế và triển khai

| ID | Điều kiện |
| --- | --- |
| D-01 | Dataset, snapshot và mốc nguồn luôn nhìn thấy, kể cả khi mở panel |
| D-02 | Chế độ nội dung không làm mất nhận diện đơn vị được chọn |
| D-03 | Click node/cây/kết quả tìm cho cùng entityId và hồ sơ |
| D-04 | Không có quan hệ tổ chức được tạo chỉ từ vị trí hay màu |
| D-05 | Mọi thao tác quản lý hoàn tất được qua DOM không cần 3D |
| D-06 | Reduced motion bỏ di chuyển camera và chuyển động không thiết yếu |
| D-07 | Long name, đa cha, dataset rỗng, lỗi nguồn, lỗi WebGL và xung đột đều có trạng thái |
| D-08 | Spline → GLB → Three.js được kiểm tra bằng một mẫu trước sản xuất cả bộ |
| D-09 | Màu/typography được đo tương phản và ảnh desktop/mobile được đối chiếu khi có bản dựng |
| D-10 | Ba mươi cạnh thiếu loại từ HTML không hiện như quan hệ đã xác thực |

Khi triển khai: dựng đầy đủ → kiểm tra một lượt gộp desktop/mobile và các trạng thái chính → sửa theo phát hiện → xác nhận một lượt. Hiện tại mới kiểm tra tính nhất quán tài liệu; không có kết quả đo FPS, kiểm tra trình duyệt hoặc nghiệm thu tài sản 3D.

## 13. Thứ tự triển khai khuyến nghị

1. Chuẩn hóa dữ liệu, quyền và vòng đời revision theo SRS.
2. Dựng cây/bảng, hồ sơ và luồng sửa–duyệt hoạt động hoàn chỉnh.
3. Tạo một mẫu Spline và kiểm tra tuyến xuất GLB; chốt cách dùng tài sản.
4. Dựng Three.js từ cùng store, đồng bộ lựa chọn và panel.
5. Thêm Motion, reduced motion, trạng thái lỗi và giới hạn hiệu năng.
6. Kiểm tra bằng các AT trong SRS và D-01…D-10; bàn giao bằng chứng thực tế.
