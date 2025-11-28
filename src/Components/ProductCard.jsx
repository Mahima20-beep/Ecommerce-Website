import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../Redux/Slice/productsSlice";
import {
  addToCart,
  decreaseItem,
  increaseItem,
  applyPromo,
} from "../Redux/Slice/cartSlice";
import { addToWishlist } from "../Redux/Slice/wishlistSlice";

const ProductCard = () => {
  const dispatch = useDispatch();

  const { combinedProducts, isLoading, isError } = useSelector(
    (state) => state.products
  );

  const cartItems = useSelector((state) => state.cart.cartItems);

  useEffect(() => {
    if (combinedProducts.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, combinedProducts.length]);

  const {
    selectedBrand,
    selectedCategory,
    selectedMinPrice,
    selectedMaxPrice,
  } = useSelector((state) => state.filters);

  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    let temp = [...combinedProducts];

    if (selectedBrand.length > 0) {
      temp = temp.filter((item) => selectedBrand.includes(item.brand));
    }

    if (selectedCategory.length > 0) {
      temp = temp.filter((item) => selectedCategory.includes(item.category));
    }

    if (selectedMinPrice || selectedMaxPrice) {
      temp = temp.filter(
        (item) =>
          item.price >= selectedMinPrice && item.price <= selectedMaxPrice
      );
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      temp = temp.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower)
      );
    }

    setResult(temp);
    setCurrentPage(1);
  }, [
    combinedProducts,
    keyword,
    selectedBrand,
    selectedCategory,
    selectedMinPrice,
    selectedMaxPrice,
  ]);

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };

  const productsPerPage = 20;
  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  const currentSlice = result.slice(firstIndex, lastIndex);
  const npages = Math.ceil(result.length / productsPerPage);
  const numbers = [...Array(npages + 1).keys()].slice(1);

  function prePage() {
    if (currentPage !== 1) setCurrentPage(currentPage - 1);
  }
  function changeCPage(id) {
    setCurrentPage(id);
  }
  function nextPage() {
    if (currentPage !== npages) setCurrentPage(currentPage + 1);
  }

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;

    if (Array.isArray(thumbnail)) {
      const firstThumb = thumbnail[0];
      if (typeof firstThumb === "string") return firstThumb;
      if (firstThumb?.data_url) return firstThumb.data_url;
      if (firstThumb?.url) return firstThumb.url;
      return null;
    } else if (typeof thumbnail === "string") {
      return thumbnail;
    }

    return null;
  };

  const marqueeCoupons = [
    "PRODUCT50 (ABOVE SUBTOTAL OF $500)",
    "PRODUCT100 (ABOVE SUBTOTAL OF $1000)",
  ];

  const handleCouponClick = (coupon) => {
    const code = coupon.split(" ")[0];

    dispatch(applyPromo({ code: code, discount: 0 }));

    toast.success(`Coupon ${code} applied!`);
  };

  if (isLoading) return <div className="p-5">Loading products...</div>;
  if (isError) return <div className="p-5 text-red-500">{isError}</div>;

  return (
    <div className="flex-1 p-5 ml-1">
      <div className="relative left-1/2 w-[90%] max-w-5xl z-10 mb-4 -translate-x-1/2">
        <div className="overflow-hidden bg-gray-200 rounded-lg shadow-inner">
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[
              ...marqueeCoupons,
              ...marqueeCoupons,
              ...marqueeCoupons,
              ...marqueeCoupons,
            ].map((coupon, i) => (
              <button
                key={i}
                onClick={() => handleCouponClick(coupon)}
                className="text-sm font-medium text-gray-800 px-4 py-3 cursor-pointer transition hover:text-indigo-600"
              >
                {coupon}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mb-6 flex justify-start">
        <input
          name="search-products"
          value={keyword}
          type="text"
          placeholder="Search products..."
          onChange={handleSearch}
          className="w-full max-w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
        />
      </div>

      {currentSlice.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 cursor-pointer">
          {currentSlice.map((item) => {
            const quantity = cartItems[item.id]?.qty || 0;
            const imageSrc = getImageSrc(item.thumbnail);

            return (
              <div
                key={item.id}
                className="bg-white flex flex-col rounded-sm overflow-hidden shadow-md hover:scale-[1.01] transition-all relative"
                onClick={() => navigate(`/${item.title}/${item.id}`)}
              >
                <div className="w-full flex justify-center items-center bg-gray-50 min-h-64">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="w-full h-64 object-cover block"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">No image found</p>
                  )}
                </div>

                <div className="p-3">
                  <h5 className="text-md font-semibold text-slate-900 line-clamp-2">
                    {item.title}
                  </h5>
                  <div className="mt-1 flex items-center justify-between">
                    <h6 className="text-md font-semibold text-slate-900">
                      ${item.price}
                    </h6>

                    <div
                      className="bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(addToWishlist(item));
                        toast.success(
                          <span>
                            <b>{item.title}</b> added to Wishlist!
                          </span>
                        );
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px"
                        className="fill-slate-800 inline-block"
                        viewBox="0 0 64 64"
                      >
                        <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="min-h-[40px] p-3 !pt-0 cursor-pointer">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between w-full">
                      <button
                        type="button"
                        className="border-0 outline-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(decreaseItem(item.id));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-2.5 h-2.5"
                          viewBox="0 0 121.805 121.804"
                        >
                          <path d="M7.308 68.211h107.188a7.309 7.309 0 0 0 7.309-7.31 7.308 7.308 0 0 0-7.309-7.309H7.308a7.31 7.31 0 0 0 0 14.619z" />
                        </svg>
                      </button>

                      <span className="text-sm text-gray-400 font-medium">
                        Item Added!
                      </span>

                      <button
                        type="button"
                        className="border-0 outline-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(increaseItem(item.id));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-2.5 h-2.5"
                          viewBox="0 0 512 512"
                        >
                          <path d="M256 509.892c-19.058 0-34.5-15.442-34.5-34.5V36.608c0-19.058 15.442-34.5 34.5-34.5s34.5 15.442 34.5 34.5v438.784c0 19.058-15.442 34.5-34.5 34.5z" />
                          <path d="M475.392 290.5H36.608c-19.058 0-34.5-15.442-34.5-34.5s15.442-34.5 34.5-34.5h438.784c19.058 0 34.5 15.442 34.5 34.5s-15.442 34.5-34.5 34.5z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(addToCart(item));
                        toast.success(
                          <span>
                            <b>{item.title}</b> added to Cart!
                          </span>
                        );
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-2 font-medium tracking-wide rounded-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ml-2">No Products found...</div>
      )}

      {npages > 1 && (
        <nav className="flex justify-center my-8">
          <ul className="flex gap-2">
            <li>
              <button
                onClick={prePage}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                Prev
              </button>
            </li>

            {numbers.map((n, i) => (
              <li key={i}>
                <button
                  onClick={() => changeCPage(n)}
                  className={`px-4 py-2 border border-gray-300 rounded-lg font-semibold transition cursor-pointer ${
                    currentPage === n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={nextPage}
                disabled={currentPage === npages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ProductCard;
