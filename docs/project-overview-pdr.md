# Project Overview & Product Development Requirements (PDR)

## 1. Executive Summary

**King Express Bus Frontend** (`kingexpressbus-fe-nextjs`) là ứng dụng web hiện đại được phát triển dựa trên **Next.js 15.5 (App Router)** và **React 19**, đóng vai trò giao diện chính tương tác với khách hàng (Public Booking Portal) và cổng điều hành (Admin Portal) cho hệ thống vận tải xe khách **King Express Bus**.

Ứng dụng đáp ứng các yêu cầu nghiệp vụ cốt lõi:
- Tìm kiếm chuyến xe, lựa chọn sơ đồ ghế động, điểm đón/trả, phụ phí và thực hiện đặt vé xe khách.
- Đặt phòng khách sạn và dịch vụ tour du lịch liên kết.
- Tích hợp cổng thanh toán trực tuyến SePay (VietQR) tự động gạch nợ và xác nhận đơn hàng theo thời gian thực.
- Hỗ trợ đa ngôn ngữ hoàn chỉnh (Tiếng Việt & Tiếng Anh) qua `next-intl`.
- Quản trị toàn bộ hệ thống (Quản lý tuyến đường, chuyến xe, loại xe, đơn đặt vé, khách sạn, tour, bài viết CMS, cấu hình hệ thống).

---

## 2. Core Business Modules & Requirements

### 2.1. Public Client Portal (`src/app/(client)/[locale]`)

#### A. Tìm kiếm & Đặt vé Xe khách (`/tim-kiem`, `/dat-ve`)
- **Bộ lọc tìm kiếm**: Điểm đi, điểm đến, ngày khởi hành, ngày về (khứ hồi), số lượng hành khách.
- **Chi tiết chuyến xe**: Hiển thị giờ chạy, thời gian di chuyển, loại xe (Sleeper/Cabin/Seater), giá vé, vị trí đón/trả khả dụng.
- **Sơ đồ chọn ghế động**: Hiển thị tầng dưới/tầng trên (nếu là xe giường nằm), màu trạng thái ghế (Đã đặt / Đang giữ / Còn trống).
- **Quy trình Thanh toán**:
  1. Nhập thông tin hành khách (Họ tên, SĐT, Email, Ghi chú đón trả).
  2. Chọn phương thức thanh toán (Chuyển khoản VietQR SePay, Thanh toán tại văn phòng).
  3. Tạo đơn hàng và chuyển hướng tới trang thanh toán VietQR mã hóa mã đơn hàng.
  4. Nhận phản hồi kết quả tức thì (Realtime/Polling status check) khi người dùng hoàn tất chuyển khoản.

#### B. Đặt phòng Khách sạn (`/khach-san`, `/khach-san/[slug]`)
- Tra cứu danh sách khách sạn theo địa điểm, hạng sao, mức giá.
- Xem chi tiết hạng phòng, tiện ích, hình ảnh slider và đặt phòng trực tuyến.

#### C. Đặt Tour Du lịch (`/tour`, `/tour/[slug]`)
- Danh sách tour theo chủ đề, lịch trình chi tiết, điểm nổi bật.
- Form đăng ký đặt tour kèm số lượng người lớn/trẻ em và ngày khởi hành.

#### D. CMS & Trang thông tin (`/trang/[slug]`, `/gioi-thieu`, `/lien-he`)
- Hiển thị bài viết động từ backend (Chính sách hủy vé, Điều khoản dịch vụ, Hướng dẫn đặt vé).
- Hỗ trợ định dạng bài viết chuẩn HTML/Rich Text từ Tiptap Editor.

#### E. Tài khoản Khách hàng (`/tai-khoan`, `/dang-nhap`, `/dang-ky`)
- Đăng ký / Đăng nhập tài khoản bằng Email & Mật khẩu.
- Lịch sử đặt vé, trạng thái đơn hàng (Đã xác nhận, Chờ thanh toán, Đã hủy).
- Đổi mật khẩu & cập nhật thông tin cá nhân.

---

### 2.2. Admin Management Portal (`src/app/(admin)/quan-tri`)

Dashboard quản trị dành cho bộ phận điều hành & quản lý với phân quyền riêng biệt:

#### A. Quản lý Chuyến xe & Tuyến đường
- **Tuyến đường (`/quan-tri/tuyen-duong`)**: Tạo mới, chỉnh sửa điểm đầu/cuối, thứ tự hiển thị, khoảng cách, thời gian dự kiến.
- **Chuyến xe (`/quan-tri/chuyen-xe`)**: Lập lịch chuyến chạy theo ngày/giờ, gán xe, cài đặt giá vé cơ bản & phụ phí.
- **Đội xe (`/quan-tri/xe`)**: Quản lý thông tin xe, biển số, số lượng ghế, sơ đồ cấu hình ghế (Seat Layout JSON).

#### B. Quản lý Đặt vé & Đơn hàng
- **Vé xe (`/quan-tri/dat-ve`)**: Tìm kiếm theo mã đặt vé, SĐT khách hàng, lọc theo chuyến/ngày, hủy vé, chuyển ghế, cập nhật trạng thái thanh toán thủ công.
- **Đặt phòng & Đặt tour (`/quan-tri/dat-phong`, `/quan-tri/dat-tour`)**: Tiếp nhận và xử lý đơn đặt phòng khách sạn & tour.

#### C. Quản lý Khách sạn & Tour Du lịch
- Quản lý danh mục khách sạn, loại phòng, hình ảnh, giá niêm yết.
- Quản lý tour, lịch trình chi tiết, mức giá theo độ tuổi.

#### D. Cấu hình Website & Nội dung
- **Cấu hình chung (`/quan-tri/cau-hinh-website`)**: Hotline, Email, Banner, Slogan, địa chỉ văn phòng, Script tracking.
- **Phụ phí (`/quan-tri/phu-phi`)**: Định nghĩa các khoản phụ phí đón/trả tận nơi, ngày lễ/Tết.
- **Địa điểm (`/quan-tri/dia-diem`)**: Danh mục các tỉnh/thành phố và điểm đón trả cố định.

---

## 3. Non-Functional Requirements (NFR)

1. **Hiệu năng & Tốc độ tải trang**:
   - Sử dụng Next.js SSR (Server-Side Rendering) cho các trang public để tối ưu SEO & LCP (Largest Contentful Paint).
   - Tối ưu assets với Next.js Image Optimization và Turbopack build engine.
2. **Bảo mật**:
   - Authentication dựa trên HttpOnly Cookies / Bearer Token đối với Admin API (`credentials: "include"`).
   - Middleware lọc truy cập tuyến `/quan-tri` khi chưa đăng nhập.
3. **Chuẩn hóa i18n**:
   - Tất cả text hiển thị ở Public Portal bắt buộc phải khai báo qua file ngôn ngữ `src/messages/vi.json` và `src/messages/en.json`.
   - Đảm bảo kiểm tra đồng bộ bằng `npm run check:i18n`.
4. **Giao diện tương thích (Responsive Design)**:
   - Hoạt động mượt mà trên Mobile (375px+), Tablet (768px+) và Desktop (1280px+).
