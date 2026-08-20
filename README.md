# 🛒 FreshMart

> A modern grocery e-commerce platform built with Next.js, React, TypeScript, Tailwind CSS, and Redux Toolkit.

FreshMart is a full-featured grocery shopping platform designed for browsing fresh fruits and vegetables, managing a shopping cart and wishlist, completing checkout, managing user profiles and addresses, tracking orders, and managing products, orders, and users through an admin dashboard.

---

## ✨ Features

### 🏪 Customer Experience

- Responsive grocery storefront
- Hero carousel and promotional banners
- Featured products
- Product categories
- Product search
- Category filtering
- Price-range filtering
- Discount filtering
- Availability filtering
- Product sorting
- Grid and list view modes
- Product detail pages
- Shopping cart
- Wishlist
- Checkout workflow
- Cash on Delivery support
- User registration
- User login/logout
- Profile management
- Address management
- Order history
- Order status tracking

### ⚙️ Admin Dashboard

- Admin dashboard
- Product management
- Add products
- Update products
- Delete products
- Order management
- Update order status
- User management
- Admin-specific navigation and layout

### 🎨 UI & UX

- Responsive design
- Reusable component architecture
- Radix UI primitives
- Tailwind CSS styling
- Loading skeletons
- Empty states
- Toast notifications
- Responsive mobile navigation
- Light/dark theme support
- Accessible UI primitives

---

## 🧱 Tech Stack

### Frontend

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4

### State Management

- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Redux](https://react-redux.org/)

### UI & Components

- [Radix UI](https://www.radix-ui.com/)
- [Lucide React](https://lucide.dev/)
- Class Variance Authority
- clsx
- tailwind-merge

### Forms & Validation

- React Hook Form
- Zod
- @hookform/resolvers

### Additional Libraries

- Recharts
- Embla Carousel
- Sonner
- next-themes
- date-fns
- Vercel Analytics

---

## 🏗️ Architecture

FreshMart uses the Next.js App Router with a component-driven frontend and Redux Toolkit for application state.

The current application uses browser `localStorage` as its persistence layer and mock data as its initial dataset.

```text
┌─────────────────────────────┐
│        Next.js App          │
│         App Router          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       React Components      │
│   Pages + Reusable UI       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Redux Toolkit         │
│ Auth / Cart / Products /    │
│ Wishlist / Orders / Address │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       lib/storage.ts        │
│      Persistence Layer      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Browser Storage       │
│        localStorage         │
└─────────────────────────────┘
