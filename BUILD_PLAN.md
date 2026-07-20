# Roadmap dựng lại: Xây CoGo (bản demo hiện tại) từ con số 0

> Đây là bản dựng lại trình tự hợp lý để đi từ một thư mục trống đến đúng trạng thái codebase hiện có trong repo này (bản prototype UI chạy hoàn toàn client-side, dữ liệu giả lập). Thứ tự các bước bám theo **quan hệ phụ thuộc kỹ thuật thực tế**: cái sau luôn cần cái trước đã tồn tại thì mới code được.

## Giai đoạn 0 — Khởi tạo dự án & công cụ nền

**Mục tiêu:** có một Next.js app chạy được, có style system và bộ UI kit sẵn sàng dùng.

1. `create-next-app` với App Router + TypeScript + Tailwind → sinh ra `app/`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`.
2. Cài Tailwind v4 (`@tailwindcss/postcss`), cấu hình `postcss.config.mjs`.
3. Khởi tạo shadcn/ui (`components.json`) → tạo sẵn khung để `npx shadcn add <component>` sinh file vào `components/ui/`.
4. Cài các thư viện lõi sẽ dùng xuyên suốt: `zustand`, `date-fns`, `clsx` + `tailwind-merge` (→ `lib/utils.ts` hàm `cn()`), `lucide-react`, `sonner`, `framer-motion`.
5. Định nghĩa theme: brand colors (`brand-green`, `brand-blue`...), dark mode tokens trong `app/globals.css`.

**Kết quả:** `npm run dev` chạy ra trang trắng có Tailwind + font Geist hoạt động.

## Giai đoạn 1 — Khung ứng dụng (App Shell)

**Mục tiêu:** có "cái vỏ" giao diện điện thoại trước khi có màn hình thật nào.

1. `components/app-shell/phone-frame.tsx` — khung mô phỏng điện thoại bọc toàn app.
2. `components/app-shell/client-only.tsx` + `splash-fallback.tsx` — xử lý hydration mismatch (vì sẽ dùng `localStorage`).
3. `app/layout.tsx` — root layout, load font, bọc `PhoneFrame`, `TooltipProvider`, `Toaster` (sonner).
4. `components/app-shell/screen-header.tsx` — header dùng chung cho mọi trang con (nút back, title).
5. `components/app-shell/bottom-nav.tsx` — thanh điều hướng dưới, nhưng **để trống route** vì các trang đích chưa tồn tại.

**Kết quả:** app hiện khung điện thoại rỗng, có thể điều hướng nhưng chưa có nội dung.

## Giai đoạn 2 — Mô hình dữ liệu & tiện ích tính toán (trước khi viết bất kỳ màn hình nào)

**Mục tiêu:** định nghĩa "thế giới dữ liệu" trước, để mọi UI sau này có type để code theo — đây là bước quan trọng nhất về tư duy kiến trúc: **domain model đi trước UI**.

1. `lib/types.ts` — toàn bộ interface: `User`, `Vehicle`, `Trip`, `Match`, `Transaction`, `Rating`, `ChatMessage`, `NotificationItem`, `EnterpriseAccount`.
2. `lib/geo/index.ts` — các hàm thuần logic không phụ thuộc UI: `haversineKm`, `routeLengthKm`, `routeOverlapPercent` (thuật toán ghép chuyến MVP), `geocodeAddress` (Nominatim), `fetchRoute` (OSRM), `pointAlongRoute`, `estimateEtaMinutes`, `estimateCo2SavedKg`.
3. `lib/seed/data.ts` — dữ liệu mẫu: toạ độ tuyến đường thật ở TP.HCM (`ROUTES`), `buildSeedUsers()`, `buildSeedTrips()` — cần `types.ts` và `geo/index.ts` đã có trước.

**Kết quả:** chưa có UI nào, nhưng đã có thể viết unit test / chạy thử hàm ghép chuyến độc lập trong console.

## Giai đoạn 3 — State management (nối dữ liệu với UI tương lai)

**Mục tiêu:** một nguồn sự thật (single source of truth) cho toàn app.

1. `lib/store/index.ts` — Zustand store với `persist` middleware (localStorage), khởi tạo từ `initialState()` dùng seed data ở Giai đoạn 2.
2. Viết đủ actions nghiệp vụ ngay từ đầu dù UI chưa gọi tới: `addTrip`, `createMatch`, `startTrip`, `advanceTrip`, `completeTrip`, `cancelMatch`, `topUpWallet`, `sendMessage`, `submitRating`, `pushNotification`... — vì các action này định hình luôn "API nội bộ" mà mọi trang sau sẽ gọi.
3. Hook tiện ích `useCurrentUser()`.

**Kết quả:** có thể mở React DevTools / console gọi thử `useAppStore.getState().addTrip(...)` và thấy state thay đổi — dù chưa có UI.

## Giai đoạn 4 — Bộ UI kit dùng chung

**Mục tiêu:** có đủ component nguyên tử trước khi lắp màn hình.

1. `npx shadcn add` lần lượt: `button`, `card`, `input`, `label`, `badge`, `avatar`, `dialog`, `sheet`, `drawer`, `tabs`, `select`, `switch`, `slider`, `progress`, `separator`, `skeleton`, `tooltip`, `dropdown-menu`, `accordion`, `checkbox`, `radio-group`, `scroll-area`, `textarea`, `sonner`.
2. Đây là bước "mua nguyên vật liệu" — không có logic nghiệp vụ, chỉ là component trình bày thuần.

## Giai đoạn 5 — Bản đồ (một hạ tầng riêng vì phức tạp và cần SSR-safe)

**Mục tiêu:** Leaflet chỉ chạy được ở client, nên tách thành nhóm riêng, load `dynamic(..., { ssr:false })`.

1. `components/map/leaflet-map.tsx` — component Leaflet gốc (marker, polyline).
2. `components/map/route-map.tsx` — wrapper `next/dynamic` bọc `leaflet-map`, có skeleton loading.
3. `components/map/location-picker.tsx` — input tìm địa chỉ, gọi `geocodeAddress` từ Giai đoạn 2, debounce 450ms.

**Kết quả:** có thể nhúng bản đồ vào bất kỳ trang nào từ đây trở đi.

## Giai đoạn 6 — Luồng onboarding & xác thực (điểm vào của app)

**Mục tiêu:** người dùng chạm vào app lần đầu phải đi qua luồng này trước khi thấy nội dung chính — nên code trước cả `/home`.

1. `app/page.tsx` — splash, điều hướng theo `onboardingDone` / `authStep` trong store.
2. `app/onboarding/page.tsx` — 3 slide giới thiệu (Framer Motion).
3. `app/(auth)/login/page.tsx` — nhập SĐT → OTP giả (`123456`).
4. `app/(auth)/verify/page.tsx` — eKYC giả lập (CCCD + selfie), export `UploadTile` để tái dùng.
5. `app/(app)/vehicle-setup/page.tsx` — đăng ký xe (phụ thuộc `verify/page.tsx` vì tái dùng `UploadTile`).

**Kết quả:** luồng "vào app lần đầu" chạy trọn vẹn, kết thúc bằng redirect `/home` (trang chưa tồn tại — chấp nhận lỗi 404 tạm thời).

## Giai đoạn 7 — Layout khu vực chính & trang chủ

1. `app/(app)/layout.tsx` — bọc `BottomNav` cho toàn bộ nhóm route `(app)`.
2. `app/(app)/home/page.tsx` — dùng `RouteMap` (Giai đoạn 5), đọc `useCurrentUser`/`useAppStore` (Giai đoạn 3).

## Giai đoạn 8 — Luồng lõi: tạo chuyến → ghép chuyến → chi tiết → tracking → đánh giá

**Đây là nhóm màn hình phức tạp nhất, phải làm theo đúng thứ tự vì trang sau điều hướng ra từ trang trước:**

1. `app/(app)/trips/new/page.tsx` — form tạo chuyến, gọi `fetchRoute` + `addTrip`.
2. `app/(app)/trips/[id]/match/page.tsx` — chạy `routeOverlapPercent` để xếp hạng ứng viên, gọi `createMatch`.
3. `app/(app)/trips/match/[matchId]/page.tsx` — chi tiết match, nút "Bắt đầu chuyến đi" → `startTrip`.
4. `app/(app)/trips/match/[matchId]/track/page.tsx` — mô phỏng di chuyển bằng `setInterval` gọi `advanceTrip`, nút SOS.
5. `app/(app)/trips/match/[matchId]/rate/page.tsx` — đánh giá sao + tag, gọi `submitRating`.
6. `app/(app)/trips/page.tsx` — danh sách tổng hợp tất cả match của user (upcoming/history).

## Giai đoạn 9 — Các trang phụ trợ (độc lập, có thể làm song song)

Không phụ thuộc lẫn nhau, phụ thuộc Giai đoạn 3 + 4 là đủ:

- `app/(app)/wallet/page.tsx` — ví, nạp tiền, lịch sử giao dịch.
- `app/(app)/chat/page.tsx` + `chat/[matchId]/page.tsx` — danh sách hội thoại + thread có auto-reply giả lập.
- `app/(app)/profile/page.tsx` — hồ sơ, bật chế độ tài xế, reset demo.
- `app/(app)/settings/page.tsx` — cài đặt & an toàn (chỉ UI, chưa nối state thật).
- `app/(app)/subscription/page.tsx` — gói Commuter Pass.
- `app/(app)/notifications/page.tsx` — đọc `notifications` từ store (đã được các action ở Giai đoạn 3 tự động `pushNotification`).

## Giai đoạn 10 — Dashboard dữ liệu (cần thêm thư viện chart)

1. Cài `recharts`.
2. `app/(app)/impact/page.tsx` — biểu đồ CO₂/tiền tiết kiệm cá nhân.
3. `app/enterprise/page.tsx` — dashboard ESG doanh nghiệp, cần mở rộng `lib/store/index.ts` thêm `seedEnterprise()` và field `enterprise` trong state.

## Giai đoạn 11 — Hoàn thiện 5 kịch bản demo cứng theo pitch deck

1. Bổ sung thêm route/user/trip mẫu vào `lib/seed/data.ts` (5 kịch bản: KTX Khu B↔SPKT ô tô/xe máy, Vincom→sân bay, Q7→Vũng Tàu, SPKT→Aeon Bình Tân) — đây là bước **quay lại** Giai đoạn 2 sau khi đã có đủ UI để kiểm chứng trực quan các kịch bản khớp lộ trình.
2. Tinh chỉnh `routeOverlapPercent` corridor width, `notes`, `maxPickupPoints`, `genderPreference` trên từng trip để demo đúng ý pitch deck.
3. Polish UI cuối: safe-area padding, empty states, toast messages tiếng Việt.

---

## Tóm tắt trình tự phụ thuộc (dependency chain)

```
Setup & Tailwind & shadcn
        ↓
