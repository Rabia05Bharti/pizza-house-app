import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderApi, fetchOrdersApi, updateOrderStatusApi } from '../services/api';

export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (orderPayload, { rejectWithValue }) => {
    const systemId = localStorage.getItem('pizza_house_system_id') || 'System-1';
    
    try {
      const data = await createOrderApi(orderPayload);
      const serverOrder = data.data;

      // Save server order locally without duplicating
      try {
        const systemOrders = JSON.parse(localStorage.getItem(`orders_${systemId}`) || '[]');
        if (serverOrder && !systemOrders.some(o => o.orderNumber === serverOrder.orderNumber || o._id === serverOrder._id)) {
          systemOrders.unshift(serverOrder);
          localStorage.setItem(`orders_${systemId}`, JSON.stringify(systemOrders));
        }
      } catch (e) {}

      return serverOrder;
    } catch (err) {
      console.warn('[Order Local POS Mode] Network call failed/timed out, generating local system order:', err);
      const orderNumber = `PH-${Math.floor(100 + Math.random() * 900)}`;
      const localOrder = {
        _id: `local_ord_${Date.now()}`,
        orderNumber,
        customer: orderPayload.customer,
        items: orderPayload.items,
        totalAmount: orderPayload.totalAmount,
        paymentStatus: orderPayload.paymentStatus || 'Pending',
        paymentDetails: orderPayload.paymentDetails || { paymentMethod: 'Cash / Local POS' },
        orderStatus: 'Received',
        createdAt: new Date().toISOString(),
        isLocalFallback: true
      };

      // Store in local system storage without duplicating
      try {
        const systemOrders = JSON.parse(localStorage.getItem(`orders_${systemId}`) || '[]');
        if (!systemOrders.some(o => o.orderNumber === localOrder.orderNumber)) {
          systemOrders.unshift(localOrder);
          localStorage.setItem(`orders_${systemId}`, JSON.stringify(systemOrders));
        }
      } catch (e) {}

      return localOrder;
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    const systemId = localStorage.getItem('pizza_house_system_id') || 'System-1';
    const systemOrders = JSON.parse(localStorage.getItem(`orders_${systemId}`) || '[]');
    const orderMap = new Map();

    try {
      const data = await fetchOrdersApi();
      const remoteOrders = data.data || [];

      // First add remote orders to map keyed by orderNumber / _id
      remoteOrders.forEach(o => {
        const key = String(o.orderNumber || o._id);
        if (key) orderMap.set(key, o);
      });

      // Then add local system orders only if not already present
      systemOrders.forEach(o => {
        const key = String(o.orderNumber || o._id);
        if (key && !orderMap.has(key)) {
          orderMap.set(key, o);
        }
      });

      return Array.from(orderMap.values());
    } catch (err) {
      systemOrders.forEach(o => {
        const key = String(o.orderNumber || o._id);
        if (key) orderMap.set(key, o);
      });
      return Array.from(orderMap.values());
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
      state.confirmedOrder = null;
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
        state.confirmedOrder = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      });
  }
});

export const { setCheckoutOpen, setSuccessModalOpen, setConfirmedOrder, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
