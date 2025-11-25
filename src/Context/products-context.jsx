import { createContext, useContext, useEffect, useState } from "react";
import { AdminContext } from "./admin-context";

export const ProductContext = createContext(null);

export const ProductContextProvider = ({ children }) => {
  const { CATEGORIES: adminCategories } = useContext(AdminContext);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedMinPrice, setSelectedMinPrice] = useState(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(null);
  const taxes = 5.0;
  const shipping = 40;

  useEffect(() => {
    const savedCart = localStorage.getItem("CART_ITEMS");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems({});
      }
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const localProducts =
          JSON.parse(localStorage.getItem("PRODUCTSADMIN")) || [];
        const res = await fetch(
          "https://dummyjson.com/products?limit=0&select=id,title,price,description,discountPercentage,rating,stock,thumbnail,brand,category"
        );
        const data = await res.json();
        const apiProducts = data.products || [];
        const combinedProducts = [...apiProducts, ...localProducts];
        setProducts(combinedProducts);
        setFilteredProducts(combinedProducts);

        const prices = combinedProducts.map((item) => item.price);
        setSelectedMinPrice((prev) =>
          prev === null ? Math.min(...prices) : prev
        );
        setSelectedMaxPrice((prev) =>
          prev === null ? Math.max(...prices) : prev
        );
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("CART_ITEMS", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const handleProductSync = () => {
      const updatedLocal =
        JSON.parse(localStorage.getItem("PRODUCTSADMIN")) || [];
      setProducts((prev) => {
        const dummyPart = prev.filter((p) => p.id && p.id < 200);
        const combined = [...dummyPart, ...updatedLocal];
        setFilteredProducts(combined);
        return combined;
      });
    };

    window.addEventListener("storage", handleProductSync);
    return () => window.removeEventListener("storage", handleProductSync);
  }, []);

  const handleBrandClick = (brand) => {
    setSelectedBrand((prev) => {
      const updated = prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand];
      return updated;
    });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      return updated;
    });
  };

  const handlePriceChange = (min, max) => {
    setSelectedMinPrice(min);
    setSelectedMaxPrice(max);
  };

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategory.some(
          (cat) => item.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (selectedBrand.length > 0) {
      filtered = filtered.filter((item) => {
        const itemBrand =
          item.brand && item.brand.trim() !== "" ? item.brand : "Unknown";
        return (
          selectedBrand.includes(itemBrand) ||
          (itemBrand === "Unknown" && selectedBrand.includes("Unknown"))
        );
      });
    }

    if (selectedMinPrice !== null && selectedMaxPrice !== null) {
      filtered = filtered.filter(
        (item) =>
          item.price >= selectedMinPrice && item.price <= selectedMaxPrice
      );
    }

    setFilteredProducts(filtered);
  }, [
    products,
    selectedBrand,
    selectedCategory,
    selectedMinPrice,
    selectedMaxPrice,
  ]);

  const clearFilters = () => {
    setSelectedBrand([]);
    setSelectedCategory([]);
    if (products.length > 0) {
      const prices = products.map((item) => item.price);
      setSelectedMinPrice(Math.min(...prices));
      setSelectedMaxPrice(Math.max(...prices));
    }
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const cartUpdated = {
        ...prev,
        [product.id]: prev[product.id]
          ? { ...prev[product.id], qty: prev[product.id].qty + 1 }
          : { ...product, qty: 1 },
      };
      localStorage.setItem("CART_ITEMS", JSON.stringify(cartUpdated));
      return cartUpdated;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      delete updatedCart[itemId];
      localStorage.setItem("CART_ITEMS", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const increaseItems = (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updated = {
        ...prev,
        [itemId]: { ...prev[itemId], qty: prev[itemId].qty + 1 },
      };
      localStorage.setItem("CART_ITEMS", JSON.stringify(updated));
      return updated;
    });
  };

  const decreaseItems = (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId] || prev[itemId].qty <= 1) return prev;
      const updated = {
        ...prev,
        [itemId]: { ...prev[itemId], qty: prev[itemId].qty - 1 },
      };
      localStorage.setItem("CART_ITEMS", JSON.stringify(updated));
      return updated;
    });
  };

  const getTotalCartAmount = () => {
    return Object.values(cartItems).reduce((total, item) => {
      const price = parseFloat(item?.price) || 0;
      const qty = parseInt(item?.qty) || 0;
      return total + price * qty;
    }, 0);
  };

  const getTotalCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + (item.qty || 0),
      0
    );
  };

  const clearCart = () => {
    if (Object.keys(cartItems).length > 0) {
      setCartItems({});
      localStorage.removeItem("CART_ITEMS");
    }
  };

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("CART_ITEMS", JSON.stringify(newCart));
  };

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;

    if (typeof thumbnail === "string") {
      return thumbnail;
    }

    if (Array.isArray(thumbnail)) {
      const firstThumb = thumbnail[0];
      if (typeof firstThumb === "string") return firstThumb;
      if (firstThumb?.data_url) return firstThumb.data_url;
      if (firstThumb?.url) return firstThumb.url;
      return null;
    }

    if (typeof thumbnail === "object") {
      if (thumbnail.data_url) return thumbnail.data_url;
      if (thumbnail.url) return thumbnail.url;
    }

    return null;
  };

  const contextValue = {
    products,
    filteredProducts,
    cartItems,
    handleBrandClick,
    handleCategoryClick,
    selectedBrand,
    selectedCategory,
    selectedMinPrice,
    selectedMaxPrice,
    handlePriceChange,
    clearFilters,
    addToCart,
    removeFromCart,
    decreaseItems,
    increaseItems,
    taxes,
    shipping,
    getTotalCartAmount,
    getTotalCartCount,
    clearCart,
    updateCart,
    getImageSrc,
    adminCategories,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
