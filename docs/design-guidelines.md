# UI/UX & Design Guidelines

Tài liệu này tổng hợp các tiêu chuẩn thiết kế giao diện (Design System), typography, bảng màu và quy tắc thiết kế thành phần áp dụng cho dự án **King Express Bus Frontend**.

---

## 1. Typography & Web Fonts

Hệ thống sử dụng kết hợp 2 bộ font hiện đại hỗ trợ đầy đủ bộ ký tự Tiếng Việt (Vietnamese Subsets):

| Bộ Font | Loại / Mục đích | Package NPM |
|---|---|---|
| **Be Vietnam Pro** | Heading, Tiêu đề chính, Banner, Nút bấm nổi bật | `@fontsource/be-vietnam-pro` |
| **Manrope** | Body text, Mô tả chuyến xe, Bảng dữ liệu Admin, Form inputs | `@fontsource/manrope` |

### Quy tắc sử dụng Typography trong Tailwind:
- `font-sans`: Áp dụng font Manrope cho văn bản thông thường.
- `font-heading`: Áp dụng Be Vietnam Pro cho các tiêu đề `<h1>` - `<h4>`.

---

## 2. Color Palette & Dark/Light Themes

Hệ thống màu sắc thể hiện sự tin cậy, hiện đại và sang trọng của thương hiệu xe khách **King Express**:

### 2.1. Brand Colors (Màu thương hiệu)
- **Primary Red / Crimson (Chủ đạo)**: `#D9232D` / `hsl(356, 72%, 49%)`
  - Đại diện cho sự năng động, nổi bật và nhận diện thương hiệu King Express.
  - Sử dụng cho: Header CTA buttons, Mã QR thanh toán, Badge trạng thái quan trọng.
- **Secondary Navy / Slate (Phụ)**: `#1E293B` / `hsl(215, 28%, 17%)`
  - Đem lại sự chuyên nghiệp, chắc chắn.
  - Sử dụng cho: Footer, Navbar Admin, Text tiêu đề.
- **Accent Gold / Yellow (Nhấn)**: `#F59E0B`
  - Sử dụng cho: Đánh giá sao khách sạn/tour, badge vé khuyến mãi, trạng thái ghế chờ đặt.

### 2.2. Functional Status Colors (Màu trạng thái)
- **Success (Thành công / Ghế còn trống)**: `#10B981` (Emerald 500)
- **Warning (Cảnh báo / Ghế giữ chỗ)**: `#F59E0B` (Amber 500)
- **Danger (Đã đặt / Đã hủy / Hết vé)**: `#EF4444` (Red 500)
- **Info (Thông tin / Ghi chú)**: `#3B82F6` (Blue 500)

---

## 3. Visual Identity Difference: Admin vs Client

### 3.1. Public Client Portal (`/vi`, `/en`)
- **Phong cách**: Hiện đại, thân thiện, hình ảnh xe khách & điểm đến chất lượng cao, bo tròn mềm mại (`rounded-xl` / `rounded-2xl`).
- **Tương tác**: Visual hover effects (`transition-all duration-300 hover:-translate-y-1`), hiệu ứng shadow nhẹ nhàng (`shadow-sm hover:shadow-lg`).
- **Giao diện đặt vé (Seat Picker)**:
  - Ghế trống: Viền xanh lá, nền trắng/nhạt, cho phép nhấp chọn.
  - Ghế đang chọn: Nền đỏ Crimson thương hiệu, icon checkmark.
  - Ghế đã bán: Nền xám nhạt, icon khóa/gạch chéo, disabled click.

### 3.2. Admin Management Portal (`/quan-tri`)
- **Phong cách**: Tối giản, cô đọng, tối ưu không gian hiển thị thông tin dạng Bảng (Data Tables).
- **Màu chủ đạo Admin**: Background xám trung tính (`bg-slate-50`), Sidebar tối màu (`bg-slate-900` hoặc `bg-zinc-900`).
- **Hành động (Actions)**: Đơn giản, rõ ràng (Icon Edit `Pencil`, Icon Delete `Trash2` màu đỏ nhạt, Status badge nhỏ gọn).

---

## 4. Layout Breakpoints & Responsiveness

Đảm bảo phản hồi hoàn hảo trên mọi kích thước màn hình theo chuẩn Tailwind CSS v4:

- **Mobile (`< 640px`)**:
  - Navbar chuyển sang dạng Drawer / Hamburger menu.
  - Sơ đồ ghế tự động xếp dọc (Stacking tầng 1 và tầng 2).
  - Bảng Admin cho phép cuộn ngang (`overflow-x-auto`).
- **Tablet (`640px - 1024px`)**:
  - Grid 2 cột cho danh sách chuyến xe và phòng khách sạn.
- **Desktop (`>= 1024px`)**:
  - Giao diện full màn hình với Sidebar Admin cố định.
  - Grid 3-4 cột cho danh sách chuyến xe và tour.
