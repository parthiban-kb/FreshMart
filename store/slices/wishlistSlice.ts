import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WishlistState, WishlistItem } from '@/types';
import { getWishlist, addToWishlist as storageAddToWishlist, removeFromWishlist as storageRemoveFromWishlist } from '@/lib/storage';

const initialState: WishlistState = {
  items: [],
  isLoading: true,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    initializeWishlist: (state) => {
      state.items = getWishlist();
      state.isLoading = false;
    },
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action: PayloadAction<string>) => {
      state.items = storageAddToWishlist(action.payload);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = storageRemoveFromWishlist(action.payload);
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const exists = state.items.some(item => item.productId === action.payload);
      if (exists) {
        state.items = storageRemoveFromWishlist(action.payload);
      } else {
        state.items = storageAddToWishlist(action.payload);
      }
    },
  },
});

export const { initializeWishlist, setWishlist, addToWishlist, removeFromWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
