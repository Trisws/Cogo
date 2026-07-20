# CoGo — Bộ ứng dụng công nghệ khi đưa ra thị trường + Chuẩn bị phản biện BGK

> Tổng hợp từ `MÔ TẢ Ý TƯỞNG COGO_V1 INNOSTAR 2026.pdf` (mục 3.3, 7, 9) và hiện trạng codebase trong repo, biên soạn lại thành bộ công nghệ production-ready + kịch bản hỏi-đáp giả định với BGK.

## PHẦN 1 — Bộ công nghệ dùng khi đưa ra thị trường thật

Chia theo lớp kiến trúc, mỗi mục ghi rõ **công nghệ cụ thể** + **vai trò** + **vì sao cần** (để trả lời được câu "tại sao lại chọn cái này").

### 1.1. Lớp định vị & ghép chuyến không gian (lõi khác biệt của CoGo)

| Công nghệ | Vai trò | Vì sao cần |
|---|---|---|
| GPS + Geocoding (Google Maps/Mapbox Geocoding API, hoặc Nominatim ở giai đoạn đầu) | Chuyển địa chỉ nhập tay → tọa độ | Không thể tính lộ trình nếu không có tọa độ chuẩn |
| Thuật toán định tuyến A\*/Dijkstra (qua OSRM hoặc Google Directions API) | Vẽ tuyến đường thực tế theo đường sá, không phải đường chim bay | Đường chim bay sai lệch lớn ở đô thị có sông, cầu, một chiều |
| **Fréchet Distance** | Đo độ tương đồng hình học giữa 2 quỹ đạo (không chỉ so 2 điểm đầu-cuối) | Đây là thước đo chuẩn trong khoa học dữ liệu không gian để so trajectory, nhạy với thứ tự điểm dọc tuyến — khác hẳn cách đo khoảng cách Euclid đơn thuần |
| **Spatial Longest Common Subsequence (LCS)** | Tìm đoạn lộ trình trùng nhau dài nhất giữa 2 người | Cho phép ghép người chỉ trùng **một phần** tuyến (VD: đi ngang qua một đoạn), điều mà app so khớp điểm A-B đơn giản không làm được |
| Interval Overlap Detection | Khớp khung giờ khởi hành thực tế | Ghép đúng lộ trình mà lệch giờ 2 tiếng vẫn vô nghĩa |
| **R-Tree / PostGIS (GiST index)** | Lập chỉ mục không gian để truy vấn nhanh "các chuyến gần nhau" | Khi có hàng chục nghìn chuyến, duyệt tuần tự (linear scan) như bản demo hiện tại sẽ không kịp phản hồi |

*(Bản demo hiện tại dùng Turf.js buffer-intersection chạy client-side — là bản xấp xỉ MVP cho đúng 4 công nghệ trên, cần nâng cấp khi ra thị trường thật.)*

### 1.2. Lớp định danh & niềm tin

- **eKYC** (OCR trích xuất CCCD + liveness detection/nhận diện khuôn mặt) qua đối tác cấp phép (VNPT eKYC, FPT.AI, VNG...).
- **Xác thực đa lớp theo cộng đồng**: SĐT → email trường/công ty → CCCD → GPLX (đúng thứ tự tăng dần độ tin cậy, đã thể hiện trong `User.verified` ở `lib/types.ts`).
- **Trust Score** — điểm tổng hợp từ lịch sử đánh giá, tỷ lệ hủy chuyến, thời gian tham gia.

### 1.3. Trí tuệ nhân tạo & học máy (triển khai theo giai đoạn, không phải ngay từ đầu)

- **Predictive Matching**: mô hình dự báo nhu cầu theo khu vực/khung giờ (time-series forecasting) để ghép chuyến sớm hơn.
- **Automated Trust/Anomaly Detection**: phát hiện hành vi bất thường (huỷ chuyến liên tục, đánh giá gian lận) để tự động cảnh báo/khoá tài khoản, giảm chi phí vận hành nhân sự.
- Nguyên tắc triển khai: **rule-based trước, ML sau khi đủ dữ liệu thật** — tránh "AI-washing" khi chưa có data.

### 1.4. Lớp thanh toán

- Ví điện tử/cổng thanh toán nội địa (VNPay, MoMo, ZaloPay) qua đối tác trung gian thanh toán được cấp phép.
- Cơ chế **Escrow** (tạm giữ – khấu trừ – giải ngân) — tiền được giữ ở nền tảng cho đến khi chuyến hoàn tất, giảm tranh chấp.
- Xử lý **idempotency** (chống double-charge khi request lặp/lỗi mạng) — bắt buộc với hệ thống tiền thật, khác hẳn logic cộng trừ số dư đơn giản trong bản demo.

### 1.5. Hạ tầng & vận hành

