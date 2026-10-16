# SRS — Đặc tả yêu cầu phần mềm SDTQ

| Thuộc tính | Giá trị |
| --- | --- |
| Phiên bản | 0.2 — dự thảo, 16/10/2026 (bản 0.1: 15/10/2026) |
| Căn cứ | [BRD 0.2](BRD.md) |
| Thiết kế liên quan | [Đặc tả 3D](THIET_KE_SO_DO_3D.md) |
| Quy ước | "Phải" là yêu cầu đề xuất để nghiệm thu, không có nghĩa đã triển khai. Mã SRC-*, B-*, R-*, Q-* tham chiếu BRD |

## 1. Tổng quan và thuật ngữ

Ứng dụng web chạy trên mạng nội bộ, quản lý cơ cấu tổ chức của bộ máy cấp quốc gia, có phiên bản và căn cứ pháp lý. Máy chủ là nơi xác thực quyền và trạng thái dữ liệu; trình duyệt cung cấp cây, bảng và sơ đồ 3D. Dữ liệu do client gửi lên không được coi là đã duyệt.

| Thuật ngữ | Nghĩa |
| --- | --- |
| Phạm vi (Dataset) | Bộ dữ liệu cùng phạm vi nghiệp vụ: P-NN, P-CP, P-DP, P-TP, P-HTCT (BRD 5.1) |
| Cơ quan (Organ) | Cơ quan, tổ chức có tư cách độc lập trong bộ máy: Quốc hội, bộ, Ủy ban nhân dân tỉnh… |
| Đơn vị thuộc (Internal unit) | Đơn vị trong cơ cấu của một cơ quan: vụ, cục, văn phòng, thanh tra, phòng… |
| Đơn vị hành chính (AdminUnit) | Lãnh thổ hành chính: tỉnh, thành phố trực thuộc trung ương; xã, phường, đặc khu. Khác với cơ quan chính quyền tổ chức ở đó |
| Chức danh (Position) | Vị trí lãnh đạo gắn với cơ quan (Thủ tướng, Bộ trưởng…), không gắn với cá nhân trong MVP |
| Nội dung (Content item) | Chức năng, nhiệm vụ, ý con của nhiệm vụ, quyền hạn |
| Quan hệ (Relation) | Liên kết có loại, hướng, căn cứ và thời gian giữa hai thực thể |
| Căn cứ (LegalBasis) | Văn bản kèm vị trí điều, khoản, điểm làm cơ sở cho một phát biểu |
| Nguồn tham khảo (Reference) | Báo chí, trang tổng hợp: dùng tra cứu, không đủ để duyệt |
| Bản sửa đổi (Revision) / Bản đã duyệt (Snapshot) | Tập thay đổi theo trạng thái / ảnh dữ liệu không đổi được sau khi duyệt |
| Hiệu lực | Khoảng thời gian một bản ghi áp dụng theo căn cứ; khác thời điểm lưu trong hệ thống |

## 2. Phân quyền

| Thao tác | Xem | Biên tập | Duyệt | Quản trị |
| --- | --- | --- | --- | --- |
| Xem bản đã duyệt trong phạm vi được cấp | Có | Có | Có | Theo quyền dữ liệu |
| Xem nháp | Không | Trong phạm vi | Trong phạm vi | Theo quyền dữ liệu |
| Tạo, sửa nháp; nhập dữ liệu | Không | Có | Chỉ khi có thêm quyền biên tập | Chỉ khi có thêm quyền biên tập |
| Gửi duyệt | Không | Có | Theo quyền biên tập | Theo quyền biên tập |
| Duyệt, trả lại | Không | Không | Có, trừ bản mình sửa | Chỉ khi được cấp quyền duyệt |
| Cấp quyền, cấu hình vận hành | Không | Không | Không | Có |
| Xuất dữ liệu | Cần quyền xuất riêng | Cần quyền xuất riêng | Cần quyền xuất riêng | Cần quyền xuất riêng |

