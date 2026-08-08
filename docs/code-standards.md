# Code Standards & Engineering Best Practices

Tài liệu này quy định các quy chuẩn lập trình và nguyên tắc kiến trúc áp dụng cho dự án **kingexpressbus-fe-nextjs**.

---

## 1. Code Formatting & Naming Conventions

### 1.1. Quy tắc Đặt tên File & Thư mục
- **Thư mục Router (`src/app`)**:
  - Tên thư mục route sử dụng **kebab-case** không dấu cho đường dẫn tiếng Việt (ví dụ: `chuyen-xe`, `dat-ve`, `quan-tri`, `tuyen-duong`).
  - Sử dụng dấu ngoặc đơn `()` cho route groups không ảnh hưởng URL: `(admin)`, `(client)`.
  - Sử dụng dấu ngoặc vuông `[]` cho dynamic parameters: `[locale]`, `[slug]`.
- **Thư mục Code (`src/components`, `src/views`, `src/services`, `src/utils`)**:
  - Tên file Javascript/React component: **kebab-case** (ví dụ: `admin-api.js`, `booking-page.jsx`, `seat-picker.jsx`).
  - Hook custom: Tiền tố `use-` + **kebab-case** (ví dụ: `use-admin-list.js`).

### 1.2. Import Ordering
Sắp xếp thứ tự import trong file theo chuẩn sau:
1. React & Framework Core imports (`react`, `next/link`, `next/navigation`, `next-intl`).
2. Thư viện bên thứ 3 (`@tanstack/react-query`, `lucide-react`, `zod`).
3. Internal Services & Utilities (`@/services/api-base`, `@/utils/cn`).
4. Components & Views (`@/components/ui/button`, `@/views/admin/dashboard`).
5. Styles & Assets (`import "./admin.css"`).

---

## 2. Component Design & State Management

### 2.1. Phân biệt Server & Client Components
- Mặc định các file trong `src/app` là **Server Components**.
- Thêm khai báo `"use client";` ở đầu file khi component cần:
  - Sử dụng React state / hooks (`useState`, `useEffect`, `useQuery`).
  - Lắng nghe event người dùng (`onClick`, `onChange`, `onSubmit`).
  - Sử dụng các thư viện giao diện phía client (`@dnd-kit`, `@tiptap/react`).

### 2.2. Quản lý Server State với TanStack Query
- Toàn bộ thao tác lấy dữ liệu động từ API (List chuyến xe, Chi tiết vé, Đơn đặt hàng) phải thông qua **React Query** (`useQuery`, `useMutation`).
- Đặt `queryKey` theo cấu trúc phân cấp mảng rõ ràng:
  ```javascript
  // Ví dụ query key chuẩn
  useQuery({
    queryKey: ["admin", "trips", { page, page_size, q }],
    queryFn: () => fetchPaginated("/admin/trips", { page, page_size, q })
  });
  ```
- Sau khi thực hiện hành động sửa/xóa/tạo mới (`useMutation`), bắt buộc gọi `queryClient.invalidateQueries({ queryKey: [...] })` để refresh dữ liệu tươi mới.

---

## 3. Form Handling & Data Validation

- Tất cả Form nhập liệu (Đăng ký, Đặt vé, Cấu hìnhAdmin) bắt buộc kết hợp **React Hook Form** và **Zod schema**:
  ```javascript
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";

  const bookingSchema = z.object({
    fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
    phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ"),
  });
  ```
- Không tự viết logic validate thủ công bằng `if/else` rối rắm trong handler submit.

---

## 4. Multi-language (i18n) Rules

1. **Không hardcode string hiển thị**:
   - Tất cả nhãn, văn bản, thông báo lỗi phía Client Portal phải gọi qua `useTranslations()` từ `next-intl`.
2. **Đồng bộ Key giữa các ngôn ngữ**:
   - Trước khi commit code, bắt buộc chạy lệnh:
     ```bash
     npm run check:i18n
     ```
   - Lệnh này sẽ quét và thông báo nếu có key tồn tại ở `vi.json` nhưng thiếu ở `en.json` (hoặc ngược lại).

---

## 5. Error Handling & API Contracts

- **Xử lý lỗi API chuẩn**:
  - Không nuốt lỗi silently (`try { ... } catch {}` rỗng).
  - Sử dụng hàm tiện ích `getErrorMessage(err, fallbackMessage)` từ `@/services/admin-api` để trích xuất thông điệp lỗi chính xác do FastAPI Backend trả về (`detail` payload).
- **Toast Notifications**:
  - Sử dụng `sonner` để hiển thị thông báo thành công hoặc thất bại (`toast.success()`, `toast.error()`).
