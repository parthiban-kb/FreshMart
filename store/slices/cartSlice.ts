import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem } from '@/types';
import { getCart, addToCart as storageAddToCart, removeFromCart as storageRemoveFromCart, updateCartQuantity as storageUpdateQuantity, clearCart as storageClearCart } from '@/lib/storage';

const initialState: CartState = {
  items: [],
  isLoading: true,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state) => {
      state.items = getCart();
      state.isLoading = false;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<{ productId: string; quantity?: number }>) => {
      state.items = storageAddToCart(action.payload.productId, action.payload.quantity || 1);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = storageRemoveFromCart(action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      state.items = storageUpdateQuantity(action.payload.productId, action.payload.quantity);
    },
    clearCart: (state) => {
      storageClearCart();
      state.items = [];
    },
  },
});

export const { initializeCart, setCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