Quyền gồm hành động và phạm vi. Máy chủ kiểm tra quyền trên mọi request và mọi tài nguyên con; ẩn nút trên giao diện không thay cho kiểm tra ở máy chủ. Phương thức xác thực (tài khoản nội bộ, SSO, chữ ký số) chờ quyết định Q-04.

## 3. Yêu cầu chức năng

| ID | Yêu cầu | Ưu tiên | Tiêu chí chấp nhận |
| --- | --- | --- | --- |
| FR-01 | Xác thực và cấp quyền theo phạm vi | Must | Người không có quyền không đọc được dữ liệu qua giao diện, API hoặc chức năng xuất |
| FR-02 | Chọn phạm vi và ngày xem | Must | Màn hình luôn hiển thị phạm vi và ngày xem; mặc định là ngày hiện tại, kèm mốc cập nhật gần nhất của dữ liệu; không trộn phạm vi |
| FR-03 | Nhập dữ liệu có cấu trúc (JSON, CSV theo mẫu) | Must | Kiểm tra schema; báo lỗi theo từng dòng; tạo bản nháp, không duyệt tự động; nhập lại cùng tệp (cùng checksum) không nhân đôi bản ghi |
| FR-04 | Quản lý cơ quan và đơn vị thuộc | Must | Tạo, sửa, ngừng hiệu lực; có loại, cấp, phạm vi; ID không đổi khi đổi tên; tên theo văn bản và bí danh lưu riêng |
| FR-05 | Quản lý đơn vị hành chính | Must | Hai cấp và đặc khu theo danh mục; mỗi Hội đồng nhân dân, Ủy ban nhân dân gắn với đúng một đơn vị hành chính |
| FR-06 | Quản lý chức năng, nhiệm vụ, ý con, quyền hạn | Must | Có chủ sở hữu, số hiệu, toàn văn, căn cứ; ý con phải có nhiệm vụ cha cùng chủ sở hữu; giữ thứ tự theo văn bản |
| FR-07 | Quản lý quan hệ có loại | Must | Chọn loại trong danh mục (mục 5.1), hướng, hai đầu, căn cứ, hiệu lực; từ chối loại không hợp lệ với cặp thực thể; chỉ cấm chu trình với "thuộc cơ cấu" |
| FR-08 | Quan hệ kế thừa | Must | Ghi hợp nhất, chia, đổi tên, giải thể kèm ngày hiệu lực; tìm theo tên cũ trả về cơ quan kế thừa kèm giải thích |
| FR-09 | Quản lý căn cứ và nguồn tham khảo | Must | Căn cứ ghi loại văn bản, số hiệu, cơ quan ban hành, ngày ban hành, ngày hiệu lực, vị trí điều khoản; nguồn tham khảo đánh dấu riêng và không thay được căn cứ khi duyệt |
| FR-10 | Kiểm tra trước khi gửi duyệt | Must | Chặn khi: thiếu căn cứ, ID trùng, tham chiếu hỏng, quan hệ chưa có loại, hiệu lực sai thứ tự, chu trình trong "thuộc cơ cấu"; chỉ rõ vị trí lỗi |
| FR-11 | Gửi duyệt, trả lại, duyệt | Must | Chỉ chuyển trạng thái hợp lệ; từ chối tự duyệt; trả lại bắt buộc có lý do |
| FR-12 | Lịch sử và so sánh | Must | Xem người sửa, thời điểm, giá trị trước và sau; bản đã duyệt không sửa được |
| FR-13 | Xem cơ cấu tại một ngày | Must | Chỉ hiện bản ghi có hiệu lực tại ngày chọn; bản ghi chưa rõ hiệu lực hiện riêng, có nhãn, không bị loại âm thầm |
| FR-14 | Tìm và lọc | Must | Tìm có và không dấu theo tên, bí danh, tên cũ, số hiệu nội dung; lọc theo phạm vi, loại cơ quan, cấp, loại quan hệ, trạng thái; kết quả giới hạn theo quyền |
| FR-15 | Sơ đồ 3D | Must | Mặc định hiển thị quan hệ "thuộc cơ cấu"; bật/tắt từng loại quan hệ khác; mỗi loại có kiểu nét và chú giải riêng; chọn khối đồng bộ với cây và hồ sơ |
| FR-16 | Hồ sơ cơ quan, đơn vị | Must | Hiện chức năng, nhiệm vụ (kèm ý con), quyền hạn, căn cứ của từng mục, quan hệ theo loại, lịch sử kế thừa |
| FR-17 | Cây và bảng thay thế 3D | Must | Hoàn tất xem, tìm, sửa, gửi duyệt mà không cần tương tác với canvas |
| FR-18 | Điều khiển góc nhìn | Must | Thu phóng, xoay có giới hạn, về toàn cảnh, định vị khối đang chọn; thao tác không làm thay đổi dữ liệu |
| FR-19 | Xuất JSON | Must | Xuất đúng phạm vi, ngày xem và bản đã duyệt, kèm căn cứ; ghi nhật ký; không xuất nháp nếu không có quyền |
| FR-20 | Chỉnh sửa đồng thời | Must | Hai người sửa cùng phiên bản: người lưu sau nhận thông báo xung đột; không mất nội dung âm thầm |
| FR-21 | Nhật ký quản trị và dữ liệu | Must | Ghi người, hành động, đối tượng, kết quả, thời gian; không lưu token hoặc mật khẩu |
| FR-22 | So sánh hai mốc thời gian | Should | Liệt kê cơ quan thêm, bỏ, hợp nhất, đổi tên giữa hai ngày, kèm căn cứ |
| FR-23 | Khôi phục nội dung bản cũ | Should | Tạo nháp mới từ bản đã duyệt cũ rồi duyệt lại; không ghi đè lịch sử |
| FR-24 | Lưu trạng thái xem | Should | Giữ phạm vi, ngày, chế độ và lựa chọn khi chuyển giữa 3D và bảng; không đưa nội dung nội bộ vào URL |

