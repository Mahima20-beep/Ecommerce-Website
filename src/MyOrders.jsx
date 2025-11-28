import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowDropdown } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateCart, applyPromo } from "./Redux/Slice/cartSlice";

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const shipping = 40;
  const taxes = 5.0;

  const [orders, setOrders] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const orderIds = JSON.parse(localStorage.getItem("ORDER_IDS") || "[]");
    const loadedOrders = orderIds
      .map((id) => {
        const data = localStorage.getItem(id);
        return data ? JSON.parse(data) : null;
      })
      .filter(Boolean);
    setOrders(loadedOrders);
  }, []);

  const handleDeleteOrder = (orderId) => {
    const orderIds = JSON.parse(localStorage.getItem("ORDER_IDS") || "[]");
    const updatedIds = orderIds.filter((id) => id !== orderId);
    localStorage.setItem("ORDER_IDS", JSON.stringify(updatedIds));
    localStorage.removeItem(orderId);
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
  };

  const handleOrderAgain = (items) => {
    const newCart = {};
    items.forEach((item) => {
      newCart[item.id] = { ...item };
    });
    dispatch(applyPromo({ code: "", discount: 0 }));
    dispatch(updateCart(newCart));
    toast.success("Items added to cart!");
    navigate("/Cart");
  };

  if (orders.length === 0) {
    return (
      <div className="text-center p-8">
        <p>No past orders found. Please place an order first.</p>
      </div>
    );
  }

  const formatDateTime = (dateValue) => {
    const d = new Date(dateValue);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getArrivalDate = (ts) => {
    const d = new Date(ts);
    d.setDate(d.getDate() + 1);
    return formatDateTime(d);
  };

  const getDeliveryDate = (ts) => {
    const d = new Date(ts);
    d.setDate(d.getDate() + 11);
    return formatDateTime(d);
  };

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith("http")) return thumbnail;
    return `/images/${thumbnail}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Past Orders
        </h2>

        {orders.map((order, index) => {
          const {
            items = [],
            subtotal = 0,
            discount = 0,
            total = 0,
            timestamp,
            orderId,
            trackingId,
          } = order;

          const timePlaced = formatDateTime(timestamp);
          const arrivedAtWarehouse = getArrivalDate(timestamp);
          const expectedDelivery = getDeliveryDate(timestamp);

          const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

          return (
            <div
              key={orderId}
              className="mt-6 shadow-md p-6 sm:p-8 rounded-xl border border-gray-200"
            >
              <div
                className="flex items-center justify-between w-full cursor-pointer border-b border-gray-300 pb-6"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4 mr-10">
                  <div className="flex space-x-2">
                    {items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={getImageSrc(item.thumbnail)}
                        className="w-12 h-12 rounded-md object-cover shadow-sm border border-gray-200"
                        alt={item.title}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">
                      Out for delivery
                    </p>
                    <p className="text-slate-500 text-sm">
                      Placed on {timePlaced}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 ">
                  <p className="text-slate-900 font-bold text-lg whitespace-nowrap">
                    ${Number(total).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderAgain(items);
                      }}
                      className="px-5 py-2.5 text-xs font-semibold bg-transparent rounded-lg transition whitespace-nowrap hover:border"
                    >
                      Order Again
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(orderId);
                      }}
                      className="px-5 py-2.5 text-xs font-semibold bg-red-500 text-white rounded-lg transition whitespace-nowrap hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  <IoMdArrowDropdown
                    size={24}
                    className={`text-slate-600 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-500 ${
                  openIndex === index
                    ? "max-h-[5000px] opacity-100 mt-6"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="border-b border-gray-300 pb-6">
                  <div className="pb-4 flex items-center justify-between gap-4">
                    <span className="flex items-center text-md font-semibold">
                      Order ID: {orderId}
                    </span>
                    <span className="text-md font-semibold text-slate-700">
                      {itemCount} items
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">
                      Order Tracking
                    </h3>
                    <h3 className="text-lg font-medium text-slate-600">
                      Tracking ID: #{trackingId}
                    </h3>
                  </div>

                  <div className="flex items-start max-md:flex-col max-md:gap-y-8">
                    <div className="w-full">
                      <h4 className="text-[15px] font-semibold text-slate-900">
                        Order placed
                      </h4>
                      <p className="text-sm text-slate-600 font-medium mt-1">
                        {timePlaced}
                      </p>
                    </div>
                    <div className="w-full">
                      <h4 className="text-[15px] font-semibold text-slate-900">
                        Arrived at courier warehouse
                      </h4>
                      <p className="text-sm text-slate-600 font-medium mt-1">
                        {arrivedAtWarehouse}
                      </p>
                    </div>
                    <div className="w-full">
                      <h4 className="text-[15px] font-semibold text-slate-900">
                        Expected delivery
                      </h4>
                      <p className="text-sm text-slate-600 font-medium mt-1">
                        {expectedDelivery}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    {itemCount} items in order
                  </h3>

                  {items.map((item) => (
                    <div key={item.id} className="space-y-4 mb-6">
                      <div className="grid md:grid-cols-4 items-center gap-4">
                        <div className="col-span-2 flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 p-2 rounded-md shrink-0 border border-gray-200">
                            {getImageSrc(item.thumbnail) ? (
                              <img
                                src={getImageSrc(item.thumbnail)}
                                alt={item.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">No image</p>
                            )}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-medium text-slate-900">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[15px] font-medium text-slate-600">
                            Quantity
                          </h4>
                          <p className="text-[15px] font-medium text-slate-900 mt-1">
                            x{item.qty}
                          </p>
                        </div>

                        <div className="ml-auto">
                          <h4 className="text-[15px] font-medium text-slate-900">
                            ${(item.price * item.qty).toFixed(2)}
                          </h4>
                        </div>
                      </div>
                      <hr className="border-gray-300" />
                    </div>
                  ))}

                  <div className="bg-gray-100 rounded-md p-4 sm:p-6 h-max mt-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">
                      Bill Summary
                    </h3>

                    <ul className="font-medium mt-6 space-y-4">
                      <li className="flex flex-wrap gap-4 text-slate-600 text-sm">
                        Subtotal
                        <span className="ml-auto text-slate-900 font-semibold">
                          ${Number(subtotal).toFixed(2)}
                        </span>
                      </li>
                      <li className="flex flex-wrap gap-4 text-sm text-slate-600">
                        Discount
                        <span className="ml-auto text-orange-800 font-semibold">
                          - ${Number(discount).toFixed(2)}
                        </span>
                      </li>
                      <li className="flex flex-wrap gap-4 text-slate-600 text-sm">
                        Shipping
                        <span className="ml-auto text-slate-900 font-semibold">
                          ${Number(shipping || 0).toFixed(2)}
                        </span>
                      </li>
                      <li className="flex flex-wrap gap-4 text-slate-600 text-sm">
                        Taxes
                        <span className="ml-auto text-slate-900 font-semibold">
                          ${Number(taxes || 0).toFixed(2)}
                        </span>
                      </li>
                      <hr className="border-gray-300" />
                      <li className="flex flex-wrap gap-4 text-red-900 text-md">
                        Total
                        <span className="ml-auto text-red-900 text-md">
                          <u>${Number(total).toFixed(2)}</u>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
