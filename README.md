# King Express Bus - Frontend (Next.js)

Hệ thống giao diện người dùng và quản trị (Client & Admin Portal) dành cho dịch vụ xe khách chất lượng cao **King Express Bus**, tích hợp đặt vé xe, đặt phòng khách sạn, đặt tour du lịch và thanh toán tự động qua SePay (VietQR).

---

## 🚀 Công nghệ sử dụng (Tech Stack)

| Hạng mục | Công nghệ |
|---|---|
| **Framework** | [Next.js 15.5](https://nextjs.org/) (App Router, Turbopack, React 19.1) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI, Lucide Icons |
| **State & Data Fetching** | [@tanstack/react-query v5](https://tanstack.com/query) |
| **Đa ngôn ngữ (i18n)** | [next-intl v4](https://next-intl-docs.vercel.app/) (`vi`, `en`) |
| **Form & Validation** | React Hook Form, Zod (`@hookform/resolvers`) |
| **Bảng dữ liệu & Drag-Drop**| [@tanstack/react-table v8](https://tanstack.com/table), `@dnd-kit/core` |
| **Editor & Charts** | Tiptap Rich Text Editor (`@tiptap/react`), Recharts |
| **Thanh toán** | SePay Gateway (VietQR) |

---

## 📁 Cấu trúc Thư mục Chính

```text
kingexpressbus-fe-nextjs/
├── public/                 # Static assets (images, icons, logos)
├── scripts/                # Utility scripts (e.g., i18n parity checker)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (admin)/        # Quan-tri portal routes (/quan-tri)
│   │   ├── (client)/       # Public user routes ([locale]: /vi, /en)
│   │   ├── dat-ve/         # SePay payment redirects & gateway returns
│   │   └── layout.jsx      # Root HTML layout with x-app-locale header
│   ├── components/         # Shared React components (admin, client, ui)
│   ├── hooks/              # Custom React hooks (e.g. use-admin-list)
│   ├── i18n/               # next-intl configuration & routing setup
│   ├── lib/                # Libraries (SEO metadata helpers, etc.)
│   ├── messages/           # Translation JSON files (en.json, vi.json)
│   ├── services/           # API fetchers & FastAPI integrations
│   ├── utils/              # Formatting & helper functions
│   └── views/              # Page view implementations (admin, client)
├── docs/                   # Chi tiết tài liệu dự án
└── Dockerfile              # Production Multi-stage Dockerfile
```

---

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- **Node.js**: `>= 18.x`
- **npm**: `>= 9.x`

### 2. Cấu hình Biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của frontend:

```env
# Client browser API URL (truy cập từ trình duyệt người dùng)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Server-side API URL (truy cập nội bộ trong Docker network cho SSR/RSC)
API_INTERNAL_URL=http://api:8000
```

### 3. Cài đặt Dependencies
```bash
npm install
```

### 4. Lệnh chạy (Scripts)

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy môi trường Dev server với Turbopack (mặc định: `http://localhost:3000`) |
| `npm run build` | Build ứng dụng cho môi trường Production |
| `npm run start` | Chạy ứng dụng đã được build |
| `npm run lint` | Kiểm tra cú pháp & quy chuẩn code bằng ESLint |
| `npm run check:i18n` | Kiểm tra đồng bộ key giữa các ngôn ngữ (`en.json` vs `vi.json`) |

---

## 🐳 Triển khai với Docker

### Chạy môi trường Local Compose:
```bash
docker-compose -f docker-compose.local.yml up --build -d
```

### Chạy môi trường Production Compose:
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

---

## 📚 Tài liệu Chi tiết (`./docs`)

Mọi thông tin chi tiết về kiến trúc, luồng xử lý và tiêu chuẩn được lưu tại thư mục `./docs`:

- 📋 [Overview & PDR](./docs/project-overview-pdr.md): Tổng quan dự án, tính năng & yêu cầu kinh doanh.
- 📦 [Codebase Summary](./docs/codebase-summary.md): Chi tiết module và các service layer.
- 📏 [Code Standards](./docs/code-standards.md): Quy chuẩn viết code, quản lý state và i18n.
- 🏗️ [System Architecture](./docs/system-architecture.md): Sơ đồ kiến trúc hệ thống & SePay payment flow.
- 🚀 [Deployment Guide](./docs/deployment-guide.md): Cấu hình Docker, Nginx & Production deployment.
- 🎨 [Design Guidelines](./docs/design-guidelines.md): Hệ thống thiết kế UI, màu sắc & typography.
- 🗺️ [Project Roadmap](./docs/project-roadmap.md): Lộ trình phát triển & tính năng tương lai.
