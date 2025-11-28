import { createContext, useContext, useState } from "react";
import { AdminContext } from "./admin-context";

export const ProductContext = createContext(null);

export const ProductContextProvider = ({ children }) => {
  const { CATEGORIES: adminCategories } = useContext(AdminContext);

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedMinPrice, setSelectedMinPrice] = useState(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(null);

  const handleBrandClick = (brand) => {
    setSelectedBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (min, max) => {
    setSelectedMinPrice(min);
    setSelectedMaxPrice(max);
  };

  const clearFilters = () => {
    setSelectedBrand([]);
    setSelectedCategory([]);
    setSelectedMinPrice(null);
    setSelectedMaxPrice(null);
  };

  const contextValue = {
    handleBrandClick,
    handleCategoryClick,
    handlePriceChange,
    clearFilters,
    selectedBrand,
    selectedCategory,
    selectedMinPrice,
    selectedMaxPrice,
    adminCategories,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
