# Sơ đồ tổ chức 3D · THEHEGEO

Ứng dụng giao diện theo `design.md`, dùng Next.js App Router + TypeScript, React Three Fiber + Drei + Post-processing (cảnh 3D isometric), Tailwind CSS (lớp giao diện 2D phủ trên canvas), Motion (trượt panel, popup hover), Zustand (store dùng chung giữa cảnh 3D và giao diện) và nhận diện logo trong `assets`.

## Chạy tại máy

```powershell
npm install
npm run dev
```

Mở http://127.0.0.1:5173. Để tạo bản tĩnh Next.js trong `out/`: `npm run build`. Để xem bản build: `npm run preview` (hoặc `npm start`). Node.js 22 trở lên. `npm run dev:legacy` giữ điểm vào Vite cũ.

## Chức năng

- Sơ đồ 3D phối cảnh (FOV 35°, sương mù theo khoảng cách, bóng đổ thật): khối cùng chiều cao ở mọi cấp (BRD R-07), có viền theo token; đơn vị có nhánh mở có mặt bằng nổi chứa các đơn vị con (mặt bằng lồng nhau); nhiều con được xếp lưới (12 vụ, cục → 4 × 3). Preset Phối cảnh / Từ trên / Chính diện, định vị và toàn cảnh; kéo để di chuyển, cuộn để thu phóng, chuột phải để xoay. Bàn phím: mũi tên hoặc W A S D để di chuyển theo hướng nhìn, Shift + mũi tên hoặc Q/E để xoay, +/− hoặc PageUp/PageDown để thu phóng, Home để về toàn cảnh; phím không tác động khi đang gõ hoặc khi focus nằm trong panel.
- Hoạt cảnh: camera bay vào khi mở, khối mọc lên theo cấp, trượt mượt khi mở/thu gọn nhánh, nhấc lên khi rê chuột hoặc khi chọn. Không có chuyển động lặp; khi đứng yên cảnh không render. Tôn trọng giảm chuyển động của hệ điều hành.
- Rê chuột lên khối hiện popup tóm tắt (loại, mã, đơn vị cha, số nhiệm vụ / quyền hạn / đơn vị con); nhấp khối mở panel hồ sơ trượt từ phải.
- Lọc theo loại đơn vị và tìm kiếm: khối không khớp được làm mờ trên cảnh, danh sách kết quả hiện trong panel cây.
- Cây nhiều cấp, mở/thu gọn, tìm kiếm tiếng Việt không dấu, xem riêng một nhánh.
- Chế độ 2D và danh sách, giữ cùng lựa chọn và trạng thái cây. Trong 2D: dùng nút +/− hoặc con lăn để thu phóng, kéo nền để di chuyển, Toàn cảnh để vừa lại sơ đồ, Định vị để đưa đơn vị đang chọn vào giữa. Khi focus trên sơ đồ, dùng +/−, phím mũi tên và Home.
- Chuyển qua lại 3D/2D/Danh sách; nút 3D cho phép thử lại sau lỗi WebGL. Thanh công cụ và biểu mẫu dùng nhãn chữ, không có bộ icon minh họa.
- Hồ sơ riêng tại mọi cấp: chức năng, nhiệm vụ, quyền hạn, con trực tiếp.
- Thêm/chỉnh sửa đơn vị, thay đổi cha, ngăn chu trình và giữ nội dung gắn với đơn vị.
- Theme Light Ruby / Dark Navy; reduced motion; đường thao tác DOM khi không có WebGL.
- Palette ruby–navy theo hướng Pantone; quy tắc 60–30–10: nền trung tính 60%, navy hỗ trợ 30%, ruby tương tác 10% (tỷ trọng thị giác định hướng). Manrope cho tiêu đề/nhãn sơ đồ, Be Vietnam Pro cho nội dung và điều khiển; font được phục vụ từ bản build, giấy phép tại `public/font-licenses`.
- Cỡ chữ: nội dung 16px, sidebar 13px, 2D 15px, tiêu đề hồ sơ 28px; riêng nhãn 3D giữ cỡ nhỏ ban đầu (tên 12px, loại/mã 10px). Accent theo loại đơn vị trên nhãn và dải mặt khối: ruby, slate, teal, vàng trầm, tím slate. Khi chọn, điểm nhấn chạy dọc đường nối một lượt rồi dừng; mở nhánh 2D/3D có nội suy bố cục. Reduced motion bỏ chuyển động không thiết yếu.
- Xuất/nhập JSON có kiểm tra cấu trúc, giới hạn 5 MB và 2.000 đơn vị.

## Dữ liệu và giới hạn

Dữ liệu mặc định là cơ cấu **Ban Tổ chức Trung ương** trích từ `graph_toan_canh.html` bằng `node scripts/extract-reference.mjs` → `src/data/ban-to-chuc-trung-uong.json`: 19 đơn vị (Ban, 9 vụ, 2 cục, Văn phòng Ban, 6 phòng), 135 nhiệm vụ kèm 47 ý con, 57 quyền hạn, giữ nguyên số hiệu và sắp theo số hiệu. SHA-256 file nguồn khớp mã đối chiếu trong SRS. Nguồn **chưa được đối chiếu với văn bản quy định hiện hành**; giao diện ghi rõ điều này. Ô trống trong nguồn được hiển thị là trống (ví dụ Ban chưa có nhiệm vụ riêng, 6 phòng chưa có quyền hạn), không tự suy. 12 cạnh nét đứt giữa các đơn vị không có chú giải nên chưa ánh xạ; được lưu trong `unmappedRelations` để xử lý sau.