- **Cloud scalable** (Google Cloud/AWS) — auto-scale theo giờ cao điểm (7-9h, 17-19h), giảm tải giờ thấp điểm để tối ưu chi phí.
- **PostgreSQL + PostGIS** làm database chính (thay localStorage của bản demo).
- **WebSocket/polling** cho vị trí tài xế theo thời gian thực trong lúc tracking.
- **Bảo mật**: mã hoá dữ liệu khi truyền tải (TLS), phân quyền nội bộ, nguyên tắc thu thập dữ liệu tối thiểu, tuân thủ **Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân**.

### 1.6. Lớp phân tích dữ liệu & báo cáo ESG

- Engine tính CO₂ cắt giảm dựa trên quãng đường trùng thực tế × hệ số phát thải trung bình.
- Dashboard cho CoGo Enterprise, xuất báo cáo phục vụ **Quyết định 13/2024/QĐ-TTg** (kiểm kê khí nhà kính).

---

## PHẦN 2 — Giả định câu hỏi BGK và gợi ý trả lời

### Nhóm A — Về công nghệ ghép chuyến (nhiều khả năng bị hỏi sâu nhất)

**Q1. "Tại sao không đơn giản là so khớp điểm đón - điểm trả như Grab/BlaBlaCar mà phải dùng Fréchet Distance, Spatial LCS phức tạp vậy?"**
→ Vì mục tiêu của CoGo khác: Grab tạo chuyến mới, BlaBlaCar chỉ ghép khi trùng gần như toàn bộ điểm đầu-cuối (chủ yếu liên tỉnh). CoGo cần ghép được **những người chỉ đi trùng một đoạn** trong hành trình nội đô (VD: sinh viên ở giữa tuyến của một tài xế) — nếu chỉ so điểm A-B sẽ bỏ sót phần lớn cơ hội ghép. Đây chính là lý do nghiên cứu **Morfeldt et al. (2024)** cảnh báo: lợi ích môi trường của carpooling *không tự nhiên xuất hiện*, mà phụ thuộc vào tỷ lệ lấp đầy — nền tảng thiếu thuật toán ghép thông minh có thể không tạo ra lợi ích thật.

**Q2. "Thuật toán này có tốn tài nguyên tính toán không khi số lượng người dùng lớn?"**
→ Có, nếu tính Fréchet Distance cho từng cặp trip (O(n²)). Giải pháp: dùng **R-Tree/PostGIS** để lọc trước tập ứng viên gần nhau về không gian-thời gian (giảm còn vài chục candidate), rồi mới chạy Fréchet/LCS chi tiết trên tập nhỏ đó — đây là kỹ thuật chuẩn "coarse filter → fine match" trong hệ thống tìm kiếm không gian quy mô lớn.

**Q3. "Bản demo hôm nay có dùng đúng Fréchet Distance không?"**
→ Trung thực trả lời: bản demo dùng **buffer-intersection qua Turf.js** — một xấp xỉ đơn giản hơn (bao vùng đệm quanh tuyến rồi đo phần chồng lấp), đủ để minh hoạ ý tưởng và tốc độ phát triển trong thời gian ngắn. Fréchet Distance + Spatial LCS là hướng nâng cấp ở giai đoạn kỹ thuật tiếp theo — **đây là điểm cần chủ động nói trước**, tránh bị hỏi xoáy vào và bị coi là nói không đúng thực tế.

**Q4. "Hiệu ứng dội ngược (rebound effect) là gì, CoGo giải quyết thế nào?"**
→ Theo **Coulombel et al. (2019)**, lợi ích môi trường của đi chung xe có thể bị bào mòn 68-77% nếu người vốn đi xe buýt/xe đạp chuyển sang carpooling (thay vì người vốn tự lái xe riêng). CoGo giảm thiểu bằng cách **ưu tiên ghép đúng nhóm mục tiêu "996"** (người vốn đã dùng phương tiện cá nhân/gọi xe công nghệ hàng ngày) qua thuật toán lộ trình chính xác, và đo lường thực tế qua Trust Score + lịch sử hành vi thay vì chỉ tự nhận.

### Nhóm B — Về AI/ML (dễ bị hỏi "có phải chỉ là buzzword")

**Q5. "CoGo nói có AI nhưng thực tế MVP có AI thật không?"**
→ Trả lời thẳng: **giai đoạn MVP dùng rule-based matching, chưa có ML** — vì ML cần dữ liệu thật để huấn luyện, chưa có ở giai đoạn demo/pilot. AI/ML (Predictive Matching, Trust Score tự động) là **lộ trình giai đoạn 4-5** (sau khi có ≥6 tháng dữ liệu thật) như đã ghi rõ trong roadmap. Đây là câu trả lời an toàn và trung thực — nói "có AI" ngay từ đầu mà không giải thích được sẽ bị đánh giá thấp hơn nhiều so với thừa nhận rõ ràng giai đoạn nào có gì.

### Nhóm C — An toàn & pháp lý (luôn bị hỏi với mô hình đi chung xe với người lạ)

