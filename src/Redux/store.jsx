import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./Slice/productsSlice";
import cartReducer from "./Slice/cartSlice";
import wishlistReducer from "./Slice/wishlistSlice";
import filtersReducer from "./Slice/filtersSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    filters: filtersReducer,
  },
});
