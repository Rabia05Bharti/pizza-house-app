import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMenu, fetchCategories } from '../services/api';
import { initialMenu } from '../data/initialMenu';

export const loadMenuData = createAsyncThunk(
  'menu/loadMenuData',
  async ({ category = 'All', search = '' }, { rejectWithValue }) => {
    try {
      const data = await fetchMenu(category, search);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const loadCategoriesData = createAsyncThunk(
  'menu/loadCategoriesData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCategories();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: initialMenu,
    categories: ["All", "Gym Guyz", "Momos & Rolls", "Pizza Single Topping", "Pizza Veg Double Topping", "Kidz Pizza", "Pizza Veg-1", "Pizza Veg-2", "Pizza Veg-3", "Burgers", "Sandwich", "Pasta", "Fries", "Wraps", "Shakes", "Hot Dessert", "Mocktails", "Cold Desserts", "Breads", "Beverages"],
    selectedCategory: 'All',
    searchQuery: '',
    loading: false,
    error: null
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMenuData.pending, (state) => {
        state.loading = false; // Keep menu items visible immediately in 0ms
      })
      .addCase(loadMenuData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(loadMenuData.rejected, (state) => {
        state.loading = false;
        // Keep initialMenu so the user never sees an error card!
        if (!state.items || state.items.length === 0) {
          state.items = initialMenu;
        }
      })
      .addCase(loadCategoriesData.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.categories = action.payload;
        }
      });
  }
});

export const { setSelectedCategory, setSearchQuery } = menuSlice.actions;
export default menuSlice.reducer;
