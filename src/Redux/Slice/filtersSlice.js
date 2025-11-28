import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedBrand: [],
  selectedCategory: [],
  selectedMinPrice: 0,
  selectedMaxPrice: 0,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,

  reducers: {
    toggleBrand: (state, action) => {
      const brand = action.payload;

      if (state.selectedBrand.includes(brand)) {
        state.selectedBrand = state.selectedBrand.filter((b) => b !== brand);
      } else {
        state.selectedBrand.push(brand);
      }
    },

    toggleCategory: (state, action) => {
      const category = action.payload;

      if (state.selectedCategory.includes(category)) {
        state.selectedCategory = state.selectedCategory.filter(
          (c) => c !== category
        );
      } else {
        state.selectedCategory.push(category);
      }
    },

    setPriceRange: (state, action) => {
      const { min, max } = action.payload;
      state.selectedMinPrice = min;
      state.selectedMaxPrice = max;
    },

    clearFilters: (state) => {
      state.selectedBrand = [];
      state.selectedCategory = [];
      state.selectedMinPrice = null;
      state.selectedMaxPrice = null;
    },
  },
});

export const { toggleBrand, toggleCategory, setPriceRange, clearFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
