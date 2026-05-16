# 🧵 Garment Design Client — HoaTran

Ứng dụng web hiện đại, responsive phục vụ quảng bá dịch vụ thiết kế may mặc và quản lý khách hàng. Xây dựng bằng React, Vite và Tailwind CSS.

## Giới thiệu

**HoaTran Garment Design Client** là ứng dụng frontend trong lĩnh vực may mặc, mang tính chất nửa landing page — nửa thương mại điện tử. Ứng dụng được xây dựng để:

- Quảng bá thương hiệu và giới thiệu các dịch vụ: **In sơ đồ**, **In rập**, **Thiết kế**, **Tính định mức**
- Trưng bày các sản phẩm, công trình may mặc đã hoàn thiện
- Quản lý thông tin khách hàng và theo dõi đơn hàng

> 🌐 Demo: [https://ke1tran666.github.io/Garment-design-landingPage/](https://ke1tran666.github.io/Garment-design-landingPage/)

---

## Tech Stack

| Công nghệ            | Phiên bản | Mô tả                              |
| -------------------- | --------- | ---------------------------------- |
| **React**            | ^19.2.5   | UI library cho giao diện tương tác |
| **React DOM**        | ^19.2.5   | DOM renderer cho React             |
| **React Router DOM** | ^7.15.0   | Điều hướng phía client             |
| **Vite**             | ^8.0.10   | Build tool & dev server tốc độ cao |
| **Tailwind CSS**     | ^4.2.4    | Utility-first CSS framework        |
| **Lucide React**     | ^1.14.0   | Thư viện icon SVG nhất quán        |
| **React Icons**      | ^5.6.0    | Bộ icon tổng hợp đa dạng           |

**Dev Dependencies:** `@vitejs/plugin-react` · `eslint` · `eslint-plugin-react-hooks` · `eslint-plugin-react-refresh` · `@types/react` · `@types/react-dom`

> **Font:** `Sora` (body) · `DM Serif Display` (heading) · **Brand color:** `#0192f5`

---

## Bắt đầu nhanh

### Yêu cầu hệ thống

- Node.js v14 trở lên
- npm hoặc yarn

### Cài đặt

```bash
git clone https://github.com/Ke1Tran666/garmentDesign_client.git
cd garmentDesign_client
```

```bash
npm install
# hoặc
yarn install
```

### Phát triển

Khởi động dev server với Hot Module Replacement:

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đang bận).

### Build production

```bash
npm run build
# hoặc
yarn build
```

File build xuất ra thư mục `dist/`.

### Preview bản build

```bash
npm run preview
# hoặc
yarn preview
```

### Lint

```bash
npm run lint
# hoặc
yarn lint
```

---

## Cấu trúc dự án

```
src/
  ├── App.jsx                         # Component gốc, khai báo routes
  ├── App.css                         # Style riêng của App
  ├── main.jsx                        # Entry point
  ├── index.css                       # Global styles
  │
  ├── components/                     # UI components dùng chung
  │   └── ui/
  │       ├── Button.jsx              # Button component tái sử dụng
  │       └── Notification/
  │           ├── Notification.jsx        # Component hiển thị thông báo
  │           └── NotificationContext.jsx # Context quản lý trạng thái thông báo
  │
  ├── css/                            # File CSS theo chức năng
  │   ├── components.css              # Style cho các components
  │   ├── notification.css            # Style cho Notification
  │   └── reset.css                   # CSS reset baseline
  │
  ├── hooks/
  │   └── useReveal.jsx               # Custom hook scroll reveal animation
  │
  ├── layouts/                        # Layout wrappers
  │   ├── AuthLayout/                 # Layout cho trang xác thực
  │   └── MainLayout/
  │       ├── Footer.jsx              # Footer toàn cục
  │       └── Navigation.jsx          # Thanh điều hướng chính
  │
  ├── pages/
  │   └── Home.jsx                    # Trang chủ
  │
  └── sections/                       # Các section trong trang chủ
      ├── ContactSection.jsx          # Section liên hệ
      ├── ProcessSection.jsx          # Section quy trình làm việc
      ├── ProductsSection.jsx         # Section sản phẩm / portfolio
      ├── ServicesSection.jsx         # Section dịch vụ
      └── TestimonialsSection.jsx     # Section đánh giá khách hàng
```

---

## Tính năng

- Giao diện hiện đại, responsive trên mọi thiết bị
- Landing page giới thiệu thương hiệu & dịch vụ may mặc
- Section portfolio hiển thị sản phẩm đã hoàn thiện
- Section quy trình làm việc trực quan
- Section đánh giá từ khách hàng
- Scroll reveal animation qua custom hook `useReveal`
- Hệ thống thông báo toàn cục qua React Context
- Điều hướng đa trang với React Router DOM v7
- Tốc độ phát triển cao nhờ Vite HMR
- Code sạch, chuẩn hoá bằng ESLint

---

## Đóng góp

1. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
2. Thực hiện thay đổi
3. Kiểm tra code: `npm run lint`
4. Mở Pull Request

---

## Tác giả

**Trần Hữu Hùng**

- Chuyên ngành: Phát triển phần mềm
- Trường: FPT Polytechnic

---

## Giấy phép

Dự án này là private. Mọi quyền được bảo lưu.

---

## Hỗ trợ

Nếu có vấn đề, câu hỏi hoặc đề xuất, vui lòng liên hệ đội phát triển.
