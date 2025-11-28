import { useState, useEffect } from "react";

const OrderSummary = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("LATEST_ORDER");
    if (saved) {
      setOrder(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("LATEST_ORDER");
    };

    const handleNavigate = () => {
      localStorage.removeItem("LATEST_ORDER");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleNavigate();
    };
  }, []);

  if (!order) {
    return (
      <div className="text-center p-8">
        <p>No order found. Please complete checkout first.</p>
      </div>
    );
  }

  const {
    customer,
    items,
    subtotal,
    discount,
    total,
    timestamp,
    taxes,
    shipping,
  } = order;

  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    const digits = phone.replace(/[^\d]/g, "").slice(0, 10);
    if (digits.length === 0) return "N/A";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatDateTime = (dateValue) => {
    const d = new Date(dateValue);

    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const timePlaced = formatDateTime(timestamp);

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith("http")) return thumbnail;
    return `/images/${thumbnail}`;
  };

  return (
    <div className="bg-white p-4">
      <div className="max-w-6xl mx-auto max-lg:max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Order Summary
          </h1>
          <div className="mt-6">
            <p className="text-sm text-slate-900 font-medium">
              Order ID: {order.orderId}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Placed on {timePlaced}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-y-6 gap-8 mt-12">
          <div className="lg:col-span-2 max-lg:-order-1 space-y-6">
            <div className="border border-gray-200 shadow-sm rounded-lg p-4 space-y-4">
              {items.map((item) => {
                const imageSrc = getImageSrc(item.thumbnail);
                return (
                  <div
                    key={item.id}
                    className="grid sm:grid-cols-3 items-center gap-4"
                  >
                    <div className="sm:col-span-2 flex items-center gap-4">
                      <div className="w-24 h-24 max-sm:w-20 max-sm:h-20 shrink-0 bg-gray-100 p-2 rounded-md">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <p className="text-gray-400 text-xs">No image</p>
                        )}
                      </div>
                      <div>
                        <h3 className="sm:text-base text-sm font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <div className="sm:ml-auto">
                      <h4 className="sm:text-lg text-base font-semibold text-slate-900">
                        ${(item.price * item.qty).toFixed(2)}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border border-gray-200 shadow-sm rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-6">
                Billing Summary
              </h3>
              <ul className="text-slate-500 font-medium space-y-4">
                <li className="flex flex-wrap gap-4 text-sm">
                  Subtotal
                  <span className="ml-auto text-slate-900 font-semibold">
                    ${subtotal}
                  </span>
                </li>
                <li className="flex flex-wrap gap-4 text-sm">
                  Discount
                  <span className="ml-auto text-orange-800 font-semibold">
                    - ${discount}
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
                <hr className="border-gray-300 mt-4 mb-8" />
                <li className="flex flex-wrap gap-4 text-red-900 text-md">
                  Total
                  <span className="ml-auto text-red-900 text-md">
                    <u>${total}</u>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 shadow-sm rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 font-medium">Name</p>
                  <p className="text-slate-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Email</p>
                  <p className="text-slate-900 break-words">{customer.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Phone</p>
                  <p className="text-slate-900">
                    {formatPhoneNumber(customer.phone)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 shadow-sm rounded-lg p-4">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Shipping Address
              </h3>
              <p className="text-slate-900 text-sm">{customer.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
