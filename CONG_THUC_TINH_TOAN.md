# CoGo — Công thức tính toán & ý nghĩa số liệu

> Tổng hợp toàn bộ công thức/hằng số đang dùng thật trong code (không phải mô tả lý thuyết trong PDF), kèm ý nghĩa, vị trí trong code, và mức độ tin cậy của từng số. Dùng để trả lời khi bị hỏi "con số này tính từ đâu ra".

## Cách đọc bảng "Mức độ tin cậy"

| Ký hiệu | Ý nghĩa |
|---|---|
| 🟢 Tính thật | Ra từ dữ liệu thật trong hệ thống (chuyến đã hoàn tất, user thật...), có công thức rõ ràng |
| 🟡 Giả định có căn cứ | Hằng số tự đặt nhưng hợp lý, có thể giải thích logic khi bị hỏi |
| 🟠 Minh hoạ | Không phải lịch sử thật, chỉ dựng hình để biểu đồ đẹp — cần nói rõ nếu bị hỏi sâu |

---

## 1. Định tuyến & khoảng cách — `lib/geo/index.ts`

| Hàm | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| `haversineKm(a, b)` | Khoảng cách great-circle giữa 2 toạ độ (qua Turf.js) | Khoảng cách chim bay giữa 2 điểm | 🟢 |
| `routeLengthKm(waypoints)` | Tổng độ dài các đoạn polyline | Độ dài thật của 1 tuyến đường đã có toạ độ | 🟢 |
| `routeOverlapPercent(routeA, routeB, corridorMeters)` | Bao vùng đệm (buffer) quanh mỗi tuyến theo `corridorMeters`, giao 2 vùng đệm, đo % độ dài tuyến B nằm trong vùng giao so với tuyến ngắn hơn | Độ "trùng lộ trình" giữa 2 chuyến — xấp xỉ MVP cho Fréchet Distance/Spatial LCS (PDF mục 3.3) | 🟢 (thuật toán chạy thật) / lưu ý: là **xấp xỉ**, không phải Fréchet Distance thật |
| `fetchRoute(origin, destination)` | Gọi OSRM demo server, geometry GeoJSON; nếu lỗi → fallback `straightLineRoute` (nội suy tuyến tính 6 đoạn) | Vẽ tuyến đường thật theo đường sá | 🟢 khi OSRM phản hồi được / 🟡 khi fallback đường thẳng |
| `geocodeAddress` / `reverseGeocode` | Gọi Nominatim (OpenStreetMap) search/reverse | Đổi địa chỉ ↔ toạ độ | 🟢 (phụ thuộc độ phủ dữ liệu OSM tại VN) |
| `estimateEtaMinutes(distanceKm, avgSpeedKmh=26)` | `distanceKm / 26 × 60`, làm tròn, tối thiểu 1 phút | ETA còn lại lúc theo dõi hành trình | 🟡 tốc độ trung bình 26km/h là giả định cho nội đô TP.HCM giờ cao điểm, không đo thật theo traffic |

---

## 2. Ghép chuyến (Matching engine) — `app/(app)/trips/[id]/match/page.tsx`

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| Độ rộng hành lang so khớp | `corridorMeters = 300 + avgDetour × 1400` với `avgDetour = (detourTolerance_A + detourTolerance_B) / 2` | Mức chấp nhận đi vòng (slider 0–50% khi tạo chuyến) → co giãn corridor 300m (khắt khe) đến 1000m (lỏng) | 🟢 — mới nối thật, trước đây slider không có tác dụng gì |
| Ngưỡng khớp tối thiểu | `overlapPercent >= 0.2` (20%, cố định) | Loại các chuyến trùng quá ít, không tuỳ biến theo user | 🟡 hằng số tự đặt, có thể giải thích "ngưỡng chất lượng tối thiểu để đảm bảo trải nghiệm ghép chuyến" |
| Cửa sổ thời gian | `|giờ khởi hành A − giờ khởi hành B| < 60 phút` | Chỉ ghép các chuyến khởi hành gần giờ nhau | 🟡 hằng số tự đặt |
| Lọc loại xe | So khớp `vehicleTypePreference` (offer) với `vehicleType` (request) nếu có yêu cầu cụ thể | Không ghép ô tô với người chỉ muốn xe máy (hoặc ngược lại) | 🟢 |