Must thuộc MVP; Should không cản nghiệm thu MVP nếu được ghi vào backlog.

## 4. Luồng và trạng thái

### UC-01 — Khởi tạo một phạm vi

Tiền điều kiện: biên tập viên có quyền trong phạm vi đích; danh mục loại đã được duyệt (M1). Biên tập viên tải tệp dữ liệu theo mẫu; hệ thống kiểm tra schema, hiển thị số lượng theo loại và danh sách lỗi; người dùng xác nhận tạo bản nháp. Với P-CP tại mốc 19/02/2025, báo cáo đối soát phải cho 14 bộ, 3 cơ quan ngang bộ và 25 chức danh (B-01). Mục thiếu căn cứ được nhập vào nháp nhưng bị chặn khi gửi duyệt.

### UC-02 — Cập nhật theo văn bản mới

Ví dụ: một nghị quyết hợp nhất hai bộ. Biên tập viên tạo nháp; ngừng hiệu lực hai bộ cũ từ ngày hiệu lực của văn bản; tạo bộ mới; ghi quan hệ kế thừa từ hai bộ cũ sang bộ mới; chuyển các đơn vị thuộc theo căn cứ; gắn căn cứ cho từng thay đổi; gửi duyệt. Người duyệt xem khác biệt và văn bản, rồi duyệt hoặc trả lại. Duyệt tạo bản đã duyệt và ghi nhật ký trong cùng một giao dịch.

| Trạng thái hiện tại | Hành động | Trạng thái tiếp theo | Điều kiện |
| --- | --- | --- | --- |
| Draft | Submit | InReview | Qua kiểm tra FR-10; có quyền |
| InReview | Approve | Approved | Người duyệt khác người sửa; bản sửa đổi chưa thay đổi |
| InReview | Return | Returned | Có lý do |
| Returned | Revise | Draft | Tạo phiên bản sửa mới, giữ nhật ký |
| Approved | Edit, Restore | Draft mới | Bản đã duyệt cũ không đổi |

Không có chuyển trực tiếp từ Draft sang Approved. Ngừng hiệu lực là một thay đổi nội dung đi qua quy trình trên, không phải xóa.

### UC-03 — Tra cứu và xem 3D

