import React, { useContext } from "react";

import { FaHeart } from "react-icons/fa";
import { WishlistContext } from "../Context/wishlist-context";

const WishIcon = () => {
  const { getTotalWishlistAmount } = useContext(WishlistContext);

  return (
    <div>
      <FaHeart className="flex justify-center items-center mt-6 w-8 h-7 hover:cursor-pointer relative" />
      <span className="ml-3 bg-red-500 text-white text-sm w-5 h-5 rounded-full flex justify-center items-center">
        {getTotalWishlistAmount()}
      </span>
    </div>
  );
};

export default WishIcon;
