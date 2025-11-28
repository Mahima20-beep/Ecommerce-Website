import { createSlice } from "@reduxjs/toolkit";

const CART_KEY = "redux_cart";
const PROMO_KEY = "redux_promo";

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
};

const loadPromo = () => {
  try {
    return JSON.parse(localStorage.getItem(PROMO_KEY)) || {
      code: "",
      discount: 0,
    };
  } catch {
    return { code: "", discount: 0 };
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const savePromo = (promo) => {
  localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
};

const initialState = {
  cartItems: loadCart(), 
  promo: loadPromo(),   
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      if (state.cartItems[item.id]) {
        state.cartItems[item.id].qty += 1;
      } else {
        state.cartItems[item.id] = { ...item, qty: 1 };
      }

      saveCart(state.cartItems);
    },

    increaseItem: (state, action) => {
      const id = action.payload;
      if (state.cartItems[id]) {
        state.cartItems[id].qty += 1;
        saveCart(state.cartItems);
      }
    },

    decreaseItem: (state, action) => {
      const id = action.payload;

      if (!state.cartItems[id]) return;

      if (state.cartItems[id].qty > 1) {
        state.cartItems[id].qty -= 1;
      } else {
        delete state.cartItems[id];
      }

      saveCart(state.cartItems);
    },

    removeFromCart: (state, action) => {
      delete state.cartItems[action.payload];
      saveCart(state.cartItems);
    },

    updateCart: (state, action) => {
      state.cartItems = action.payload || {};
      saveCart(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = {};
      state.promo = { code: "", discount: 0 };
      saveCart({});
      savePromo({ code: "", discount: 0 });
    },

    applyPromo: (state, action) => {
      state.promo = action.payload;
      savePromo(state.promo);
    },
  },
});

export const {
  addToCart,
  increaseItem,
  decreaseItem,
  removeFromCart,
  updateCart,
  clearCart,
  applyPromo,
} = cartSlice.actions;

export default cartSlice.reducer;
