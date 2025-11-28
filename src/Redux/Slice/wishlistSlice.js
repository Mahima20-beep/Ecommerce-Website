import { createSlice } from "@reduxjs/toolkit";

const WISHLIST_KEY = "redux_wishlist";

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || {};
  } catch {
    return {};
  }
};

const saveWishlist = (wishlist) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};

const initialState = {
  wishlistItems: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;

      if (state.wishlistItems[item.id]) {
        state.wishlistItems[item.id].qty += 1;
      } else {
        state.wishlistItems[item.id] = { ...item, qty: 1 };
      }

      saveWishlist(state.wishlistItems);
    },

    removeFromWishlist: (state, action) => {
      delete state.wishlistItems[action.payload];
      saveWishlist(state.wishlistItems);
    },

    clearWishlist: (state) => {
      state.wishlistItems = {};
      saveWishlist({});
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
