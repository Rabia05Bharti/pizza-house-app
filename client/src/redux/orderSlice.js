import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderApi, fetchOrdersApi, updateOrderStatusApi } from '../services/api';

export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (orderPayload, { rejectWithValue }) => {
    try {
      const data = await createOrderApi(orderPayload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to initialize order');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOrdersApi();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders');
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const data = await updateOrderStatusApi(id, statusData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    currentOrder: null,
    confirmedOrder: null,
    adminOrders: [],
    loading: false,
    error: null,
    isCheckoutOpen: false,
    isSuccessModalOpen: false
  },
  reducers: {
    setCheckoutOpen: (state, action) => {
      state.isCheckoutOpen = action.payload;
    },
    setSuccessModalOpen: (state, action) => {
      state.isSuccessModalOpen = action.payload;
    },
    setConfirmedOrder: (state, action) => {
      state.confirmedOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const index = state.adminOrders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.adminOrders[index] = action.payload;
        }
      });
  }
});

export const { setCheckoutOpen, setSuccessModalOpen, setConfirmedOrder, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