Chọn phạm vi và ngày xem, tìm cơ quan, chọn kết quả. Camera định vị khối, hồ sơ mở ra. Người dùng chọn tab Nhiệm vụ hoặc Quyền hạn để đọc nội dung và căn cứ, và bật thêm loại quan hệ khi cần (ví dụ "chịu trách nhiệm và báo cáo"). Chuyển sang bảng vẫn giữ cơ quan, bộ lọc và ngày xem. Nếu không có nội dung, hiển thị "Chưa có dữ liệu trong nguồn đã duyệt" (R-14).

### UC-04 — Xung đột và lỗi

- Lưu với version đã cũ: trả 409, giữ bản đang nhập và mở so sánh với bản trên máy chủ; không tự ghi đè.
- Mất phiên: trả 401 và cho đăng nhập lại; không báo lưu thành công.
- Hết quyền: trả 403 và dừng thao tác.
- Lỗi mạng: giữ biểu mẫu trong bộ nhớ phiên và cảnh báo trước khi rời trang.
- Không lưu nháp vào localStorage mặc định.

## 5. Mô hình dữ liệu logic

Thời gian kỹ thuật lưu UTC, giao diện hiển thị theo Asia/Saigon. Ngày ban hành và ngày hiệu lực lưu dạng ngày, không tự thêm giờ.

| Thực thể | Trường chính | Ràng buộc |
| --- | --- | --- |
| Dataset | id, code (P-NN…), name, description, accessPolicy, classification | Phân loại dữ liệu theo Q-04 |
| AdminUnit | id, name, level (province, commune, specialZone), validFrom, validTo, legalBasisIds | Cấp huyện chỉ tồn tại với validTo ≤ 2025-07-01 (căn cứ SRC-NQ203) |
| Organ | id, datasetId, officialName, aliases, organType, branch, adminUnitId, validFrom, validTo, temporalNote | ID ổn định; officialName theo văn bản; adminUnitId bắt buộc với cơ quan của chính quyền địa phương |
| InternalUnit | id, organId, parentUnitId, name, unitType, validFrom, validTo | Cây trong một cơ quan, không có chu trình |
| Position | id, organId, title, validFrom, validTo | MVP không có trường cá nhân (R-12) |
| ContentItem | id, ownerId, kind (function, duty, subDuty, authority), parentItemId, number, order, fullText, validFrom, validTo | subDuty cùng owner với nhiệm vụ cha; order giữ thứ tự theo văn bản; số hiệu không dùng làm khóa |
| Relation | id, kind, fromId, toId, validFrom, validTo, verificationStatus | kind thuộc danh mục 5.1; ràng buộc loại đầu cạnh theo kind |
| Succession | id, kind (merge, split, rename, dissolve, establish), predecessorIds, successorIds, effectiveDate | Có ít nhất một căn cứ |
| LegalBasis | id, docType, docNumber, issuer, issuedAt, effectiveAt, title, locator, url | locator ghi điều, khoản, điểm |
| Reference | id, title, publisher, publishedAt, accessedAt, url, note | Không thay LegalBasis khi duyệt |
| Evidence | id, targetType, targetId, legalBasisId or referenceId, claim, reviewNote | Gắn căn cứ tới từng trường hoặc quan hệ |
| Revision, Snapshot, ChangeLog | Như bản 0.1 | Snapshot không đổi được; ChangeLog chỉ ghi thêm |

Mọi Organ, InternalUnit, ContentItem, Relation đều được phiên bản hóa theo bản sửa đổi và bản đã duyệt. Khoảng hiệu lực là nửa mở [validFrom, validTo). Khi chưa rõ hiệu lực thì để null và bắt buộc có temporalNote.

### 5.1. Danh mục loại quan hệ