---

## 3. Giá cước — `app/(app)/trips/new/page.tsx`, `lib/seed/data.ts`

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| Khoảng cách ước tính khi mới nhập điểm | `haversineKm(origin, destination) × 1.25` | Hệ số 1.25 bù cho việc đường thật luôn dài hơn đường chim bay ở đô thị (chưa có route OSRM tại thời điểm hiển thị) | 🟡 hệ số kinh nghiệm, không đo thực nghiệm |
| Giá đề xuất mỗi ghế | `round(distanceKm × 3000 / 1000) × 1000` | Đơn giá ~3.000đ/km, làm tròn đến nghìn đồng | 🟡 mức giá tự đặt tham khảo giá xăng/gọi xe công nghệ, PDF không trích nguồn cụ thể cho con số 3.000đ/km |

---

## 4. Ví & giao dịch — `lib/store/index.ts`

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| Phí nền tảng CoGo | `serviceFee = round(totalPrice × 0.08)` (8%) | Phí giữ lại khi ghép chuyến thành công, khớp với PDF mục 4.2 (đề xuất 5–10%) | 🟢 áp dụng đúng mọi giao dịch |
| Tài xế nhận được | `totalPrice − serviceFee`, cộng vào `walletBalance` khi hoàn tất chuyến | Giải ngân sau khi trừ phí nền tảng | 🟢 |
| Hành khách "đã tiết kiệm" | `moneySaved += round(totalPrice × 0.35)` mỗi chuyến hoàn tất (chỉ tính cho hành khách) | Giả định tiết kiệm 35% so với phương án khác (gọi xe công nghệ) — khớp khoảng PDF nêu "30–40%" | 🟡 hệ số cố định, không so sánh với giá Grab/Be thời gian thực |
| Hoàn tiền khi huỷ | `walletBalance += totalPrice` cho hành khách | Hoàn toàn bộ tiền tạm giữ (escrow) khi huỷ chuyến | 🟢 |

---

