import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddressesState, Address } from '@/types';
import { getAddresses, addAddress as storageAddAddress, updateAddress as storageUpdateAddress, deleteAddress as storageDeleteAddress } from '@/lib/storage';

const initialState: AddressesState = {
  items: [],
  isLoading: true,
};

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    initializeAddresses: (state, action: PayloadAction<string | undefined>) => {
      state.items = getAddresses(action.payload);
      state.isLoading = false;
    },
    setAddresses: (state, action: PayloadAction<Address[]>) => {
      state.items = action.payload;
    },
    addAddress: (state, action: PayloadAction<Omit<Address, 'id'>>) => {
      const newAddress = storageAddAddress(action.payload);
      if (newAddress.isDefault) {
        state.items.forEach(a => {
          if (a.userId === newAddress.userId) a.isDefault = false;
        });
      }
      state.items.push(newAddress);
    },
    updateAddress: (state, action: PayloadAction<{ id: string; updates: Partial<Address> }>) => {
      const updated = storageUpdateAddress(action.payload.id, action.payload.updates);
      if (updated) {
        if (updated.isDefault) {
          state.items.forEach(a => {
            if (a.userId === updated.userId) a.isDefault = false;
          });
        }
        const index = state.items.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      storageDeleteAddress(action.payload);
      state.items = state.items.filter(a => a.id !== action.payload);
    },
    refreshAddresses: (state, action: PayloadAction<string | undefined>) => {
      state.items = getAddresses(action.payload);
    },
  },
});

export const { initializeAddresses, setAddresses, addAddress, updateAddress, deleteAddress, refreshAddresses } = addressesSlice.actions;
export default addressesSlice.reducer;