| kind | Ý nghĩa | Ví dụ cần căn cứ trước khi nhập | Tạo cây | Hiển thị mặc định |
| --- | --- | --- | --- | --- |
| partOf | Thuộc cơ cấu (đơn vị thuộc cơ quan; bộ thuộc cơ cấu Chính phủ) | Vụ thuộc bộ; bộ, cơ quan ngang bộ trong cơ cấu Chính phủ (SRC-CP) | Có | Có |
| electedOrApprovedBy | Được bầu, phê chuẩn hoặc thành lập bởi | Chức danh nhà nước do Quốc hội bầu theo Hiến pháp | Không | Tắt |
| accountableTo | Chịu trách nhiệm và báo cáo trước | Theo Hiến pháp và luật tổ chức | Không | Tắt |
| directs | Lãnh đạo, chỉ đạo hành chính | Chính phủ đối với Ủy ban nhân dân cấp tỉnh (trên sơ đồ SRC-NN có đường nối, cần căn cứ ghi loại) | Không | Tắt |
| guides | Hướng dẫn chuyên môn, nghiệp vụ theo ngành | Bộ đối với sở (trên SRC-NN có đường nối, cần căn cứ) | Không | Tắt |
| supervises | Giám sát | Theo Hiến pháp và luật | Không | Tắt |
| systemTier | Cấp trên trong cùng hệ thống | Tòa án, viện kiểm sát, chính quyền địa phương cấp tỉnh với cấp dưới | Không | Tắt |
| ledBy | Do tổ chức khác lãnh đạo, ngoài bộ máy nhà nước | Mặt trận Tổ quốc do Đảng lãnh đạo (SRC-NQ203, Điều 9) | Không | Tắt |

Cột "Ví dụ" chỉ minh họa ý nghĩa của từng loại, không phải dữ liệu đã kiểm chứng. Danh mục cần chủ sở hữu nghiệp vụ duyệt ở M1. Một cặp cơ quan có thể có nhiều quan hệ khác loại cùng lúc. Không suy ra kind từ đường vẽ trên sơ đồ tham khảo (R-04).

### 5.2. Danh mục loại cơ quan và nhánh (đề xuất, cần duyệt ở M1)

| branch | organType ví dụ |
| --- | --- |
| legislative | Quốc hội, Ủy ban Thường vụ Quốc hội, các cơ quan của Quốc hội |
| headOfState | Chủ tịch nước |
| executive | Chính phủ, bộ, cơ quan ngang bộ, cơ quan thuộc Chính phủ |
| judicial | Tòa án nhân dân các cấp |
| procuracy | Viện kiểm sát nhân dân các cấp |
| constitutionalIndependent | Hội đồng bầu cử quốc gia, Kiểm toán nhà nước |
| localGovernment | Hội đồng nhân dân, Ủy ban nhân dân, sở và cơ quan chuyên môn |
| politicalSystem | Cơ quan của Đảng ở trung ương, Mặt trận Tổ quốc, tổ chức chính trị – xã hội (phạm vi P-HTCT, R-02) |

Tên các cấp tòa án và viện kiểm sát dưới cấp tỉnh chưa được chốt (BRD 2.1).

### 5.3. Khoảng cách với bản mẫu giao diện hiện có

Bản mẫu giao diện hiện tại chỉ dùng để thử nghiệm trải nghiệm. Nó **chưa** đáp ứng SRS ở các điểm sau, và không được dùng làm cơ sở nghiệm thu:

- Không có máy chủ, phân quyền hay quy trình duyệt.
- Mỗi đơn vị chỉ có một quan hệ cha; chưa có loại quan hệ (5.1), quan hệ kế thừa và căn cứ.
- Chưa có chiều thời gian.

## 6. Hợp đồng API đề xuất