**Q6. "Làm sao đảm bảo an toàn khi đi chung với người lạ, nhất là với phụ nữ/trẻ vị thành niên?"**
→ 3 lớp: (1) eKYC bắt buộc trước khi dùng — không có tài khoản ẩn danh; (2) lọc theo giới tính ưu tiên + rating hai chiều nghiêm ngặt (tài khoản điểm thấp tự động bị hạn chế — cơ chế "tự quản lý cộng đồng" giảm phụ thuộc đội CSKH); (3) tracking hành trình thời gian thực + nút SOS gửi vị trí tới liên hệ khẩn cấp. Về học thuật, **Dastani et al. (2024)** chứng minh mô hình ghép có tích hợp sở thích người dùng (giới tính, rating) làm tăng tỷ lệ chấp nhận ghép — CoGo áp dụng đúng hướng này.

**Q7. "CoGo có cần giấy phép kinh doanh vận tải như Grab không?"**
→ Về bản chất, CoGo định vị là nền tảng công nghệ kết nối (không sở hữu đội xe, không thu phí như một hãng vận tải mà thu phí dịch vụ nền tảng) — mô hình gần với chia sẻ chi phí giữa cá nhân hơn là kinh doanh vận tải. Tuy vậy cần làm việc với cơ quan quản lý để xác định rõ khung pháp lý áp dụng trước khi mở rộng ngoài phạm vi pilot nội bộ (trường/doanh nghiệp) — đây là rủi ro cần chủ động nêu, không né tránh.

### Nhóm D — Dữ liệu & quyền riêng tư

**Q8. "Dữ liệu vị trí, hành trình của người dùng được bảo vệ thế nào?"**
→ Mã hoá khi truyền tải (TLS), lưu trữ theo nguyên tắc tối thiểu cần thiết, phân quyền truy cập nội bộ, tuân thủ **Nghị định 13/2023/NĐ-CP**. Riêng dữ liệu bán cho doanh nghiệp (báo cáo ESG) chỉ ở dạng **tổng hợp/ẩn danh** (aggregate), không lộ hành trình cá nhân từng nhân viên.

### Nhóm E — Cạnh tranh & tính khả thi kỹ thuật

**Q9. "Grab hoàn toàn có thể copy tính năng này, vậy lợi thế công nghệ của CoGo là gì?"**
→ Về lý thuyết Grab có nguồn lực để làm, nhưng **mâu thuẫn với mô hình kinh doanh cốt lõi của họ**: Grab kiếm tiền từ việc *tạo thêm chuyến đi* (tài xế chuyên nghiệp, GMV theo cuốc xe mới), trong khi CoGo *tối ưu chuyến đã có sẵn* — nếu Grab làm carpooling nội đô thật sự hiệu quả, họ sẽ tự cannibalize doanh thu core của chính mình. Đây là lợi thế "innovator's dilemma" kinh điển, không phải lợi thế công nghệ thuần tuý — nên trả lời trung thực rằng rào cản kỹ thuật để copy là thấp, rào cản thực sự nằm ở xung đột mô hình kinh doanh và việc xây cộng đồng closed-network (theo trường/công ty) mà Grab không có động lực làm.

**Q10. "Chi phí và thời gian để làm đúng những công nghệ này (PostGIS, eKYC, payment) là bao nhiêu?"**
→ Nên trả lời có khung tham chiếu cụ thể thay vì né: hạ tầng Cloud+DB ở quy mô pilot vài trăm người dùng gần như miễn phí (free-tier Supabase/Neon/GCP), chi phí phát sinh chính là **theo giao dịch** (SMS OTP ~vài trăm đồng/lượt, eKYC ~5.000-15.000đ/lượt xác thực tuỳ đối tác, phí cổng thanh toán ~1-2%/giao dịch) — nghĩa là mô hình chi phí biến đổi theo lượng dùng thật, không cần vốn lớn trả trước cho hạ tầng.

### Nhóm F — Năng lực đội ngũ

**Q11. "Đội ngũ hiện tại có đủ năng lực kỹ thuật triển khai không?"**
→ Trả lời dựa trên phân công thực tế đã có trong hồ sơ (Main-Developer phụ trách hệ thống phần mềm, Co-Developer phụ trách vận hành/digital marketing) — cộng với việc bản thân bản demo hiện tại (đã có đủ UI, domain model, matching xấp xỉ) là bằng chứng năng lực triển khai thực tế, không chỉ là ý tưởng trên giấy.

---

## Gợi ý sử dụng khi trả lời BGK

- **Luôn phân biệt rõ 3 mốc**: "đã làm trong demo" / "sẽ làm ở MVP thật (gần)" / "định hướng dài hạn (AI, mở rộng)". Đây là cách trả lời an toàn nhất — tránh bị bắt lỗi vì nói "đã có" cái chưa có.
- Khi bị hỏi xoáy về độ phức tạp thuật toán, có thể chốt bằng một câu: *"Chúng tôi ưu tiên rule-based + xấp xỉ hình học đơn giản (buffer-intersection) ở giai đoạn hiện tại để đi nhanh, và có lộ trình rõ ràng nâng cấp lên Fréchet Distance/Spatial LCS khi có đủ dữ liệu thật để đánh giá hiệu năng — đây là cách tiếp cận MVP chuẩn, không phải thiếu năng lực kỹ thuật."*