App Shell (PhoneFrame, layout)
        ↓
Domain types + Geo utils + Seed data   ← không phụ thuộc UI, làm sớm nhất có thể
        ↓
Zustand store (dùng types + seed)
        ↓
UI kit (shadcn components)  +  Map components (song song)
        ↓
Onboarding/Auth flow (điểm vào app)
        ↓
Home + App layout
        ↓
Luồng lõi: New Trip → Match → Detail → Track → Rate  (tuần tự bắt buộc)
        ↓
Trang phụ trợ: Wallet, Chat, Profile, Settings, Subscription, Notifications  (song song)
        ↓
Dashboard: Impact, Enterprise (cần recharts)
        ↓
5 kịch bản demo cứng + polish cuối
```

**Nguyên tắc cốt lõi rút ra**: dự án này được dựng theo hướng **"data & domain model trước, UI sau"** — `lib/types.ts` → `lib/geo` → `lib/seed` → `lib/store` luôn đi trước bất kỳ trang `.tsx` nào, vì mọi trang chỉ là lớp trình bày (view) gọi vào state đã có sẵn actions đầy đủ. Đây cũng là lý do vì sao thêm màn hình mới (`components/{chat,match,rating,trip,wallet}` hiện đang rỗng) sau này sẽ nhanh — chỉ cần tách phần JSX đã viết trong các `page.tsx` ra thành component tái dùng, không cần đổi tầng dữ liệu.
