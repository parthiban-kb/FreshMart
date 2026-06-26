// Product Types
export interface Product {
  id: string;
  name: string;
  category: 'vegetables' | 'fruits';
  price: number;
  discount: number;
  image: string;
  stock: number;
  description: string;
  weight: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
}

// Wishlist Types
export interface WishlistItem {
  productId: string;
  addedAt: string;
}

// Order Types
export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  addressId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: 'cod';
  createdAt: string;
  updatedAt: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Cart State
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
}

// Wishlist State
export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

// Products State
export interface ProductsState {
  items: Product[];
  isLoading: boolean;
}

// Orders State
export interface OrdersState {
  items: Order[];
  isLoading: boolean;
}

// Addresses State
export interface AddressesState {
  items: Address[];
  isLoading: boolean;
}

// Filter Types
export interface ProductFilters {
  category: 'all' | 'vegetables' | 'fruits';
  priceRange: [number, number];
  discount: number;
  availability: 'all' | 'available' | 'unavailable';
  search: string;
}

// Banner Type for Carousel
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
}
