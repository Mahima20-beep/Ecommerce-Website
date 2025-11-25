import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductContext } from "./Context/products-context";
import { WishlistContext } from "./Context/wishlist-context";
import { AuthContext } from "./Context/auth-context";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { cartItems, addToCart, increaseItems, decreaseItems, getImageSrc } =
    useContext(ProductContext);
  const { user } = useContext(AuthContext);
  const { addToWishlist } = useContext(WishlistContext);

  const { id } = useParams();
  const [singleProduct, setSingleProduct] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const localProducts =
          JSON.parse(localStorage.getItem("PRODUCTSADMIN")) || [];
        const localProduct = localProducts.find((p) => p.id === parseInt(id));

        if (localProduct) {
          setSingleProduct(localProduct);
        } else {
          const res = await fetch(`https://dummyjson.com/products/${id}`);
          const apiProduct = await res.json();
          setSingleProduct(apiProduct);
        }
      } catch (error) {
        console.error("Failed to load the product:", error);
      }
    };

    if (id) loadProduct();
  }, [id]);

  if (!singleProduct) return <p>Loading...</p>;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++)
      stars.push(<FaStar key={`full-${i}`} />);
    if (halfStar) stars.push(<FaStarHalfAlt key="half" />);
    for (let i = 0; i < emptyStars; i++)
      stars.push(<FaRegStar key={`empty-${i}`} />);

    return stars;
  };

  const imageSrc = getImageSrc(singleProduct.thumbnail);

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden pt-4 relative">
      <div className="p-4 py-16">
        <div className="lg:max-w-3xl max-w-xl mx-auto">
          <div className="grid items-stretch grid-cols-1 lg:grid-cols-2 max-lg:gap-4 max-sm:gap-4">
            {/* Image Section */}
            <div className="w-full lg:sticky top-0 flex">
              <div className="flex flex-col gap-2 w-full">
                <div className="bg-white shadow-sm p-0 rounded-xl w-[90%] mx-auto">
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={singleProduct.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">No image found</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="w-full flex flex-col">
              <div className="mt-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  {singleProduct.title}
                </h1>
                <p className="text-slate-500 mt-1 text-sm mb-4">
                  {singleProduct.description}
                </p>
                <h4 className="text-base sm:text-lg font-semibold text-slate-700">
                  ${singleProduct.price}
                </h4>

                <div className="flex items-center gap-4 mt-2 text-yellow-500 text-lg">
                  <span>{singleProduct.rating}</span>
                  {renderStars(singleProduct.rating)}
                  <span className="text-slate-500">|</span>
                  <p className="text-md text-slate-500">
                    Stock: {singleProduct.stock}
                  </p>
                  <div
                    className="bg-slate-300 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                    onClick={() => {
                      user
                        ? (addToWishlist(singleProduct), navigate("/Wishlist"))
                        : addToWishlist(singleProduct);
                      toast.success(
                        `${singleProduct.title} has been added to Wishlist!`
                      );
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      className="fill-slate-800 inline-block"
                      viewBox="0 0 64 64"
                    >
                      <path d="M45.5 4A18.53 18.53 0 0 0 32 9.86 18.5 18.5 0 0 0 0 22.5C0 40.92 29.71 59 31 59.71a2 2 0 0 0 2.06 0C34.29 59 64 40.92 64 22.5A18.52 18.52 0 0 0 45.5 4ZM32 55.64C26.83 52.34 4 36.92 4 22.5a14.5 14.5 0 0 1 26.36-8.33 2 2 0 0 0 3.27 0A14.5 14.5 0 0 1 60 22.5c0 14.41-22.83 29.83-28 33.14Z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-300" />

              {/* Cart Controls */}
              <div className="flex gap-4 items-center mb-2">
                <div className="flex gap-5 items-center border border-gray-300 bg-white px-4 py-2 w-max rounded-lg">
                  <button
                    type="button"
                    onClick={() => decreaseItems(singleProduct.id)}
                    className="border-0 outline-0 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-2.5 h-2.5"
                      viewBox="0 0 121.805 121.804"
                    >
                      <path d="M7.308 68.211h107.188a7.309 7.309 0 0 0 7.309-7.31 7.308 7.308 0 0 0-7.309-7.309H7.308a7.31 7.31 0 0 0 0 14.619z" />
                    </svg>
                  </button>

                  <span className="text-sm font-medium rounded-lg">
                    {cartItems[singleProduct.id]?.qty || 0}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseItems(singleProduct.id)}
                    className="border-0 outline-0 cursor-pointer"
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

                <button
                  type="button"
                  className="py-2 px-4 cursor-pointer border bg-white hover:bg-slate-50 text-slate-900 text-sm font-medium rounded-lg"
                  onClick={() => {
                    if (isAdded) return;
                    if (user) {
                      addToCart(singleProduct.id);
                      navigate("/Cart");
                      setIsAdded(true);
                    } else {
                      toast.success(
                        `${singleProduct.title} has been added to Cart!`
                      );
                    }
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
