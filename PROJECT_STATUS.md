# Ví Nhà — Tổng kết trạng thái dự án

> Cập nhật: 2026-06-12 · Build: ✅ Thành công (0 lỗi TS)

---

## ✅ Đã làm xong

### Nền tảng
- [x] Next.js 16 App Router + TypeScript + pnpm
- [x] MUI 9 (AppRouterCacheProvider → ThemeProvider → CssBaseline)
- [x] Drizzle ORM + Neon PostgreSQL (`@neondatabase/serverless`)
- [x] `proxy.ts` (Next 16, thay cho `middleware.ts` deprecated) — bảo vệ route `/home`, `/add`, `/expenses`, `/history`, `/profile`, `/settings`
- [x] Material Symbols (Google Fonts) cho icon set

### Auth (username + password)
- [x] Đăng ký: `username` (3–20 ký tự, `[a-zA-Z0-9_.]`), tên hiển thị, mật khẩu
- [x] Đăng nhập: tra cứu theo `username`, scrypt hash/verify
- [x] Session cookie HMAC-signed (`vn_session`)
- [x] Logout

### Mô hình đa nhà (multi-household)
- [x] 1 user có thể thuộc nhiều nhà (many-to-many qua `household_members`)
- [x] Tạo nhà: chủ nhà tự động được thêm `status: active`, sinh `inviteCode` 6 ký tự ngẫu nhiên
- [x] Tham gia bằng mã mời → `status: pending` (chờ duyệt)
- [x] Chủ nhà duyệt / từ chối yêu cầu (`approveMember` / `rejectMember`)
- [x] Rời nhà (`leaveHousehold` — chủ nhà không được rời)
- [x] Chuyển nhà đang xem (`switchHousehold` + cookie `vn_household`)
- [x] `HouseholdSwitcher` — dropdown trên sidebar desktop + header mobile

### Chi tiêu
- [x] Thêm chi tiêu: gắn với nhà đang xem (hoặc `null` = cá nhân)
- [x] Hình thức thanh toán: tiền mặt / chuyển khoản
- [x] Phân loại theo category (icon + màu)
- [x] Truy vấn chi tiêu theo hộ gia đình hoặc cá nhân

### Giao diện (responsive desktop + mobile)
- [x] AppShell: sidebar desktop cố định + header/bottom-nav mobile
- [x] `/home` — dashboard: banner yêu cầu chờ duyệt (chủ nhà), thẻ chi tiêu từng thành viên (chế độ nhà), CTA khi chưa có nhà
- [x] `/add` — form thêm chi tiêu
- [x] `/expenses` — danh sách chi tiêu tháng này
- [x] `/history` — lịch sử chi tiêu (có thể lọc theo tháng)
- [x] `/profile` — thông tin cá nhân, duyệt yêu cầu, danh sách nhà, thành viên
- [x] `/settings` — placeholder
- [x] `/login` — đăng nhập username
- [x] `/register` — đăng ký
- [x] `/invite` — tham gia bằng mã mời

### Dữ liệu mẫu (seed)
- [x] 5 user: `botuan`, `mehoa`, `conhai`, `belinh`, `an` (mật khẩu đều: `123456`)
- [x] 2 nhà: _Tổ Ấm Hạnh Phúc_ (botuan làm chủ) + _Nhóm Phượt_ (an làm chủ)
- [x] botuan thuộc cả 2 nhà (demo 1 user nhiều nhà)
- [x] belinh có trạng thái `pending` tại nhà 1 (demo luồng duyệt)
- [x] ~16 giao dịch mẫu trải 2 tháng

---

## ⚠️ Thiếu / Chưa làm

### Tính năng còn thiếu

| # | Tính năng | Ưu tiên | Ghi chú |
|---|-----------|---------|---------|
| 1 | **Sửa / Xoá chi tiêu** | Cao | Hiện chỉ có thêm mới |
| 2 | **Trang `/history` thực sự** | Cao | Hiện là placeholder; cần lọc theo tháng/nhà, phân trang |
| 3 | **Trang `/expenses` đầy đủ** | Cao | Cần bộ lọc category, khoảng ngày, tìm kiếm |
| 4 | **Biểu đồ / thống kê** | Trung bình | Trang home chỉ có số tổng; thiếu chart tháng, phân bổ category |
| 5 | **Trang `/settings` thực sự** | Trung bình | Hiện là placeholder; cần: đổi mật khẩu, chỉnh ngân sách, tên hiển thị, avatar |
| 6 | **Thông báo realtime** | Thấp | Yêu cầu tham gia chưa có push notification |
| 7 | **Phân trang** | Trung bình | Danh sách chi tiêu dài chưa có infinite scroll / pagination |
| 8 | **Upload avatar** | Thấp | Hiện dùng `ui-avatars.com`; cần Cloudflare R2 / Supabase Storage |
| 9 | **Export dữ liệu** | Thấp | Xuất CSV/Excel |
| 10 | **PWA / install prompt** | Thấp | App chi tiêu dùng mobile nhiều, nên có `manifest.json` |

### Kỹ thuật còn thiếu

| # | Hạng mục | Ghi chú |
|---|----------|---------|
| 1 | **Validation phía server đầy đủ** | Form `/add` chưa validate `amount > 0`, `occurredAt` hợp lệ |
| 2 | **Error boundary** | Không có `error.tsx` toàn cục; lỗi server sẽ crash trắng |
| 3 | **Loading skeleton** | Không có `loading.tsx`; trang bị chậm sẽ không có feedback |
| 4 | **Rate limiting** | Login/register không giới hạn số lần thử |
| 5 | **CSRF protection** | Server Actions Next.js có built-in origin check, nhưng chưa kiểm tra |
| 6 | **Test** | 0 unit test, 0 e2e test |
| 7 | **Optimistic UI** | Thêm chi tiêu phải chờ server round-trip; có thể dùng `useOptimistic` |
| 8 | **`SESSION_SECRET` production** | Phải set env var thực sự trước khi deploy |
| 9 | **DB migration workflow** | Hiện dùng `db:push` (dev-only); cần `drizzle-kit migrate` cho production |

---

## 🚀 Gợi ý bước tiếp theo (theo thứ tự ưu tiên)

1. **Sửa/xoá chi tiêu** — cần nhất để app dùng được thực tế
2. **Hoàn thiện `/history`** — lọc tháng, hiển thị đúng ngữ cảnh nhà/cá nhân
3. **`error.tsx` + `loading.tsx`** — UX cơ bản, làm nhanh
4. **Đổi thông tin trong Settings** — đổi mật khẩu, ngân sách tháng
5. **Biểu đồ trên Home** — chart phân bổ category dùng `recharts` hoặc MUI Charts

---

## Tài khoản demo

| Username | Mật khẩu | Vai trò |
|----------|----------|---------|
| `botuan` | `123456` | Chủ nhà _Tổ Ấm_ + thành viên _Nhóm Phượt_ |
| `mehoa` | `123456` | Thành viên _Tổ Ấm_ |
| `conhai` | `123456` | Thành viên _Tổ Ấm_ |
| `belinh` | `123456` | Đang chờ duyệt vào _Tổ Ấm_ |
| `an` | `123456` | Chủ nhà _Nhóm Phượt_, không có nhà gia đình |

Mã mời: `GIADINH` (Tổ Ấm Hạnh Phúc) · `PHUOT1` (Nhóm Phượt)
