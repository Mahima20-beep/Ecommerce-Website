import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDeleteOutline } from "react-icons/md";
import { ProductContext } from "./Context/products-context";
import { PayPalButtons } from "@paypal/react-paypal-js";
import supabase from "./supabase";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [promoCode, setPromoCode] = useState(
    localStorage.getItem("promoCode") || ""
  );
  const [promoApplied, setPromoApplied] = useState(
    Number(localStorage.getItem("promoApplied")) || 0
  );

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const {
    cartItems,
    increaseItems,
    decreaseItems,
    taxes,
    shipping,
    removeFromCart,
    getImageSrc,
    clearCart,
  } = useContext(ProductContext);

  useEffect(() => {
    const saved = localStorage.getItem("USER_ADDRESS") || "";
    setCustomer((c) => ({ ...c, address: saved }));
  }, []);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setCustomer((c) => ({ ...c, email: user.email }));
      }
    };
    fetchUserEmail();
  }, []);

  const cartProducts = Object.values(cartItems).filter((item) => item.qty > 0);

  const totalPrice =
    Math.round(
      Object.values(cartItems).reduce((total, item) => {
        const price = parseFloat(item?.price) || 0;
        const qty = parseInt(item?.qty) || 0;
        return total + price * qty;
      }, 0) * 100
    ) / 100;

  const finalPrice =
    Math.round(
      (totalPrice + (taxes || 0) + (shipping || 0) - promoApplied) * 100
    ) / 100 || 0;

  useEffect(() => {
    if (totalPrice < 500 && promoApplied > 0) {
      setPromoCode("");
      setPromoApplied(0);
      localStorage.removeItem("promoCode");
      localStorage.removeItem("promoApplied");
    }
  }, [totalPrice, promoApplied]);

  const handleRemove = (item) => {
    Swal.fire({
      title: `Remove ${item.title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0B6623",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(item.id);
        Swal.fire("Removed!", `${item.title} removed.`, "success");
      }
    });
  };

  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const digits = value.replace(/[^\d]/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const handlePhoneChange = (value) => {
    const digits = value.replace(/[^\d]/g, "").slice(0, 10);
    setCustomer({ ...customer, phone: digits });
  };

  const handlePhoneKeyDown = (e) => {
    if ([8, 46, 9, 27, 13].includes(e.keyCode)) return;
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) return;
    if (e.keyCode < 48 || e.keyCode > 57) e.preventDefault();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customer.firstName.trim() || customer.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!customer.lastName.trim() || customer.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email || !emailRegex.test(customer.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!customer.phone || customer.phone.length !== 10) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!customer.address.trim() || customer.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCheckoutFingerprint = () => {
    const itemsKey = cartProducts
      .map((item) => `${item.id}-${item.qty}-${item.price}`)
      .sort()
      .join("|");
    return `${itemsKey}|${finalPrice}|${customer.email || "guest"}|${customer.phone || "no-phone"}`;
  };

  const handleCompletePurchase = () => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!validateForm()) {
      setIsProcessing(false);
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill all required fields correctly.",
      });
      return;
    }

    const fingerprint = getCheckoutFingerprint();

    const orderIds = JSON.parse(localStorage.getItem("ORDER_IDS") || "[]");
    for (const id of orderIds) {
      const saved = localStorage.getItem(id);
      if (saved) {
        const existingOrder = JSON.parse(saved);
        if (existingOrder.checkoutFingerprint === fingerprint) {
          toast.error("This order has already been placed!");
          navigate("/Orders");
          setIsProcessing(false);
          return;
        }
      }
    }

    const orderId = `CA${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const orderData = {
      customer: {
        ...customer,
        phone: customer.phone.replace(/[^\d]/g, ""),
      },
      items: cartProducts.map((item) => ({
        ...item,
        qty: item.qty,
        price: parseFloat(item.price),
      })),
      subtotal: totalPrice,
      discount: promoApplied,
      taxes: taxes || 0,
      shipping: shipping || 0,
      total: finalPrice,
      orderId,
      timestamp: new Date().toISOString(),
      trackingId: Math.floor(100000 + Math.random() * 900000),
      checkoutFingerprint: fingerprint,
    };

    localStorage.setItem(orderId, JSON.stringify(orderData));

    localStorage.setItem("LATEST_ORDER", JSON.stringify(orderData));

    orderIds.unshift(orderId);
    localStorage.setItem("ORDER_IDS", JSON.stringify(orderIds));

    if (clearCart) clearCart();
    localStorage.removeItem("CART_ITEMS");

    localStorage.removeItem("promoCode");
    localStorage.removeItem("promoApplied");

    toast.success(`Order placed successfully! #${orderId}`);
    navigate("/Orders");
    clearCart();
    setIsProcessing(false);
  };

  return (
    <div className="bg-white sm:px-8 px-4 py-6">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/2 w-full">
          {cartProducts.map((item) => {
            const imageSrc = getImageSrc(item.thumbnail);
            return (
              <div
                key={`${item.id}-${item.title}`}
                className="border-b pb-6 mb-6"
              >
                <div className="flex items-start gap-6 max-sm:flex-col">
                  <div className="w-24 h-24 bg-white p-2 rounded-md border">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">No image</p>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between w-full">
                      <h4 className="text-md font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <span
                        className="cursor-pointer text-red-500"
                        onClick={() => handleRemove(item)}
                      >
                        <MdDeleteOutline size={22} />
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full mt-7">
                      <p className="text-md text-gray-800 font-medium">
                        Price: ${item.price}
                      </p>
                      <div className="flex items-center mt-2 gap-4">
                        <div className="flex items-center border border-gray-300 px-4 py-1.5 rounded-md text-xs">
                          <span
                            className="cursor-pointer"
                            onClick={() => decreaseItems(item.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 fill-current"
                              viewBox="0 0 124 124"
                            >
                              <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z" />
                            </svg>
                          </span>
                          <span className="mx-4">{item.qty}</span>
                          <span
                            className="cursor-pointer"
                            onClick={() => increaseItems(item.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 fill-current"
                              viewBox="0 0 42 42"
                            >
                              <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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
                - ${promoApplied}
              </span>
            </li>
            <li className="flex flex-wrap gap-4 text-sm">
              Shipping
              <span className="ml-auto text-slate-900 font-semibold">
                ${shipping}
              </span>
            </li>
            <li className="flex flex-wrap gap-4 text-sm">
              Taxes
              <span className="ml-auto text-slate-900 font-semibold">
                ${taxes}
              </span>
            </li>
            {promoApplied > 0 && (
              <li className="flex flex-wrap gap-4 text-sm text-orange-800">
                PROMO
                <span className="ml-auto font-semibold">{promoCode}</span>
              </li>
            )}
            <hr className="border-gray-300 mt-4 mb-8" />
            <li className="flex flex-wrap gap-4 text-red-900 text-md">
              Total
              <span className="ml-auto text-red-900 text-md">
                <u>${finalPrice}</u>
              </span>
            </li>
          </ul>
        </div>

        <div className="lg:w-1/2 w-full">
          <form onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-xl text-slate-900 font-semibold mb-6">
              Delivery Details
            </h2>

            <div className="grid lg:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <label className="text-sm text-slate-900 font-medium block mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  value={customer.firstName}
                  onChange={(e) =>
                    setCustomer({ ...customer, firstName: e.target.value })
                  }
                  className={`px-4 py-2.5 bg-white border ${
                    errors.firstName ? "border-red-500" : "border-gray-400"
                  } text-slate-900 w-full text-sm rounded-md focus:outline-blue-600`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-900 font-medium block mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  value={customer.lastName}
                  onChange={(e) =>
                    setCustomer({ ...customer, lastName: e.target.value })
                  }
                  className={`px-4 py-2.5 bg-white border ${
                    errors.lastName ? "border-red-500" : "border-gray-400"
                  } text-slate-900 w-full text-sm rounded-md focus:outline-blue-600`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-900 font-medium block mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-400 text-slate-900 w-full text-sm rounded-md">
                  {customer.email || "Loading..."}
                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-900 font-medium block mb-2">
                  Phone No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formatPhoneNumber(customer.phone)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={handlePhoneKeyDown}
                  maxLength="14"
                  className={`px-4 py-2.5 bg-white border ${
                    errors.phone ? "border-red-500" : "border-gray-400"
                  } text-slate-900 w-full text-sm rounded-md focus:outline-blue-600`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="text-sm text-slate-900 font-medium block mb-2">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Address Line"
                  value={customer.address}
                  onChange={(e) => {
                    const newAddr = e.target.value;
                    setCustomer({ ...customer, address: newAddr });
                    localStorage.setItem("USER_ADDRESS", newAddr);
                  }}
                  className={`px-4 py-2.5 bg-white border ${
                    errors.address ? "border-red-500" : "border-gray-400"
                  } text-slate-900 w-full text-sm rounded-md focus:outline-blue-600`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl text-slate-900 font-semibold mb-6">
                Payment
              </h2>

              <div className="flex gap-6 mb-6">
                <div className="flex items-center justify-start gap-8">
                  <input
                    type="radio"
                    name="pay"
                    className="w-5 h-5 cursor-pointer"
                    id="card"
                    onChange={() => setSelectedPayment("card")}
                    checked={selectedPayment === "card"}
                  />
                  <label
                    htmlFor="card"
                    className="flex gap-2 cursor-pointer items-center"
                  >
                    <img
                      src="https://readymadeui.com/images/visa.webp"
                      className="w-12"
                      alt="visa"
                    />
                    <img
                      src="https://readymadeui.com/images/american-express.webp"
                      className="w-12"
                      alt="amex"
                    />
                    <img
                      src="https://readymadeui.com/images/master.webp"
                      className="w-12"
                      alt="mastercard"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-start gap-8">
                  <input
                    type="radio"
                    name="pay"
                    className="w-5 h-5 cursor-pointer"
                    id="paypal"
                    onChange={() => setSelectedPayment("paypal")}
                    checked={selectedPayment === "paypal"}
                  />
                  <label
                    htmlFor="paypal"
                    className="flex items-center cursor-pointer"
                  >
                    <img
                      src="https://readymadeui.com/images/paypal.webp"
                      className="w-20"
                      alt="paypal"
                    />
                  </label>
                </div>
              </div>

              {selectedPayment === "paypal" && (
                <div className="mt-6 bg-transparent flex flex-col items-center justify-end">
                  <div className="w-full max-w-xs">
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "paypal",
                      }}
                      createOrder={(data, actions) =>
                        actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: finalPrice,
                              },
                            },
                          ],
                        })
                      }
                      onApprove={(data, actions) =>
                        actions.order.capture().then((details) => {
                          if (validateForm()) {
                            Swal.fire({
                              icon: "success",
                              title: "Payment Successful!",
                              text: `Transaction completed by ${details.payer.name.given_name}`,
                            });
                            handleCompletePurchase();
                          }
                        })
                      }
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        Swal.fire({
                          icon: "error",
                          title: "Payment Failed",
                          text: "Something went wrong with PayPal.",
                        });
                      }}
                    />
                  </div>
                </div>
              )}
              {selectedPayment === "card" && (
                <div className="grid lg:grid-cols-2 gap-y-6 gap-x-4 mt-6">
                  <div>
                    <label className="text-sm text-slate-900 font-medium block mb-2">
                      Cardholder's Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Cardholder's Name"
                      className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-900 font-medium block mb-2">
                      Card Number
                    </label>
                    <input
                      type="number"
                      placeholder="Enter Card Number"
                      className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-900 font-medium block mb-2">
                      Expiry
                    </label>
                    <input
                      type="month"
                      className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-900 font-medium block mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="Enter CVV"
                      maxLength="3"
                      className="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 max-lg:flex-col mt-8">
              <button
                type="button"
                className="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-gray-200 hover:bg-gray-300 border border-gray-300 text-slate-900 max-lg:order-1 cursor-pointer"
                onClick={() => navigate("/Products")}
              >
                Continue Shopping
              </button>
              <button
                type="button"
                className="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={handleCompletePurchase}
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
