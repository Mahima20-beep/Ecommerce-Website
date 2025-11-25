import { createContext, useState, useEffect } from "react";

export const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("WISHLIST_ITEMS");
    return savedWishlist ? JSON.parse(savedWishlist) : {};
  });

  useEffect(() => {
    localStorage.setItem("WISHLIST_ITEMS", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const handler = () => {
      setWishlist({});
      localStorage.removeItem("WISHLIST_ITEMS");
    };

    window.addEventListener("reset_wishlist", handler);
    return () => window.removeEventListener("reset_wishlist", handler);
  }, []);

  const addToWishlist = (item) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist[item.id]) return prevWishlist;
      return { ...prevWishlist, [item.id]: item };
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlist((prev) => {
      const updatedWishlist = { ...prev };
      delete updatedWishlist[itemId];
      return updatedWishlist;
    });
  };

  const getTotalWishlistAmount = () => {
    return Object.keys(wishlist).length;
  };

  const wishlistValue = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    getTotalWishlistAmount,
  };

  return (
    <WishlistContext.Provider value={wishlistValue}>
      {children}
    </WishlistContext.Provider>
  );
};
