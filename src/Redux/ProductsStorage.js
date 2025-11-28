const LOCAL_PRODUCTS = "redux_products_local";

export const loadLocalProducts = () => {
  try {
    const data = localStorage.getItem(LOCAL_PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLocalProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_PRODUCTS, JSON.stringify(products));
  } catch {}
};
