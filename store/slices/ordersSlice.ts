import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrdersState, Order, OrderStatus } from '@/types';
import { getOrders, createOrder as storageCreateOrder, updateOrderStatus as storageUpdateOrderStatus } from '@/lib/storage';

const initialState: OrdersState = {
  items: [],
  isLoading: true,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    initializeOrders: (state, action: PayloadAction<string | undefined>) => {
      state.items = getOrders(action.payload);
      state.isLoading = false;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    createOrder: (state, action: PayloadAction<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newOrder = storageCreateOrder(action.payload);
      state.items.push(newOrder);
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const updated = storageUpdateOrderStatus(action.payload.orderId, action.payload.status);
      if (updated) {
        const index = state.items.findIndex(o => o.id === action.payload.orderId);
        if (index !== -1) {
          state.items[index] = updated;
        }
      }
    },
    refreshOrders: (state, action: PayloadAction<string | undefined>) => {
      state.items = getOrders(action.payload);
    },
  },
});

export const { initializeOrders, setOrders, createOrder, updateOrderStatus, refreshOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
