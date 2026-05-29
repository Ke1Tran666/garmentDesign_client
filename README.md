# 🧵 Garment Design Client — HoaTran

Ứng dụng web hiện đại, responsive phục vụ quảng bá dịch vụ thiết kế may mặc và quản lý khách hàng.

Modern and responsive web application for garment design service promotion and customer management.

🌐 Demo: https://ke1tran666.github.io/Garment-design-landingPage/

---

## 📖 Giới thiệu | Introduction

### 🇻🇳 Tiếng Việt

**HoaTran Garment Design Client** là ứng dụng Frontend thuộc hệ sinh thái Garment Design.

Dự án được xây dựng nhằm:

- Quảng bá thương hiệu HoaTran
- Giới thiệu các dịch vụ:
  - In sơ đồ
  - In rập
  - Thiết kế rập
  - Tính định mức

- Trưng bày các sản phẩm đã hoàn thiện
- Quản lý thông tin khách hàng
- Theo dõi đơn hàng
- Hỗ trợ xác thực người dùng

Ứng dụng được phát triển theo định hướng kết hợp giữa:

- Landing Page
- Service Management Platform
- Customer Portal

### 🇺🇸 English

**HoaTran Garment Design Client** is the frontend application of the Garment Design ecosystem.

The project is designed to:

- Promote the HoaTran brand
- Showcase garment-related services:
  - Marker Printing
  - Pattern Printing
  - Pattern Design
  - Fabric Consumption Calculation

- Display completed projects and portfolios
- Manage customer information
- Track service orders
- Support user authentication

The application combines:

- Landing Page
- Service Management Platform
- Customer Portal

---

## 🚀 Tính năng | Features

| 🇻🇳 Tiếng Việt                       | 🇺🇸 English                 |
| ----------------------------------- | -------------------------- |
| Đăng ký tài khoản                   | User Registration          |
| Đăng nhập hệ thống                  | User Login                 |
| Đăng nhập Google                    | Google Authentication      |
| Quên mật khẩu bằng OTP              | OTP Password Recovery      |
| Landing Page giới thiệu thương hiệu | Brand Landing Page         |
| Danh sách dịch vụ may mặc           | Garment Service Showcase   |
| Portfolio sản phẩm đã hoàn thiện    | Product Portfolio          |
| Hệ thống thông báo toàn cục         | Global Notification System |
| Responsive trên mọi thiết bị        | Fully Responsive Design    |
| Điều hướng bằng React Router        | React Router Navigation    |
| Hiệu ứng Scroll Reveal              | Scroll Reveal Animations   |

---

## 🛠 Tech Stack

| Technology       | Version | Description           |
| ---------------- | ------- | --------------------- |
| React            | ^19.x   | UI Library            |
| React DOM        | ^19.x   | DOM Renderer          |
| React Router DOM | ^7.x    | Client-side Routing   |
| Vite             | ^8.x    | Build Tool            |
| Tailwind CSS     | ^4.x    | Utility-first CSS     |
| Axios            | Latest  | HTTP Client           |
| Lucide React     | Latest  | Icon Library          |
| React Icons      | Latest  | Additional Icons      |
| Google OAuth     | Latest  | Google Authentication |

### Development Tools

- ESLint
- Vite Plugin React
- React Refresh
- Type Definitions

### Design System

| Item           | Value            |
| -------------- | ---------------- |
| Font (Body)    | Sora             |
| Font (Heading) | DM Serif Display |
| Brand Color    | #0192f5          |

---

## 🔐 Authentication Features

### 🇻🇳 Tiếng Việt

Hệ thống xác thực hiện hỗ trợ:

- Đăng ký tài khoản
- Đăng nhập Email & Password
- Đăng nhập Google
- Quên mật khẩu bằng OTP
- Bảo vệ Route người dùng
- Quản lý trạng thái xác thực

### 🇺🇸 English

Current authentication features:

- User Registration
- Email & Password Login
- Google Login
- OTP Password Recovery
- Protected Routes
- Authentication State Management

---

## ⚙️ Bắt đầu nhanh | Getting Started

### Requirements

- Node.js 14+
- npm hoặc yarn

### Installation

```bash
git clone https://github.com/Ke1Tran666/garmentDesign_client.git

cd garmentDesign_client

yarn install
```

### Development

```bash
yarn dev
```

Application runs at:

```text
http://localhost:5173
```

### Production Build

```bash
yarn build
```

### Preview Build

```bash
yarn preview
```

### Lint

```bash
yarn lint
```

---

## 📂 Cấu trúc dự án | Project Structure

```text
src
│
├── assets
│
├── components
│   ├── common
│   │   └── Logo
│   │
│   ├── layout
│   │   └── AuthBackground
│   │
│   └── ui
│       ├── Button
│       ├── Notification
│       └── FloatingButtons
│
├── css
│
├── hooks
│
├── layouts
│   └── MainLayout
│
├── pages
│   ├── Auth
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   └── ForgotPasswordPage
│   │
│   └── Home
│
├── services
│
├── routes
│
├── App.jsx
└── main.jsx
```

---

## 🌱 Git Workflow

```bash
git checkout -b feature/auth
```

```bash
git add .
git commit -m "feat(auth): complete authentication module"
git push origin feature/auth
```

Sau khi hoàn thành:

```text
Create Pull Request
feature/auth → main
```

---

## 📌 Roadmap

### ✅ Completed

- Landing Page
- Responsive Layout
- Notification System
- Login Page
- Register Page
- Forgot Password
- Google Authentication
- Authentication UI Components

### 🚧 In Progress

- User Profile
- Service Details
- Order Tracking
- Customer Dashboard

### 🔮 Future Plans

- Dark Mode
- Multi-language Support
- Payment Integration
- Real-time Notifications
- Admin Dashboard
- Analytics & Reports

---

## 🤝 Đóng góp | Contributing

1. Tạo feature branch

```bash
git checkout -b feature/your-feature
```

2. Thực hiện thay đổi

3. Kiểm tra code

```bash
yarn lint
```

4. Tạo Pull Request

---

## 👨‍💻 Tác giả | Author

### Trần Hữu Hùng (Kei Tran)

- Frontend Developer
- Java Backend Developer
- UI/UX Enthusiast

GitHub:
https://github.com/Ke1Tran666

Portfolio:
https://ke1tran666.github.io/portfolio/

---

## 📄 Giấy phép | License

### 🇻🇳 Tiếng Việt

Dự án hiện đang ở chế độ Private và được phát triển cho mục đích học tập, nghiên cứu và xây dựng portfolio.

### 🇺🇸 English

This project is currently private and developed for educational, research, and portfolio purposes.

---

## 📬 Hỗ trợ | Support

Nếu bạn có câu hỏi hoặc đề xuất, vui lòng liên hệ tác giả dự án.

If you have any questions or suggestions, please feel free to contact the project author.
