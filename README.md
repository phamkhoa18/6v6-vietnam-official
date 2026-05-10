# 6v6 Vietnam Official ⚽

Nền tảng tổ chức và quản lý giải đấu eFootball 6v6 chuyên nghiệp tại Việt Nam.

## 📸 Preview

> Trang chủ với Hero Section, Stats, Features, Tournaments Showcase, News và CTA.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (new-york style) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Font** | SF Pro Display (custom @font-face, 9 weights) |
| **Database** | MongoDB ([Mongoose](https://mongoosejs.com/) 9.x) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Toast** | [Sonner](https://sonner.emilkowal.dev/) |
| **Rich Text** | [TipTap](https://tiptap.dev/) Editor |
| **Utilities** | clsx, tailwind-merge, class-variance-authority, date-fns |

## 📁 Cấu trúc dự án

```
6v6-vietnam-official/
├── app/
│   ├── (admin)/            # Admin routes
│   ├── (auth)/             # Auth routes (đăng nhập, đăng ký)
│   ├── (main)/             # Public routes (Navbar + Footer)
│   │   ├── layout.tsx      # Main layout
│   │   └── page.tsx        # Homepage
│   ├── globals.css         # Global styles + design system
│   └── layout.tsx          # Root layout (SEO, GA, Pixel)
├── components/
│   ├── ui/                 # shadcn/ui components (21 components)
│   ├── sections/           # Homepage sections
│   │   ├── HeroSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TournamentsShowcase.tsx
│   │   ├── NewsShowcase.tsx
│   │   └── CTASection.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── hooks/                  # Custom React hooks
├── lib/
│   ├── utils.ts            # cn() helper
│   ├── mongodb.ts          # MongoDB connection
│   └── auth.ts             # JWT auth utilities
├── models/
│   ├── User.ts             # User model
│   └── Counter.ts          # Auto-increment counter
└── public/
    └── assets/
        └── fonts/          # SF Pro Display font files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local hoặc Atlas)
- **npm** >= 9

### 1. Clone repository

```bash
git clone https://github.com/your-org/6v6-vietnam-official.git
cd 6v6-vietnam-official
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Tạo file `.env.local` tại root:

```env
MONGODB_URI=mongodb://localhost:27017/6v6vietnam
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
# NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXX
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 5. Build production

```bash
npm run build
npm start
```

## 🎨 Design System

### Brand Colors

| Color | Hex | Usage |
|---|---|---|
| **Primary Blue** | `#0A3D91` | Primary buttons, links, accents |
| **Yellow** | `#FFFF00` | CTA buttons, highlights |
| **Dark** | `#111827` | Text, backgrounds |
| **Blue Light** | `#1A5DC7` | Hover states |
| **Green** | `#10B981` | Success states |
| **Red** | `#EF4444` | Error, destructive actions |

### Typography

- **Font Family**: SF Pro Display (9 weights: 100–900)
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

### CSS Utilities

```css
.text-gradient          /* Blue gradient text */
.text-gradient-warm     /* Warm gradient text */
.text-gradient-cool     /* Cool gradient text */
.glass                  /* Glassmorphism effect */
.hover-lift             /* Lift on hover */
.hover-scale            /* Scale on hover */
.card-white             /* White card with shadow */
.animate-float          /* Floating animation */
.animate-pulse-glow     /* Pulse glow animation */
```

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔐 Authentication

- JWT-based authentication
- Role-based access: `admin`, `manager`, `user`
- Email verification flow
- Password reset via email
- Token stored in localStorage (`6v6_token`)

## 📄 License

Private — All rights reserved © 2026 6v6 Vietnam Official.
