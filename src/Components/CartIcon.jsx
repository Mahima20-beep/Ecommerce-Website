import { useSelector } from "react-redux";
import { FaCartShopping } from "react-icons/fa6";

const CartIcon = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartCount = Object.values(cartItems).reduce(
    (total, item) => total + item.qty,
    0
  );
  return (
    <div>
      <FaCartShopping className="flex justify-center items-center mt-7 w-8 h-6 hover:cursor-pointer relative" />
      <span className="ml-5 bg-red-500 text-white text-sm w-5 h-5 rounded-full flex justify-center items-center">
        {cartCount}
      </span>
    </div>
  );
};

export default CartIcon;
