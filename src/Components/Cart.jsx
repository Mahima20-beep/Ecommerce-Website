import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { BsFillCartXFill } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import {
  increaseItem,
  decreaseItem,
  removeFromCart,
  clearCart,
  applyPromo,
} from "../Redux/Slice/cartSlice";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, promo } = useSelector((state) => state.cart);
  const cartArray = Object.values(cartItems);

  const [toastShown, setToastShown] = useState(false);
  const taxes = 5.0;

  const totalPrice =
    Math.round(
      cartArray.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.qty) || 0;
        return total + price * qty;
      }, 0) * 100
    ) / 100;

  const finalPrice =
    Math.round((totalPrice + taxes - promo.discount) * 100) / 100 || 0;

  const handleApplyPromo = () => {
    if (promo.code === "PRODUCT100" && totalPrice > 1000) {
      dispatch(applyPromo({ code: "PRODUCT100", discount: 100 }));
      toast.success("PRODUCT100 Applied!");
    } else if (promo.code === "PRODUCT50" && totalPrice > 500) {
      dispatch(applyPromo({ code: "PRODUCT50", discount: 50 }));
      toast.success("PRODUCT50 Applied!");
    } else {
      dispatch(applyPromo({ code: "", discount: 0 }));
      toast.error("Invalid promo or subtotal too low");
    }
  };

  const handleRemove = (item) => {
    Swal.fire({
      title: `Are you sure you want to remove ${item.title} from cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0B6623",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromCart(item.id));
        Swal.fire({
          title: "Removed!",
          text: `${item.title} has been removed from your cart.`,
          icon: "success",
        });
      }
    });
  };

  const handleClear = () => {
    Swal.fire({
      title: "Are you sure you want to clear all items from cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0B6623",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, clear it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
        Swal.fire({
          title: "Your cart has been cleared!",
          icon: "success",
        });
      }
    });
  };

  const handleCheckout = () => {
    const hasItems = Object.values(cartItems).some((item) => item.qty > 0);
    if (!hasItems) {
      if (!toastShown) {
        setToastShown(true);
        toast.error("Your cart is empty! Add products before checkout.", {
          style: { marginTop: "60px" },
        });
        setTimeout(() => setToastShown(false), 2000);
      }
      return;
    }
    navigate("/Checkout");
  };

  const hasItemsInCart = cartArray.length > 0;

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith("http")) return thumbnail;
    return `/images/${thumbnail}`;
  };

  return (
    <div className="min-h-screen lg:max-w-5xl max-lg:max-w-2xl mx-auto bg-white p-4 mt-7">
      <div className={`grid gap-6 ${hasItemsInCart ? "lg:grid-cols-3" : ""}`}>
        <div
          className={`bg-gray-100 p-6 rounded-md ${hasItemsInCart ? "lg:col-span-2" : "w-full"}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Your Cart</h3>
            {hasItemsInCart && (
              <button
                className="text-sm px-4 py-2.5 font-medium bg-transparent text-slate-900 border border-gray-300 rounded-md cursor-pointer"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
          <hr className="border-gray-300 mt-4 mb-8" />

          {!hasItemsInCart ? (
            <div className="flex flex-col justify-center items-center py-16">
              <BsFillCartXFill className="text-gray-500 h-16 w-16 mb-4" />
              <p className="text-gray-600 font-medium mb-6">
                Your cart is empty!
              </p>
              <button
                onClick={() => navigate("/Products")}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {cartArray.map((item) => {
                const imageSrc = getImageSrc(item.thumbnail);
                return (
                  <div
                    key={`${item.id}-${item.title}`}
                    className="sm:space-y-6 space-y-8"
                  >
                    <div className="grid sm:grid-cols-3 items-center gap-4">
                      <div className="sm:col-span-2 flex sm:items-center max-sm:flex-col gap-6">
                        <div className="w-24 h-24 shrink-0 bg-white p-2 rounded-md">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <p className="text-gray-400 text-sm">
                              No image found
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col justify-between">
                          <h4 className="text-[15px] font-semibold text-slate-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-800 font-medium">
                            Price: ${item.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 px-5 py-1.5 text-slate-900 text-xs rounded-md">
                          <span
                            className="cursor-pointer"
                            onClick={() => dispatch(decreaseItem(item.id))}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 fill-current"
                              viewBox="0 0 124 124"
                            >
                              <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z"></path>
                            </svg>
                          </span>
                          <span className="mx-4">{item.qty}</span>
                          <span
                            className="cursor-pointer"
                            onClick={() => dispatch(increaseItem(item.id))}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 fill-current"
                              viewBox="0 0 42 42"
                            >
                              <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z"></path>
                            </svg>
                          </span>
                        </div>
                        <span
                          className="cursor-pointer text-red-500"
                          onClick={() => handleRemove(item)}
                        >
                          <MdDeleteOutline size={22} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasItemsInCart && (
          <div className="bg-gray-100 rounded-md p-6 md:sticky top-0 h-max">
            <h3 className="text-lg font-semibold text-slate-900">
              Order details
            </h3>
            <hr className="border-gray-300 mt-4 mb-8" />
            <ul className="text-slate-500 font-medium mt-8 space-y-4">
              <li className="flex flex-wrap gap-4 text-sm">
                Subtotal
                <span className="ml-auto text-slate-900 font-semibold">
                  ${totalPrice}
                </span>
              </li>
              <li className="flex flex-wrap gap-4 text-sm">
                Discount
                <span className="ml-auto text-orange-800 font-semibold">
                  - ${promo.discount}
                </span>
              </li>
              <li className="flex flex-wrap gap-4 text-sm">
                Taxes
                <span className="ml-auto text-slate-900 font-semibold">
                  ${taxes}
                </span>
              </li>
              {promo.discount > 0 && (
                <li className="flex flex-wrap gap-4 text-sm text-orange-800">
                  PROMO
                  <span className="ml-auto text-orange-800 font-semibold">
                    {promo.code}
                  </span>
                </li>
              )}
              <hr className="border-gray-300 mt-4 mb-8" />
              <li className="flex flex-wrap gap-4 text-red-900 text-md">
                Total
                <span className="flex flex-wrap gap-4 ml-auto text-red-900 text-md">
                  <u>${finalPrice}</u>
                </span>
              </li>
            </ul>
            <div className="mt-8 space-y-3">
              <button
                type="button"
                className="text-sm px-4 py-2.5 w-full font-medium tracking-wide bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <button
                type="button"
                className="text-sm px-4 py-2.5 w-full font-medium tracking-wide bg-transparent text-slate-900 border border-gray-300 rounded-md cursor-pointer"
                onClick={() => navigate("/Products")}
              >
                Continue Shopping
              </button>
            </div>
            <div className="mt-6">
              <p className="text-slate-900 text-sm font-medium mb-2">
                Do you have a promo code?
              </p>
              <div className="flex border border-blue-600 overflow-hidden rounded-md">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="w-full outline-0 bg-white text-slate-600 text-sm px-4 py-2.5"
                  value={promo.code}
                  onChange={(e) =>
                    dispatch(
                      applyPromo({
                        ...promo,
                        code: e.target.value.toUpperCase(),
                      })
                    )
                  }
                />

                <button
                  type="button"
                  className="flex items-center justify-center font-medium tracking-wide bg-blue-600 hover:bg-blue-700 px-4 text-sm text-white cursor-pointer"
                  onClick={handleApplyPromo}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