| Endpoint | Chức năng | Điều kiện |
| --- | --- | --- |
| GET /api/datasets | Danh sách phạm vi được phép | Không lộ phạm vi ngoài quyền |
| GET /api/datasets/{id}/graph?asOf=YYYY-MM-DD&kinds= | Cơ quan, đơn vị, quan hệ có hiệu lực tại ngày, lọc theo loại quan hệ | asOf bắt buộc; kinds mặc định là partOf |
| GET /api/datasets/{id}/search?q=&asOf= | Tìm theo tên, bí danh, tên cũ, số hiệu | Phân trang; giới hạn độ dài truy vấn |
| GET /api/organs/{id}/succession | Chuỗi kế thừa | Có quyền xem phạm vi |
| GET /api/datasets/{id}/diff?from=&to= | So sánh hai mốc (FR-22) | Should |
| POST /api/datasets/{id}/revisions | Tạo nháp | Có quyền biên tập; baseSnapshotId |
| PATCH /api/revisions/{id}/{resource}/{rid} | Sửa organ, unit, content, relation, succession, evidence | If-Match theo version; chỉ ở trạng thái Draft |
| POST /api/revisions/{id}/validate | Báo lỗi FR-10 | Không tự sửa dữ liệu |
| POST /api/revisions/{id}/submit · /decision | Gửi duyệt; duyệt hoặc trả lại | Theo bảng trạng thái; Return bắt buộc reason |
| POST /api/datasets/{id}/imports · GET /api/imports/{id} | Nhập theo job; trạng thái và lỗi | Giới hạn kích thước; kiểm tra MIME và nội dung |
| GET /api/datasets/{id}/export?asOf= | Xuất JSON | Có quyền xuất; ghi nhật ký |

Thao tác ghi có idempotency key. Định dạng lỗi chuẩn: `{code, message, fieldErrors, correlationId}`; mã 400/422 cho dữ liệu sai, 401, 403, 404, 409. Không trả stack trace cho người dùng.

## 7. Yêu cầu phi chức năng và cách đo

| ID | Yêu cầu đề xuất | Kiểm chứng |
| --- | --- | --- |
| NFR-01 | Dữ liệu đã duyệt và mọi thay đổi đều truy vết được | Kiểm tra giao dịch duyệt, nhật ký và lịch sử không đổi được |
| NFR-02 | Không chèn HTML từ fullText | Payload XSS hiển thị như văn bản thường |
| NFR-03 | Mọi truy cập và xuất đều kiểm tra quyền ở máy chủ | Kiểm thử IDOR, truy cập chéo phạm vi, leo thang quyền |
| NFR-04 | Đáp ứng yêu cầu an toàn thông tin theo cấp độ được xác định (Q-04) | Hồ sơ đề xuất cấp độ và kết quả đánh giá do đơn vị có thẩm quyền xác nhận trước khi đưa vào vận hành |
| NFR-05 | Triển khai nội bộ, không gửi dữ liệu ra dịch vụ bên ngoài | Kiểm tra request mạng của bản build: không có CDN, font, analytics hay tài nguyên 3D từ bên ngoài |
| NFR-06 | Giao diện chính dùng được ở 360px và 1440px | Không cuộn ngang biểu mẫu; panel không che hành động |
| NFR-07 | Thao tác bằng bàn phím và hỗ trợ giảm chuyển động | Hoàn tất UC-02 và UC-03 bằng cây, bảng; focus luôn nhìn thấy |
| NFR-08 | Quy mô dữ liệu: tối thiểu 10.000 cơ quan và đơn vị mỗi phạm vi (ước lượng theo khoảng 3.321 đơn vị cấp xã, chưa đối chiếu) | Tải dữ liệu thử nghiệm sinh tự động 10.000 bản ghi: tìm kiếm p95 ≤ 300 ms; bảng cuộn mượt nhờ ảo hóa |
| NFR-09 | 3D ≥ 60 fps khi điều hướng, với tối đa 300 khối hiển thị | Đo 30 giây trên máy tham chiếu có GPU tích hợp, ghi rõ CPU, GPU, trình duyệt, độ phân giải. Bản mẫu đã đo ngày 16/10/2026 với 19 khối trên GPU Intel tích hợp; chưa đo với 300 khối |
| NFR-10 | Màn hình thao tác được trong ≤ 3 giây | Mạng mô phỏng 10 Mbps / 50 ms, cache lạnh; tải 3D không chặn cây và bảng |
| NFR-11 | Lỗi WebGL không làm mất dữ liệu đang nhập | Mô phỏng mất context, chuyển sang cây, bảng và lưu tiếp được |
| NFR-12 | Sao lưu và khôi phục dữ liệu, căn cứ, nhật ký | Diễn tập phục hồi trên staging; RPO, RTO do bên vận hành xác nhận |
| NFR-13 | UTF-8 toàn tuyến; giữ đúng dấu tiếng Việt và cách viết hoa tên cơ quan | So sánh văn bản trước và sau khi nhập, xuất; tìm không dấu không sửa văn bản gốc |

