import { CartItem, WishlistItem, User, Address, Order, Product } from '@/types';
import { mockProducts, mockUsers } from '@/data/mock-data';

// Storage Keys
const STORAGE_KEYS = {
  CART: 'freshmart_cart',
  WISHLIST: 'freshmart_wishlist',
  USER: 'freshmart_user',
  USERS: 'freshmart_users',
  ADDRESSES: 'freshmart_addresses',
  ORDERS: 'freshmart_orders',
  PRODUCTS: 'freshmart_products',
} as const;

// Helper to safely access localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Initialize users if not exists
export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  // Initialize users
  const existingUsers = getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (existingUsers.length === 0) {
    setItem(STORAGE_KEYS.USERS, mockUsers);
  }
  
  // Initialize products
  const existingProducts = getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  if (existingProducts.length === 0) {
    setItem(STORAGE_KEYS.PRODUCTS, mockProducts);
  }
};

// Cart Operations
export const getCart = (): CartItem[] => {
  return getItem<CartItem[]>(STORAGE_KEYS.CART, []);
};

export const saveCart = (cart: CartItem[]): void => {
  setItem(STORAGE_KEYS.CART, cart);
};

export const addToCart = (productId: string, quantity: number = 1): CartItem[] => {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: string): CartItem[] => {
  const cart = getCart().filter(item => item.productId !== productId);
  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (productId: string, quantity: number): CartItem[] => {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
  }
  
  saveCart(cart);
  return cart;
};

export const clearCart = (): void => {
  saveCart([]);
};

// Wishlist Operations
export const getWishlist = (): WishlistItem[] => {
  return getItem<WishlistItem[]>(STORAGE_KEYS.WISHLIST, []);
};

export const saveWishlist = (wishlist: WishlistItem[]): void => {
  setItem(STORAGE_KEYS.WISHLIST, wishlist);
};

export const addToWishlist = (productId: string): WishlistItem[] => {
  const wishlist = getWishlist();
  const exists = wishlist.find(item => item.productId === productId);
  
  if (!exists) {
    wishlist.push({ productId, addedAt: new Date().toISOString() });
    saveWishlist(wishlist);
  }
  
  return wishlist;
};

export const removeFromWishlist = (productId: string): WishlistItem[] => {
  const wishlist = getWishlist().filter(item => item.productId !== productId);
  saveWishlist(wishlist);
  return wishlist;
};

export const isInWishlist = (productId: string): boolean => {
  return getWishlist().some(item => item.productId === productId);
};

// User Operations
export const getCurrentUser = (): User | null => {
  return getItem<User | null>(STORAGE_KEYS.USER, null);
};

export const saveCurrentUser = (user: User | null): void => {
  setItem(STORAGE_KEYS.USER, user);
};

export const getUsers = (): User[] => {
  return getItem<User[]>(STORAGE_KEYS.USERS, mockUsers);
};

export const saveUsers = (users: User[]): void => {
  setItem(STORAGE_KEYS.USERS, users);
};

export const registerUser = (name: string, email: string, password: string, phone: string): User | null => {
  const users = getUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return null;
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    phone,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (user) {
    saveCurrentUser(user);
    return user;
  }
  
  return null;
};

export const logoutUser = (): void => {
  saveCurrentUser(null);
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    saveCurrentUser(users[index]);
  }
  
  return users[index];
};

// Address Operations
export const getAddresses = (userId?: string): Address[] => {
  const addresses = getItem<Address[]>(STORAGE_KEYS.ADDRESSES, []);
  if (userId) {
    return addresses.filter(a => a.userId === userId);
  }
  return addresses;
};

export const saveAddresses = (addresses: Address[]): void => {
  setItem(STORAGE_KEYS.ADDRESSES, addresses);
};

export const addAddress = (address: Omit<Address, 'id'>): Address => {
  const addresses = getAddresses();
  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}`,
  };
  
  // If this is the first address or isDefault is true, make it default
  if (addresses.filter(a => a.userId === address.userId).length === 0 || newAddress.isDefault) {
    addresses.forEach(a => {
      if (a.userId === address.userId) a.isDefault = false;
    });
    newAddress.isDefault = true;
  }
  
  addresses.push(newAddress);
  saveAddresses(addresses);
  return newAddress;
};

export const updateAddress = (addressId: string, updates: Partial<Address>): Address | null => {
  const addresses = getAddresses();
  const index = addresses.findIndex(a => a.id === addressId);
  
  if (index === -1) return null;
  
  const updatedAddress = { ...addresses[index], ...updates };
  
  if (updates.isDefault) {
    addresses.forEach(a => {
      if (a.userId === updatedAddress.userId) a.isDefault = false;
    });
    updatedAddress.isDefault = true;
  }
  
  addresses[index] = updatedAddress;
  saveAddresses(addresses);
  return updatedAddress;
};

export const deleteAddress = (addressId: string): void => {
  const addresses = getAddresses().filter(a => a.id !== addressId);
  saveAddresses(addresses);
};

// Order Operations
export const getOrders = (userId?: string): Order[] => {
  const orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (userId) {
    return orders.filter(o => o.userId === userId);
  }
  return orders;
};

export const saveOrders = (orders: Order[]): void => {
  setItem(STORAGE_KEYS.ORDERS, orders);
};

export const createOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `order-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['status']): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  
  saveOrders(orders);
  return orders[index];
};

// Product Operations
export const getProducts = (): Product[] => {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, mockProducts);
};

export const saveProducts = (products: Product[]): void => {
  setItem(STORAGE_KEYS.PRODUCTS, products);
};

export const getProductById = (productId: string): Product | undefined => {
  return getProducts().find(p => p.id === productId);
};

export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
  };
  
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (productId: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts().filter(p => p.id !== productId);
  saveProducts(products);
};
