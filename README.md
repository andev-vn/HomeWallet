# Ví Nhà — Quản lý chi tiêu gia đình

Ứng dụng web quản lý chi tiêu cho cả gia đình, dựng từ thiết kế **Stitch** ("Ví Nhà"),
xây bằng **Next.js (App Router, TypeScript)** + **MUI**, dữ liệu ở **PostgreSQL (Neon)**
qua **Drizzle ORM**. Giao diện **responsive**: sidebar trên desktop, bottom-nav trên mobile.

## Yêu cầu

- Node.js 20+ · pnpm 9+ · một database PostgreSQL (Neon)

## Thiết lập

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
SESSION_SECRET="chuỗi-ngẫu-nhiên-dài"      # bí mật ký phiên đăng nhập
GOOGLE_CLIENT_ID=""                          # (tuỳ chọn) bật đăng nhập Google
GOOGLE_CLIENT_SECRET=""

pnpm install
pnpm db:push    # tạo bảng theo src/db/schema.ts
pnpm db:seed    # nạp dữ liệu mẫu (1 nhà, 4 thành viên, danh mục, chi tiêu)
pnpm dev        # http://localhost:3000
```

### Bật đăng nhập Google (tuỳ chọn)

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
   → **Create OAuth client ID** → loại **Web application**.
2. Thêm **Authorized redirect URI**: `http://localhost:3000/api/auth/google/callback`
   (và URL production tương ứng khi deploy).
3. Dán **Client ID / Client Secret** vào `.env.local`, khởi động lại `pnpm dev`.

Khi chưa cấu hình, nút "Đăng nhập bằng Google" sẽ báo lỗi nhẹ nhàng và quay về trang đăng nhập.

## Lệnh

```
pnpm dev | build | start | lint
pnpm db:push    # đồng bộ schema lên DB
pnpm db:seed    # nạp dữ liệu mẫu
pnpm db:studio  # Drizzle Studio
```

## Các trang

| Route       | Mô tả                                                                 |
|-------------|-----------------------------------------------------------------------|
| `/register` | Đăng ký tài khoản (bắt đầu ở chế độ cá nhân)                          |
| `/login`    | Đăng nhập                                                             |
| `/invite`   | Nhập mã mời để tham gia một nhà (prefill từ `?code=`)                 |
| `/home`     | Trang Nhà: nếu có nhà → dashboard thành viên; nếu cá nhân → tổng quan + mời tạo nhà |
| `/expenses` | Chi Tiêu Của Tôi: tổng + ngân sách còn lại + chi tiết danh mục (cá nhân) |
| `/history`  | Lịch Sử: timeline theo tháng (gia đình nếu có nhà, ngược lại cá nhân) |
| `/add`      | Thêm Chi Tiêu (ghi vào DB qua Server Action)                         |
| `/profile`  | Hồ Sơ: thông tin user, mã mời nhà, thành viên, tạo/tham gia/rời nhà   |

`/` chuyển hướng tới `/home`. `src/proxy.ts` bảo vệ các route `(app)` (chưa đăng nhập → `/login`).
Trang `(auth)` không có khung điều hướng; trang `(app)` bọc trong `AppShell`.

**Mô hình:** người dùng là gốc. Mới đăng ký = cá nhân quản lý chi tiêu riêng. Tạo nhà
(sinh mã mời) hoặc nhập mã để tham gia → mọi thành viên trong nhà thấy chi tiêu của nhau.

**Tài khoản demo** (mật khẩu `123456`): `botuan@vinha.app` (trong nhà, mã mời `GIADINH`) ·
`an@vinha.app` (cá nhân).

## Cấu trúc

```
src/
├── app/
│   ├── layout.tsx              # MUI providers + font Plus Jakarta Sans + Material Symbols
│   ├── (app)/                  # nhóm có sidebar + bottom nav (AppShell)
│   │   ├── layout.tsx
│   │   ├── home | expenses | history | add | profile | settings/page.tsx
│   └── (auth)/                 # nhóm căn giữa, không nav
│       ├── layout.tsx
│       └── login | invite/page.tsx
│
├── components/
│   ├── Ms.tsx                  # icon Material Symbols
│   └── layout/
│       ├── AppShell.tsx        # sidebar (desktop) + bottom nav (mobile) + FAB
│       └── navItems.ts
│
├── db/
│   ├── schema.ts               # households, members, categories, expenses
│   ├── index.ts                # Drizzle client (Neon)
│   └── seed.ts
│
├── features/
│   ├── households/queries.ts   # getContext (nhà + "tôi" + thành viên)
│   └── expenses/
│       ├── queries.ts          # lấy chi tiêu đã join
│       ├── lib.ts              # gộp theo tháng / thành viên / danh mục (thuần JS)
│       ├── actions.ts          # addExpense (Server Action)
│       └── components/AddExpenseForm.tsx
│
├── theme/theme.ts              # design system Stitch + export `c` (color tokens)
├── types/index.ts · utils/format.ts
```

### Ghi chú thiết kế

- **Auth nhẹ kiểu prototype** (`src/features/auth/`): mật khẩu hash bằng `scrypt`
  (built-in), phiên lưu trong cookie httpOnly ký HMAC. `getCurrentUser()`/`requireUser()`
  đọc phiên; `proxy.ts` chặn route. ⚠️ Đặt `SESSION_SECRET` thật và cân nhắc thư viện
  auth (Auth.js…) trước khi đưa lên production.
- **Đăng nhập Google** tự xây (OAuth 2.0 code flow) tại `src/app/api/auth/google/*` —
  đổi code → lấy hồ sơ → tạo/đăng nhập user → set cùng cookie phiên. Cần `GOOGLE_CLIENT_*`.
- Mỗi khoản chi có **hình thức** `paymentMethod`: `cash` (tiền mặt) | `transfer` (chuyển khoản).
- Mobile có **header** riêng (logo + thông báo + avatar) vì sidebar bị ẩn ở màn nhỏ.
- `getContext()` trả về user hiện tại + nhà của họ (nếu có) + các thành viên cùng nhà.
- Đọc dữ liệu trong Server Component qua `queries.ts`; ghi qua `actions.ts` (`'use server'`)
  rồi `revalidatePath`. Trang `(app)` đặt `dynamic = 'force-dynamic'`.
- Màu/typography lấy từ design system "Warm Family Finance" (cam `#f97316`, Plus Jakarta Sans).
  Token màu tập trung ở `c` trong `theme/theme.ts`.

## Công cụ (scripts/)

- `stitch-mcp.mjs` — client gọi Stitch MCP qua HTTP (list/get screens...).
- `dump-designs.mjs` — tải HTML thiết kế gốc về `scripts/designs/` (tham chiếu).
- `inspect-db.mjs`, `reset-db.mjs` — tiện ích DB.

## MCP

`.mcp.json` (đã gitignore vì chứa connection string) khai báo Postgres MCP server.
Khởi động lại Claude Code để nạp.
