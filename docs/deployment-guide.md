# Deployment & Infrastructure Guide

Tài liệu này hướng dẫn chi tiết cách triển khai dự án **King Express Bus Frontend** trên các môi trường Docker, Vercel và hệ thống máy chủ Linux (Production Server).

---

## 1. Local Development Setup

### Lệnh chạy trực tiếp qua Node.js:
```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy server phát triển
npm run dev
```
Dev server sẽ lắng nghe tại `http://localhost:3000`.

---

## 2. Docker Deployment

Dự án cung cấp sẵn `Dockerfile` hỗ trợ **Multi-stage Build** giúp giảm thiểu tối đa dung lượng Image cuối cùng và tối ưu tốc độ khởi chạy.

### 2.1. Phân tích `Dockerfile`

- **Stage 1 (deps)**: Cài đặt node_modules.
- **Stage 2 (builder)**: Biên dịch Next.js với Turbopack (`npm run build`).
- **Stage 3 (runner)**: Tạo container siêu nhẹ chạy trên môi trường Node Alpine, chỉ giữ lại file nén standalone và static assets.

### 2.2. Triển khai môi trường Local (`docker-compose.local.yml`)

```bash
docker-compose -f docker-compose.local.yml up --build -d
```
File compose này thiết lập:
- Container name: `kingexpressbus-fe-local`
- Port mapping: `3000:3000`
- Environment:
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - `API_INTERNAL_URL=http://api:8000`

### 2.3. Triển khai môi trường Production (`docker-compose.production.yml`)

```bash
docker-compose -f docker-compose.production.yml up --build -d
```
Môi trường production bật chế độ tự động khôi phục (`restart: always`) và kết nối trực tiếp vào Docker network nội bộ chung với FastAPI backend container.

---

## 3. Triển khai trên Vercel Platform

Next.js 15 tương thích 100% với Vercel Platform:

1. Import Repository `kingexpressbus-fe-nextjs` từ GitHub / GitLab vào Vercel Project.
2. Cấu hình Framework Preset: **Next.js**.
3. Khai báo **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: URL chính thức của Backend API (VD: `https://api.kingexpressbus.com`).
4. Nhấn **Deploy**. Vercel sẽ tự động build và phân phối static assets qua CDN toàn cầu.

---

## 4. Reverse Proxy Nginx Configuration Example

Nếu triển khai trên VPS Linux (Ubuntu/Debian) đứng sau Nginx Reverse Proxy, sử dụng file cấu hình mẫu sau:

```nginx
server {
    listen 80;
    server_name kingexpressbus.com www.kingexpressbus.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Health Check & Monitoring

- Kiểm tra phản hồi HTTP status của ứng dụng:
  ```bash
  curl -I http://localhost:3000/
  ```
- Kiểm tra logs container:
  ```bash
  docker logs -f kingexpressbus-fe-local
  ```
- Kiểm tra tính đồng bộ i18n trước khi phát hành phiên bản mới:
  ```bash
  npm run check:i18n
  ```
