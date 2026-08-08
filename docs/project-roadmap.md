# Project Roadmap & Phase Status

Tài liệu này theo dõi các giai đoạn phát triển, lịch sử nâng cấp và lộ trình hoàn thiện hệ thống **King Express Bus Frontend**.

---

## 1. Completed Phases & Milestones

### Phase 1: Nền tảng & Cấu trúc Khung (Core Foundation)
- [x] Khởi tạo dự án Next.js 15 App Router với Turbopack engine và React 19.
- [x] Thiết lập hệ thống UI với Tailwind CSS v4, Radix UI và Lucide Icons.
- [x] Cấu hình engine đa ngôn ngữ `next-intl` (`vi`, `en`) kèm middleware tự động inject `x-app-locale`.
- [x] Xây dựng service layer tập trung (`src/services/api-base.js`) hỗ trợ phân giải SSR/CSR API URL (`API_INTERNAL_URL` & `NEXT_PUBLIC_API_URL`).

### Phase 2: Public Booking Portal (Giao diện Khách hàng)
- [x] Trang chủ năng động với bộ tìm kiếm chuyến xe (Điểm đi, điểm đến, ngày đi/về).
- [x] Màn hình kết quả tìm kiếm kèm bộ lọc chi tiết (Giờ chạy, nhà xe, mức giá).
- [x] Sơ đồ chọn ghế động tương tác (Tầng trên / Tầng dưới, vị trí ghế).
- [x] Quy trình nhập thông tin hành khách & điểm đón trả.
- [x] Tích hợp thanh toán trực tiếp qua SePay VietQR (Mã hóa cú pháp tự động & trang trạng thái kết quả).

### Phase 3: Hệ thống Mở rộng (Khách sạn & Tour Du lịch)
- [x] Danh sách & chi tiết khách sạn liên kết (`/khach-san/[slug]`).
- [x] Form đặt phòng khách sạn trực tuyến & xác nhận đơn.
- [x] Danh sách & chi tiết tour du lịch (`/tour/[slug]`).
- [x] Form đăng ký tour du lịch theo độ tuổi & số lượng người.

### Phase 4: Quản trị Hệ thống (Admin Management Portal)
- [x] Trang đăng nhập Admin bảo mật với HttpOnly Session Cookies.
- [x] Admin Dashboard tổng quan thống kê doanh thu & đơn hàng.
- [x] Quản lý CRUD Tuyến đường (`/quan-tri/tuyen-duong`), Phụ phí (`/quan-tri/phu-phi`), Địa điểm (`/quan-tri/dia-diem`).
- [x] Quản lý Đội xe & Sơ đồ ghế (`/quan-tri/xe`), Lập lịch Chuyến xe (`/quan-tri/chuyen-xe`).
- [x] Quản lý Đơn đặt vé (`/quan-tri/dat-ve`), Đặt phòng (`/quan-tri/dat-phong`), Đặt tour (`/quan-tri/dat-tour`).
- [x] Tích hợp Tiptap Rich Text Editor cho quản trị nội dung bài viết CMS & Cấu hình Website (`/quan-tri/cau-hinh-website`).

### Phase 5: QA & Critical Bugs Resolution
- [x] Kiểm tra và xử lý lỗi i18n hydration mismatch giữa Server và Client.
- [x] Đồng bộ parity key giữa `vi.json` và `en.json` qua script `check-lang-parity.mjs`.
- [x] Khắc phục lỗi Delete-guard từ Backend API đối với các đối tượng có quan hệ ràng buộc đơn hàng.

---

## 2. Upcoming Roadmap (Next Phases)

### Phase 6: Tối ưu hóa SEO & Performance Enhancement (Q3/2026)
- [ ] Bổ sung Schema.org Structured Data (`BusTrip`, `LocalBusiness`, `Hotel`) tự động cho các trang chi tiết chuyến xe và khách sạn.
- [ ] Tối ưu hóa điểm Core Web Vitals (LCP < 2.5s, CLS < 0.1).
- [ ] Cấu hình caching nâng cao cho Server Components đối với các trang ít thay đổi (Trang giới thiệu, Điều khoản dịch vụ).

### Phase 7: Mobile Web & Progressive Web App (PWA) (Q4/2026)
- [ ] Cấu hình PWA Web Manifest & Service Workers cho phép lưu thông tin vé offline trên điện thoại.
- [ ] Tích hợp Push Notifications thông báo giờ xe chạy / nhắc lịch khởi hành cho khách hàng.

### Phase 8: Tính năng Nâng cao Quản trị & Báo cáo (Q1/2027)
- [ ] Báo cáo biểu đồ doanh thu chi tiết xuất file Excel/PDF trong Admin Dashboard.
- [ ] Phân quyền tài khoản Admin theo vai trò (Super Admin, Nhân viên bán vé, Điều hành xe).
- [ ] Tích hợp chat trực tuyến (Zalo/Facebook Widget) hỗ trợ khách hàng ngay tại trang đặt vé.
