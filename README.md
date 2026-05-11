# 6v6 Vietnam Official

> Nền tảng quản lý giải đấu bóng đá sân 6 người hàng đầu Việt Nam.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-Private-red)

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Đóng góp](#đóng-góp)

---

## Tổng quan

**6v6 Vietnam** là nền tảng web fullstack phục vụ cộng đồng bóng đá sân 6 tại Việt Nam. Hệ thống hỗ trợ tổ chức giải đấu, quản lý đội bóng, bảng xếp hạng, tin tức, và quản trị nội dung — tất cả trong một giao diện hiện đại, tối ưu SEO.

---

## Tính năng

### 🏟️ Giải đấu
- Tạo & quản lý giải đấu (Admin + Manager)
- Đăng ký đội tham gia
- Lịch thi đấu & kết quả trận đấu
- Bảng xếp hạng theo giải

### 📰 Tin tức & Nội dung
- Trình soạn thảo Rich Text (Tiptap Editor)
- Quản lý bài viết: tạo, sửa, xóa, ghim, nổi bật
- Hệ thống danh mục bài viết
- Upload ảnh bìa, gallery, ảnh trong nội dung
- SEO meta tags, Open Graph, Structured Data

### 👥 Người dùng
- Đăng ký / Đăng nhập (JWT)
- Xác minh email (SMTP)
- Quên mật khẩu
- Phân quyền: `user` · `manager` · `admin`
- Trang cá nhân

### ⚙️ Quản trị (Admin)
- Dashboard thống kê tổng quan
- Quản lý người dùng (xem, phân quyền)
- Quản lý giải đấu
- Quản lý bài viết & danh mục
- Cài đặt website (SEO, branding, social links, SMTP)

### 🔍 SEO
- `sitemap.xml` tự động
- `robots.txt` cấu hình được
- Dynamic metadata từ SiteSettings
- Google Analytics & Facebook Pixel (tùy chọn)

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Email** | Nodemailer (SMTP) |
| **Editor** | Tiptap (Rich Text) |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |

---

## Cấu trúc dự án

```
6v6-vietnam-official/
├── app/
│   ├── (admin)/admin/          # Trang quản trị
│   │   ├── page.tsx            # Dashboard
│   │   ├── nguoi-dung/         # Quản lý user
│   │   ├── giai-dau/           # Quản lý giải đấu
│   │   ├── bai-viet/           # Quản lý bài viết
│   │   │   ├── tao-moi/        # Tạo bài viết
│   │   │   └── [id]/chinh-sua/ # Sửa bài viết
│   │   ├── cai-dat/            # Cài đặt website
│   │   └── layout.tsx          # Admin layout + sidebar
│   ├── (auth)/                 # Auth pages
│   │   ├── dang-nhap/          # Đăng nhập
│   │   ├── dang-ky/            # Đăng ký
│   │   ├── quen-mat-khau/      # Quên mật khẩu
│   │   └── xac-minh/           # Xác minh email
│   ├── (main)/                 # Public pages
│   │   ├── page.tsx            # Trang chủ
│   │   ├── giai-dau/           # Giải đấu
│   │   ├── bxh/                # Bảng xếp hạng
│   │   ├── tin-tuc/            # Tin tức
│   │   └── trang-ca-nhan/      # Profile
│   ├── (manager)/manager/      # Manager dashboard
│   ├── api/                    # API Routes
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── robots.ts               # Robots.txt
│   └── layout.tsx              # Root layout + metadata
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── admin/                  # Admin components (TiptapEditor)
│   ├── sections/               # Homepage sections
│   ├── Navbar.tsx
│   └── Footer.tsx
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── lib/
│   ├── api.ts                  # Client-side API helpers
│   ├── auth.ts                 # JWT auth utilities
│   ├── mongodb.ts              # DB connection
│   ├── email.ts                # Email sender
│   ├── site-settings.ts        # SiteSettings singleton
│   └── category-icons.tsx      # Category icon mapper
├── models/                     # Mongoose schemas
│   ├── User.ts
│   ├── Tournament.ts
│   ├── Registration.ts
│   ├── Team.ts
│   ├── Match.ts
│   ├── Post.ts
│   ├── Category.ts
│   ├── SiteSettings.ts
│   ├── RankingLog.ts
│   └── Counter.ts
└── public/
    └── images/                 # Static assets
```

---

## Cài đặt

### Yêu cầu

- **Node.js** ≥ 20
- **MongoDB** (local hoặc Atlas)
- **npm** hoặc **yarn**

### Bước 1 — Clone & cài dependencies

```bash
git clone <repository-url>
cd 6v6-vietnam-official
npm install
```

### Bước 2 — Cấu hình biến môi trường

```bash
cp .env.local.example .env.local
# Chỉnh sửa các giá trị trong .env.local
```

### Bước 3 — Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

---

## Biến môi trường

Tạo file `.env.local` tại thư mục gốc:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="6v6 Vietnam <noreply@6v6.vn>"

# Analytics (tùy chọn)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

---

## Scripts

| Lệnh | Mô tả |
|-------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra linting |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| POST | `/api/auth/verify` | Xác minh email |
| POST | `/api/auth/resend-code` | Gửi lại mã xác minh |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |

### Tournaments (`/api/tournaments`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/tournaments` | Danh sách giải đấu |
| POST | `/api/tournaments` | Tạo giải đấu |
| GET | `/api/tournaments/:id` | Chi tiết giải đấu |
| POST | `/api/tournaments/:id/matches/result` | Cập nhật kết quả |

### Posts (`/api/posts`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/posts` | Danh sách bài viết public |
| GET | `/api/posts/:slug` | Bài viết theo slug |

### Admin (`/api/admin`) — *Yêu cầu quyền admin*
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/stats` | Thống kê dashboard |
| GET | `/api/admin/users` | Danh sách người dùng |
| GET/POST | `/api/admin/content` | CRUD bài viết |
| PUT/DELETE | `/api/admin/content/:id` | Sửa/xóa bài viết |
| POST | `/api/admin/content/upload` | Upload ảnh nội dung |
| GET/POST/PUT/DELETE | `/api/admin/categories` | CRUD danh mục |
| GET/PUT | `/api/admin/settings` | Cài đặt website |
| POST | `/api/admin/settings/upload` | Upload logo/favicon |

### Khác
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/rankings` | Bảng xếp hạng |
| GET | `/api/site-settings` | Cài đặt site (public) |
| GET | `/api/manager/dashboard` | Thống kê manager |

---

## Phân quyền

| Role | Quyền |
|------|-------|
| `user` | Xem nội dung, trang cá nhân |
| `manager` | Tạo/quản lý giải đấu, đội bóng |
| `admin` | Toàn quyền: quản lý user, nội dung, cài đặt |

---

## Đóng góp

1. Fork repository
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "feat: mô tả thay đổi"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

<p align="center">
  <strong>6v6 Vietnam</strong> · Built with ❤️ by VinCode
</p>
