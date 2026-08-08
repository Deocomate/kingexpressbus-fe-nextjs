# Codebase Summary & Module Breakdown

## 1. Directory Structure Overview

Thư mục nguồn `src/` được tổ chức theo tiêu chuẩn của Next.js 15 App Router, tách biệt rõ ràng giữa logic Routing, Services layer, UI components và Views.

```text
src/
├── app/                  # Route Handlers & Layouts (App Router)
│   ├── (admin)/          # Group route dành riêng cho Admin Portal (/quan-tri)
│   ├── (client)/         # Group route dành cho Public Portal ([locale]: /vi, /en)
│   ├── dat-ve/           # Direct/Gateway payment return routes
│   ├── layout.jsx        # Root HTML Layout wrapper (X-App-Locale header setup)
│   ├── page.jsx          # Root redirection route
│   ├── globals.css       # Global Tailwind CSS v4 & theme variables
│   ├── robots.js         # Dynamic robots.txt generation
│   └── sitemap.js        # Dynamic sitemap.xml generation
│
├── components/           # Reusable UI & Logical Components
│   ├── admin/            # Shared Admin components (Sidebar, Tables, Header, Forms)
│   ├── client/           # Shared Client components (Navbar, Footer, SeatPicker, SearchBar)
│   └── ui/               # Primitive shadcn/radix UI elements (Button, Dialog, Input, Select, etc.)
│
├── hooks/                # Custom React Hooks
│   └── use-admin-list.js # Generic pagination & filter query hook cho Admin CRUD
│
├── i18n/                 # next-intl Configuration
│   ├── request.js        # Request-scoped locale loader
│   └── routing.js        # Locale routing definition (locales: ['vi', 'en'], default: 'vi')
│
├── lib/                  # Helper Libraries & SEO
│   └── seo/              # SEO metadata builders & OpenGraph generation
│
├── messages/             # i18n Dictionaries
│   ├── en.json           # English translations
│   └── vi.json           # Vietnamese translations
│
├── services/             # API Data Layer (Fetchers & Endpoints)
│   ├── api-base.js       # Base fetch client, API_BASE resolution, ApiError wrapper
│   ├── admin-api.js      # Generic Admin CRUD helper (fetchPaginated, adminCreate, adminUpdate, adminDelete)
│   ├── admin-auth.js     # Admin authentication API (login, logout, get me)
│   ├── admin-bookings.js # Admin booking management API
│   ├── admin-routes.js   # Admin routes management API
│   ├── admin-uploads.js  # File upload & image handling API
│   ├── booking-api.js    # Client seat selection, price calculation, booking submission API
│   ├── client-api.js     # General client data API (trips search, routes list, locations)
│   ├── client-auth.js    # Client user registration & auth API
│   ├── client-routes.js  # Public routes & trip details API
│   ├── hotel-api.js      # Hotel & room booking API
│   └── tour-api.js       # Tour packages booking API
│
├── utils/                # Utility Functions
│   ├── booking-notes.js  # Format notes & seat details
│   ├── client-format.js  # Currency (VND/USD), date/time formatters
│   └── cn.js             # Tailwind class merging utility (clsx + tailwind-merge)
│
└── views/                # Full-page View Components
    ├── admin/            # View components rendered in Admin routes
    ├── client/           # View components rendered in Client routes
    ├── payments/         # SePay payment status & gateway views
    └── root/             # Root container & error views
```

---

## 2. Key Modules & Services Layer Breakdown

### 2.1. API Service Architecture (`src/services/`)

Dự án áp dụng mô hình tập trung API qua `api-base.js`:

- **`resolveApiBase()`**:
  - Khi chạy tại Browser: lấy biến `NEXT_PUBLIC_API_URL`.
  - Khi chạy tại Server (SSR/RSC): ưu tiên lấy biến `API_INTERNAL_URL` (ví dụ `http://api:8000` trong Docker network) để giảm latency mạng nội bộ.
- **`apiFetch(path, init)`**:
  - Tự động gắn tiền tố `/api/v1`.
  - Kiểm tra response status, parse JSON lỗi và ném ra `ApiError` chứa HTTP status code và payload chi tiết từ FastAPI backend.
- **`admin-api.js`**:
  - Đơn giản hóa các thao tác CRUD chuẩn của Admin: `fetchPaginated()`, `adminGet()`, `adminCreate()`, `adminUpdate()`, `adminDelete()`, `adminReorder()`.
  - Đồng bộ chuẩn response phân trang của FastAPI backend (`{ items, total, page, page_size }`).

### 2.2. Multilingual (i18n) Engine (`src/i18n/`, `src/messages/`)

- Cấu hình tại `src/i18n/routing.js` định nghĩa danh sách ngôn ngữ hỗ trợ (`['vi', 'en']`) và mặc định (`'vi'`).
- `middleware.js` chặn và điều hướng các URL khách hàng sang tiền tố ngôn ngữ (VD: `/vi/tim-kiem`, `/en/tim-kiem`).
- Header `x-app-locale` được bổ sung để `app/layout.jsx` nhận biết locale ở cấp độ Server-side HTML render.
- Script `scripts/i18n/check-lang-parity.mjs` đảm bảo cả 2 file `vi.json` và `en.json` luôn có đầy đủ key bằng nhau.

### 2.3. SePay Payment Integration (`src/app/dat-ve/`, `src/views/payments/`)

- Tích hợp cổng VietQR động của SePay.
- Khi người dùng tạo vé thành công, hệ thống chuyển hướng sang giao diện hiển thị QR chuyển khoản chứa cú pháp mã hóa vé (`KINGEXPRESS <MÃ_ĐƠN>`).
- Hệ thống hỗ trợ lắng nghe sự kiện webhook từ SePay qua Backend và cập nhật giao diện Frontend real-time thông qua Polling / React Query refetch.

---

## 3. Key Dependencies Overview

- **`next` (15.5.22)** & **`react` (19.1.0)**: Nền tảng framework web SSR/CSR.
- **`@tanstack/react-query`**: Quản lý server state, cache dữ liệu API, tự động refetch khi phím search/filter thay đổi.
- **`next-intl`**: Xử lý dịch thuật, định dạng tiền tệ và ngày tháng đa ngôn ngữ.
- **`react-hook-form`** + **`zod`**: Quản lý form nhập liệu phức tạp (form thông tin hành khách, form cấu hình chuyến xe, form cập nhật bài viết).
- **`@tiptap/react`**: Trình soạn thảo văn bản Rich Text Editor tích hợp trong quản trị nội dung bài viết.
