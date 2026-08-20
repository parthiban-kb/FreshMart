# FreshMart — Grocery E-Commerce Platform

A modern, responsive grocery e-commerce platform built with **Next.js, React, TypeScript, Tailwind CSS, and Redux Toolkit**. FreshMart provides a complete shopping experience for fresh vegetables and fruits, including product discovery, filtering, cart, wishlist, checkout, user profiles, order management, and an administrative dashboard.

## 🚀 Live Demo

**[Visit FreshMart →](https://fresh-mart-shop.vercel.app/)**

## 📦 Repository

**GitHub:** https://github.com/parthiban-kb/FreshMart

## ✨ Features

### 🛍️ Shopping Experience

* Browse fresh vegetables and fruits
* Product search and category filtering
* Price, discount, and availability filters
* Product sorting
* Grid and list product views
* Detailed product pages
* Featured products
* Responsive shopping experience

### 🛒 Cart & Wishlist

* Add products to cart
* Update product quantities
* Remove products from cart
* Persistent cart state
* Add/remove wishlist items
* Persistent wishlist state

### 👤 User Management

* User registration
* User login/logout
* Profile management
* Address management
* Default address selection
* User-specific order history

### 📦 Checkout & Orders

* Checkout workflow
* Address selection
* Order creation
* Order history
* Order status tracking
* Cash-on-delivery payment flow

### 🔐 Admin Dashboard

* Admin dashboard
* Product management
* Add, update, and delete products
* Order management
* Update order status
* User management
* Separate administrative interface

### 🎨 UI & UX

* Responsive design
* Reusable UI components
* Loading skeletons
* Empty states
* Toast notifications
* Accessible Radix UI primitives
* Light/dark theme support
* Responsive navigation and layouts

## 🧑‍💻 Technology Stack

### Frontend

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**

### State Management

* **Redux Toolkit**
* **React Redux**

### UI & Components

* **Radix UI**
* **Lucide React**
* **shadcn-style reusable components**

### Forms & Validation

* **React Hook Form**
* **Zod**
* **@hookform/resolvers**

### Additional Libraries

* **Recharts**
* **Embla Carousel**
* **Sonner**
* **next-themes**
* **date-fns**
* **Vercel Analytics**

## 🏗️ Project Architecture

```text
FreshMart/
│
├── app/
│   ├── admin/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── users/
│   │   └── page.tsx
│   │
│   ├── cart/
│   ├── checkout/
│   ├── login/
│   ├── products/
│   │   └── [id]/
│   ├── profile/
│   ├── register/
│   ├── wishlist/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── home/
│   ├── layout/
│   ├── products/
│   ├── providers/
│   └── ui/
│
├── data/
│   └── mock-data.ts
│
├── hooks/
│
├── lib/
│   ├── storage.ts
│   └── utils.ts
│
├── store/
│   ├── hooks.ts
│   ├── store.ts
│   └── slices/
│       ├── addressesSlice.ts
│       ├── authSlice.ts
│       ├── cartSlice.ts
│       ├── ordersSlice.ts
│       ├── productsSlice.ts
│       └── wishlistSlice.ts
│
├── types/
│   └── index.ts
│
└── styles/
```

## 🔄 Application Data Flow

FreshMart uses Redux Toolkit for application state and a centralized storage abstraction for persistence.

```text
User Interaction
       ↓
React Component
       ↓
Redux Action
       ↓
Redux Slice
       ↓
Storage Layer
       ↓
Browser localStorage
       ↓
Redux State Update
       ↓
UI Re-render
```

The project currently uses mock data and browser-side persistence, making it suitable as a complete e-commerce frontend/demo application.

## 📋 Core Data Models

The application defines TypeScript models for:

* `Product`
* `User`
* `Address`
* `CartItem`
* `WishlistItem`
* `Order`
* `OrderItem`
* `ProductFilters`

## 🛠️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js 20+
* npm or pnpm

### Clone the repository

```bash
git clone https://github.com/parthiban-kb/FreshMart.git
cd FreshMart
```

### Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

### Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 📜 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint.

## 🌐 Application Routes

### Customer

```text
/
 /products
 /products/[id]
 /cart
 /wishlist
 /checkout
 /login
 /register
 /profile
```

### Admin

```text
/admin
/admin/products
/admin/orders
/admin/users
```

## 🎯 Project Highlights

FreshMart was built to demonstrate a complete modern e-commerce frontend architecture using the **Next.js App Router**, reusable React components, centralized Redux state management, typed domain models, responsive UI patterns, and a dedicated admin experience.

The project covers the major workflows expected from a grocery shopping platform while maintaining a modular and reusable component structure.

## 🚧 Current Architecture

FreshMart currently uses **browser localStorage and mock data** as its persistence layer.

This means:

* Product changes are stored locally
* User accounts are stored locally
* Cart and wishlist data are stored locally
* Orders are stored locally
* Admin changes are local to the browser

A future production architecture could replace this layer with a real backend, database, authentication system, and server-side authorization.

## 🔮 Future Improvements

* Connect PostgreSQL or Supabase
* Add secure server-side authentication
* Implement role-based server authorization
* Add real payment gateway integration
* Add real-time inventory management
* Add image/storage management
* Add server-side product search and pagination
* Add automated tests
* Add CI/CD workflows
* Add production-grade order processing

## 👨‍💻 Author

**Parthiban KB**

* GitHub: https://github.com/parthiban-kb

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

**FreshMart — Fresh products. Simple shopping. Modern experience.**