Các mức hiệu năng là mục tiêu nghiệm thu, trừ kết quả đo đã ghi rõ. Chuẩn tiếp cận mục tiêu là WCAG 2.2 AA cho phần DOM; cần đánh giá thực tế trước khi tuyên bố phù hợp.

## 8. Ma trận truy vết và kiểm thử chấp nhận

| Test | BRD | SRS | Kịch bản và kết quả mong đợi |
| --- | --- | --- | --- |
| AT-01 | B-01 | FR-03 | Nhập P-CP mốc 19/02/2025: báo cáo đúng 14 bộ, 3 cơ quan ngang bộ, 25 chức danh; mục thiếu căn cứ bị chặn khi gửi duyệt |
| AT-02 | B-02 | FR-09, FR-10 | Gửi duyệt một bộ chỉ có nguồn tham khảo là bài báo: bị chặn, thông báo yêu cầu văn bản căn cứ |
| AT-03 | B-04 | FR-07, FR-15 | Bật "bầu, phê chuẩn" và "lãnh đạo, chỉ đạo": hai loại có kiểu nét và chú giải khác nhau; tắt đi thì cây "thuộc cơ cấu" không đổi |
| AT-04 | B-04 | FR-07 | Tạo quan hệ "thuộc cơ cấu" từ Mặt trận Tổ quốc vào Chính phủ: bị từ chối theo R-02 |
| AT-05 | B-05 | FR-05, FR-13 | Xem P-DP ngày 30/6/2025 và 01/7/2025: cấp huyện chỉ có ở ngày đầu; bản ghi cấp huyện không bị xóa |
| AT-06 | B-02 | FR-08, FR-14 | Ghi quan hệ hợp nhất có căn cứ; tìm theo tên bộ cũ trả về bộ kế thừa kèm ngày hiệu lực |
| AT-07 | B-03 | FR-11 | Người sửa gọi API duyệt bản của chính mình: bị từ chối, không tạo bản đã duyệt |
| AT-08 | B-03 | FR-12, FR-20 | Hai lần PATCH cùng version: lần sau nhận 409, dữ liệu lần đầu không mất |
| AT-09 | B-06 | FR-14, FR-16 | Tìm "bo nong nghiep": ra "Bộ Nông nghiệp và Môi trường"; mở nhiệm vụ, nội dung giữ nguyên dấu |
| AT-10 | B-07 | FR-17 | Tắt WebGL: tra cứu, sửa và gửi duyệt qua bảng vẫn hoàn tất |
| AT-11 | — | NFR-05 | Chạy bản build trên mạng không có internet: mọi chức năng hoạt động; không có request ra ngoài |
| AT-12 | — | R-12 | Nhập tệp có trường ngày sinh, quê quán: các trường bị từ chối hoặc loại bỏ kèm cảnh báo |
| AT-13 | B-03 | FR-19, FR-21 | Người có quyền xem nhưng không có quyền xuất bị chặn cả ở API xuất; nhật ký ghi kết quả |
| AT-14 | — | NFR-02, NFR-03 | Nội dung có script và ID phạm vi ngoài quyền: không chạy mã, không rò dữ liệu |

## 9. Điều kiện bàn giao

Bàn giao gồm:

- Schema và migration.
- Danh mục loại đã được duyệt (5.1, 5.2).
- Hợp đồng API.
- Bộ kiểm thử và kết quả UAT.
- Hồ sơ an toàn thông tin theo Q-04.
- Hướng dẫn theo vai trò.
- Hướng dẫn sao lưu và khôi phục.
- Danh sách quyết định còn mở.

Chỉ tuyên bố hoàn thành khi các yêu cầu Must đạt, hoặc có ngoại lệ được chủ sở hữu nghiệp vụ ghi nhận.
