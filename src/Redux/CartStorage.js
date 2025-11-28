const CART_KEY = "redux_cart";

export const loadCart = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveCart = (cartItems) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch (err) {
    console.error("Cart save failed", err);
  }
};
