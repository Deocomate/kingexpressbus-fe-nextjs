# System Architecture & Technical Flow

## 1. High-Level Architecture Diagram

Sơ đồ thể hiện luồng tương tác giữa Trình duyệt người dùng (Client Browser), Next.js Frontend App Router (SSR/CSR & Middleware), FastAPI Backend Service và Cổng thanh toán SePay.

```mermaid
graph TD
    subgraph User Workspace
        CB[Client Browser]
        AB[Admin Browser]
    end

    subgraph Frontend - Next.js 15 App Router
        MW[Middleware / next-intl & Auth Filter]
        RSC[Server Components - SSR]
        RCC[Client Components - React 19]
        API_LAYER[Services Layer / api-base.js]
    end

    subgraph Backend & Database - FastAPI
        BE_API[FastAPI Backend / REST API v1]
        DB[(PostgreSQL / Database)]
    end

    subgraph Third-Party Integrations
        SEPAY[SePay VietQR Gateway]
    end

    CB -->|HTTPS Request| MW
    AB -->|HTTPS Request /quan-tri| MW

    MW -->|Locale routing /vi, /en| RSC
    MW -->|Bypass intl for /quan-tri & /dat-ve/sepay| RCC

    RSC -->|Internal HTTP / API_INTERNAL_URL| BE_API
    RCC -->|Browser Fetch / NEXT_PUBLIC_API_URL| API_LAYER

    API_LAYER -->|REST API Requests| BE_API
    BE_API -->|SQL Queries| DB

    CB -->|Redirect VietQR Payment| SEPAY
    SEPAY -->|Webhook Notification| BE_API
    RCC -->|Real-time Polling Payment Status| BE_API
```

---

## 2. Dynamic Locale Resolution & Middleware Pattern

Next.js Middleware (`src/middleware.js`) đóng vai trò điều hướng giao lộ cho ứng dụng:

```mermaid
flowchart LR
    A[Incoming Request Path] --> B{Path Check}
    B -->|Is /quan-tri, /api, /_next, /dat-ve/sepay| C[Bypass next-intl Middleware]
    B -->|Is Client Route /dat-ve, /tim-kiem, etc.| D[Process next-intl Routing]
    
    C --> E[NextResponse.next]
    D --> F[Inject Header: x-app-locale]
    F --> G[Render App Layout with server-side <html lang>]
```

### Điểm đặc biệt trong thiết kế Header Injection:
Do `src/app/layout.jsx` nằm ở cấp độ gốc (shared layout giữa `/quan-tri` unprefixed và `[locale]` client portal), nó không thể trực tiếp đọc tham số `params.locale`. 
Middleware tự động phân tích segment ngôn ngữ đầu tiên và đưa vào request header `x-app-locale`. Component Root Layout đọc header này qua `next/headers` để render thẻ `<html lang="vi">` hoặc `<html lang="en">` chuẩn SEO hoàn toàn ở Server-Side.

---

## 3. End-to-End Booking & Payment Flow (SePay VietQR)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant FE as Next.js Frontend
    participant BE as FastAPI Backend
    participant SP as SePay Payment Gateway

    Customer->>FE: Chọn chuyến xe, vị trí ghế & nhập thông tin
    FE->>BE: POST /api/v1/client/bookings (Tạo vé giữ chỗ)
    BE-->>FE: Trả về mã vé (VD: KING123456) & số tiền
    FE->>Customer: Hiển thị Mã QR VietQR SePay kèm Cú pháp chuyển khoản
    Customer->>SP: Quét mã QR & chuyển khoản qua App Ngân hàng
    SP->>BE: Webhook thông báo giao dịch thành công (Mã: KING123456)
    BE->>BE: Cập nhật trạng thái vé -> PAID (Đã thanh toán)
    loop Polling Status Check (mỗi 3 giây)
        FE->>BE: GET /api/v1/client/bookings/status/KING123456
        BE-->>FE: Trạng thái: PAID
    end
    FE->>Customer: Chuyển hướng sang màn hình Đặt vé thành công (Booking Success Page)
```

---

## 4. Environment Variables Resolution Matrix

Ứng dụng hỗ trợ môi trường kép (Dual-Environment) cho việc kết nối API:

| Môi trường | Biến môi trường | Mục đích |
|---|---|---|
| **Browser (Client-side)** | `NEXT_PUBLIC_API_URL` | URL công khai của Backend API (VD: `https://api.kingexpressbus.com` hoặc `http://localhost:8000`), được nhúng vào bundle JS khi build. |
| **Server (SSR / RSC)** | `API_INTERNAL_URL` | URL mạng nội bộ (VD: `http://api:8000` trong Docker network). Giúp Server Next.js gọi trực tiếp sang FastAPI mà không cần đi vòng qua Internet public IP. |
