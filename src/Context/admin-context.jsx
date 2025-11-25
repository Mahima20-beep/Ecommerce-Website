import { createContext, useState, useEffect } from "react";

export const AdminContext = createContext(null);

export const AdminContextProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("CATEGORIES");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("CATEGORIES", JSON.stringify(categories));
  }, [categories]);

  const contextValue = {
    categories,
    setCategories,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