## 5. Tác động môi trường — CO₂

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| CO₂ giảm mỗi chuyến | `estimateCo2SavedKg(sharedDistanceKm) = sharedDistanceKm × 0.09 kg/km` — cộng cho **cả tài xế lẫn hành khách** khi hoàn tất chuyến | ~90g CO₂ tránh được mỗi km nhờ bớt 1 xe máy đi riêng trên đoạn trùng lộ trình | 🟡 hệ số giả định trong code, không trích nguồn nghiên cứu cụ thể (khác với PDF vốn có trích dẫn Ma et al. 2018, BlaBlaCar 2022...) |
| Quy đổi cây xanh | `treesEquivalent = max(1, round(co2SavedKg / 21))` | 1 cây hấp thụ ~21kg CO₂/**năm** (đã sửa nhãn từ "/tháng" — số liệu phổ biến là theo năm) | 🟡 hệ số tham khảo phổ biến, không trích nguồn trong code |
| Biểu đồ "xu hướng 6 tuần" (trang Tác động) | `distributeGrowth(total, 6 điểm)`: chia tổng CO₂/tiền tiết kiệm **hiện tại** thành 6 mốc theo trọng số `(i+1)^1.3`, tạo đường cong tăng dần | Chỉ là **minh hoạ hình ảnh** — hệ thống chưa lưu lịch sử theo tuần thật (chưa có timestamp tổng hợp theo kỳ) | 🟠 minh hoạ, không phải dữ liệu lịch sử thật |

---

## 6. Đánh giá (Rating) — `lib/store/index.ts`

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| Điểm trung bình mới | `newAvg = round(((oldAvg × oldCount + stars) / newCount) × 100) / 100` | Công thức trung bình cộng dồn chuẩn (cumulative average) | 🟢 |

---

## 7. Doanh nghiệp / ESG — `lib/store/index.ts` (`seedEnterprise`), `app/enterprise/page.tsx`

| Yếu tố | Công thức | Ý nghĩa | Tin cậy |
|---|---|---|---|
| CO₂/số chuyến/tiền tiết kiệm "tháng này" | Cộng dồn `co2SavedKg`, `tripsCount`, `moneySaved` của **tất cả nhân viên có `companyId` khớp công ty đó** | Đây là số **tính thật**, khớp đúng tổng danh sách nhân viên hiển thị cùng trang — đã sửa từ số gõ tay cố định trước đó | 🟢 (mới sửa) |
| Chỗ đỗ xe giải phóng | `round(tripsShared / 17)` — hằng số `TRIPS_PER_PARKING_SPOT = 17` | Giả định ~17 chuyến đi chung thì giải phóng 1 chỗ đỗ cố định | 🟡 hằng số tự đặt, tách riêng thành constant để dễ thay khi có số liệu khảo sát thật |
| Xu hướng 3 tháng (biểu đồ cột) | Cùng công thức `distributeGrowth()` như mục 5, áp cho từng chỉ số (CO₂, chuyến, tiền) | Minh hoạ tăng trưởng từ tổng hiện tại, nhãn tháng lấy 3 tháng gần nhất tính từ ngày hệ thống | 🟠 minh hoạ, không phải lịch sử thật |
| Gợi ý tiết kiệm chi phí bãi đỗ | `parkingSpotsFreed × 1.500.000đ/tháng` | Giả định chi phí vận hành trung bình 1 chỗ đỗ/tháng | 🟡 hằng số tự đặt trong `app/enterprise/page.tsx`, chưa có nguồn trích dẫn |

---

## Bảng tổng hợp — những hằng số "tự đặt" cần nhớ khi bị hỏi

| Hằng số | Giá trị | Ở đâu |
|---|---|---|
| Phí nền tảng | 8% | `lib/store/index.ts` |
| Hệ số tiết kiệm hành khách | 35% | `lib/store/index.ts` |
| CO₂ tránh được | 0.09 kg/km | `lib/geo/index.ts` |
| Hấp thụ CO₂/cây | 21kg/**năm** | `app/(app)/impact/page.tsx` |
| Hệ số bù khoảng cách chim bay → đường thật | ×1.25 | `app/(app)/trips/new/page.tsx` |
| Đơn giá đề xuất | 3.000đ/km | `app/(app)/trips/new/page.tsx` |
| Ngưỡng trùng lộ trình tối thiểu | 20% | `app/(app)/trips/[id]/match/page.tsx` |
| Cửa sổ thời gian ghép | ±60 phút | `app/(app)/trips/[id]/match/page.tsx` |
| Corridor so khớp | 300m–1000m theo detour tolerance | `app/(app)/trips/[id]/match/page.tsx` |
| Chuyến/chỗ đỗ giải phóng | 17 chuyến/chỗ | `lib/store/index.ts` |
| Chi phí vận hành 1 chỗ đỗ | 1.500.000đ/tháng | `app/enterprise/page.tsx` |
| Tốc độ trung bình ước tính ETA | 26 km/h | `lib/geo/index.ts` |

**Cách trả lời an toàn nếu bị hỏi nguồn của các hằng số 🟡**: đây là các giả định hợp lý dùng cho giai đoạn MVP/demo, cần được hiệu chỉnh bằng dữ liệu vận hành thật hoặc khảo sát thị trường khi triển khai — không phải số bịa ra không có logic, mà là điểm khởi đầu có thể điều chỉnh (tương tự cách các nền tảng ride-hailing khác cũng bắt đầu bằng heuristic rồi tinh chỉnh dần bằng dữ liệu thật).
