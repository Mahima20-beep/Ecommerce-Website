import { useContext } from "react";
import { FaCartShopping } from "react-icons/fa6";

import { ProductContext } from "../Context/products-context";

const CartIcon = () => {
  const { getTotalCartCount } = useContext(ProductContext);

  return (
    <div>
      <FaCartShopping className="flex justify-center items-center mt-7 w-8 h-6 hover:cursor-pointer relative" />
      <span className="ml-5 bg-red-500 text-white text-sm w-5 h-5 rounded-full flex justify-center items-center">
        {getTotalCartCount()}
      </span>
    </div>
  );
};

export default CartIcon;