Thay đổi dữ liệu chỉ giữ trong bộ nhớ phiên trình duyệt. Dùng **Xuất JSON** để lưu file và **Nhập dữ liệu** để mở lại. Chỉ lựa chọn theme được lưu trong localStorage. Không có đăng nhập, phân quyền máy chủ, workflow duyệt, cơ sở dữ liệu hoặc đồng bộ nhiều người dùng; “Bản làm việc” không phải phiên bản đã duyệt.

Spline tạm hoãn theo quyết định ngày 15/10/2026: khối được dựng bằng primitive R3F theo token trong `src/theme.js`. Có thể thay bằng GLB sau khi có tài sản và quyền sử dụng.

2D dùng SVG; 3D dùng R3F, nhãn và popup là DOM (`Html` của Drei) để đọc được và truy cập bằng bàn phím.

**Hiệu năng.** Ba bậc chất lượng: 0 (không bóng, DPR 1), 1 — mặc định (bóng đổ, DPR ≤ 1.25), 2 (thêm hậu kỳ SMAA + Vignette, DPR ≤ 1.5). Cảnh tự hạ bậc khi trung vị khung hình dưới ~55 fps lúc đang chuyển động. Shadow map chỉ vẽ lại khi cảnh thay đổi, không vẽ lại khi chỉ xoay camera. Đo ngày 16/10/2026 trên GPU Intel tích hợp (ANGLE D3D11), 19 khối, tỉ lệ màn hình 1.5×: bậc 1 render ≈ 7 ms/khung khi không thao tác, ≈ 68 fps khi xoay bằng chuột tự động; bậc 2 ≈ 38 fps, vì vậy không bật mặc định. N8AO đã bỏ vì làm mất bóng đổ của đèn chính khi chạy cùng. Tham số URL: `?fps` hiện bộ đếm khung hình (render liên tục), `?quality=0|1|2` ép bậc chất lượng.

## Kiểm tra

```powershell
npm test
npm run build
```

Kiểm thử logic bao gồm cây bốn cấp, nội dung riêng, thu gọn, phát hiện chu trình, tham chiếu hỏng, tìm kiếm không dấu và bố cục nhánh.

Kiểm thử trình duyệt: chạy dev server rồi `npm run test:browser` (nên dùng bản production qua `npm run preview` để tránh thời gian biên dịch lần đầu) (cần Microsoft Edge được cài). Có thể đặt `PREVIEW_URL` để kiểm tra server khác. Kịch bản kiểm tra tương tác thực, xuất/nhập JSON, theme, mobile và fallback khi WebGL không khả dụng; ảnh và dữ liệu kiểm thử nằm trong `.local/qa` (không đưa vào Git).

Kiểm tra riêng thao tác 2D: `node scripts/browser-check-2d.mjs` (dev server đang chạy). Bao gồm zoom vào/ra, con lăn, kéo nền, bàn phím, Toàn cảnh, Định vị và chọn đơn vị trên viewport desktop/mobile.

Kiểm tra chuyển chế độ: `node scripts/browser-check-view-switch.mjs` kiểm tra chuyển qua lại nhiều lần, mất context thật, mở lại 3D, giao diện không có icon thư viện và fallback khi trình duyệt không có WebGL.

Kiểm tra typography/theme: `node scripts/browser-check-theme.mjs` xác nhận font nội bộ, glyph tiếng Việt, hai theme và bố cục mobile.

## Journey mode

Chọn **Journey mode** trên navbar để khám phá cơ cấu theo lộ trình 3D. Camera chuyển mượt tới trạm được chọn; vẫn xoay và thu phóng tự do. Dùng Trạm trước / Trạm tiếp theo hoặc danh sách Đi đến trạm; tìm không dấu và lọc theo cụm/cấp tổ chức. Hồ sơ có Tổng quan, Nhiệm vụ, Quyền hạn và Đơn vị con. Chọn đơn vị con đưa camera tới đúng trạm.

Dữ liệu mặc định dùng cơ cấu đang làm việc. Chọn **Doanh nghiệp mẫu · minh họa** để thử 13 đơn vị, ba khối và hai lớp con; dữ liệu mẫu không ghi đè dữ liệu đang quản lý. Quay về **Sơ đồ** sẽ khôi phục chế độ xem, bộ lọc, lựa chọn và cây trước đó. Trên mobile, bấm **Tìm & lọc trạm** để mở bộ lọc hoặc **Mở hồ sơ đơn vị** để xem chi tiết.

Mã chính: `app/page.tsx` (điểm vào), `store/useOrgStore.ts` (store chung), `data/orgData.ts` (kiểu dữ liệu/mẫu), `components/3d/OrgScene.tsx` (hai chế độ cảnh), `components/ui/Sidebar.tsx`, `components/ui/JourneyControls.tsx`. Giao diện quản lý hiện tại được giữ trong `src/App.jsx` và các module liên quan.

Journey dùng khối PBR, HDR city tự phục vụ trong `public/environments`, DPR tối đa 1.5 và render theo nhu cầu; giảm chuyển động tắt bay camera/nhấc khối. Chế độ Journey là trải nghiệm tra cứu, thao tác sửa dữ liệu vẫn ở Sơ đồ. Kiểm tra: `npm run typecheck`, `npm test`, và khi server đang chạy `npm run test:journey`.
