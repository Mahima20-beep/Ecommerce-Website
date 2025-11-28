import { FaHeart } from "react-icons/fa";
import { useSelector } from "react-redux";

const WishIcon = () => {
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const wishlistCount = Object.values(wishlistItems).reduce(
    (total, item) => total + item.qty,
    0
  );

  return (
    <div>
      <FaHeart className="flex justify-center items-center mt-6 w-8 h-7 hover:cursor-pointer relative" />
      <span className="ml-3 bg-red-500 text-white text-sm w-5 h-5 rounded-full flex justify-center items-center">
        {wishlistCount}
      </span>
    </div>
  );
};

export default WishIcon;
