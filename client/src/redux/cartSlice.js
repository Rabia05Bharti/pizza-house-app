import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { cartItemId, menuItemId, name, category, selectedSize, price, quantity, extraToppings, isHealthFocused }
  isCartOpen: false
};

const generateCartItemId = (menuItemId, selectedSize, extraToppings = []) => {
  const sortedToppings = [...extraToppings].sort().join(',');
  return `${menuItemId}_${selectedSize || 'default'}_${sortedToppings}`;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { _id, name, category, price, selectedSize, extraToppings = [], isHealthFocused, image } = action.payload;
      const cartItemId = generateCartItemId(_id, selectedSize, extraToppings);

      const existingIndex = state.items.findIndex(item => item.cartItemId === cartItemId);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({
          cartItemId,
          menuItemId: _id,
          name,
          category,
          selectedSize: selectedSize || '',
          unitPrice: price,
          quantity: 1,
          extraToppings,
          isHealthFocused,
          image
        });
      }
      state.isCartOpen = true;
    },
    removeFromCart: (state, action) => {
      const cartItemId = action.payload;
      state.items = state.items.filter(item => item.cartItemId !== cartItemId);
    },
    updateQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const existing = state.items.find(item => item.cartItemId === cartItemId);
      if (existing) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.cartItemId !== cartItemId);
        } else {
          existing.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCartDrawer: (state, action) => {
      state.isCartOpen = typeof action.payload === 'boolean' ? action.payload : !state.isCartOpen;
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCartDrawer } = cartSlice.actions;

// Strict WYSWYP Selectors (Subtotal = Total, 0 Added Taxes)
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);

export default cartSlice.reducer;
