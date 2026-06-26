import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductsState, Product } from '@/types';
import { getProducts, saveProducts, addProduct as storageAddProduct, updateProduct as storageUpdateProduct, deleteProduct as storageDeleteProduct } from '@/lib/storage';

const initialState: ProductsState = {
  items: [],
  isLoading: true,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    initializeProducts: (state) => {
      state.items = getProducts();
      state.isLoading = false;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      saveProducts(action.payload);
    },
    addProduct: (state, action: PayloadAction<Omit<Product, 'id'>>) => {
      const newProduct = storageAddProduct(action.payload);
      state.items.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; updates: Partial<Product> }>) => {
      const updated = storageUpdateProduct(action.payload.id, action.payload.updates);
      if (updated) {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      storageDeleteProduct(action.payload);
      state.items = state.items.filter(p => p.id !== action.payload);
    },
  },
});

export const { initializeProducts, setProducts, addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;
