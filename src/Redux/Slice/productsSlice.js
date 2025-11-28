import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loadLocalProducts, saveLocalProducts } from "../ProductsStorage";

export const fetchProducts = createAsyncThunk("fetchProducts", async () => {
  const response = await fetch(
    "https://dummyjson.com/products?limit=0&select=id,title,price,description,discountPercentage,rating,stock,thumbnail,brand,category"
  );
  return response.json();
});

const initialLocalProducts = loadLocalProducts();

const productsSlice = createSlice({
  name: "products",
  initialState: {
    apiProducts: [],
    localProducts: initialLocalProducts,
    combinedProducts: [],
    isLoading: false,
    isError: false,
  },

  reducers: {
    addLocalProducts: (state, action) => {
      state.localProducts.push(action.payload);

      saveLocalProducts(state.localProducts);

      state.combinedProducts = [...state.apiProducts, ...state.localProducts];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.apiProducts = action.payload.products;

      state.combinedProducts = [...state.apiProducts, ...state.localProducts];
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });
  },
});

export const { addLocalProducts } = productsSlice.actions;
export default productsSlice.reducer;
