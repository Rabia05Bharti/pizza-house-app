import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import menuReducer from './menuSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    menu: menuReducer,
    order: orderReducer
  }
});
