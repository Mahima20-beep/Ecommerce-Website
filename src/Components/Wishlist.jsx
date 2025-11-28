import { FaPencilAlt } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FaHeartCircleXmark } from "react-icons/fa6";
import { addToCart } from "../Redux/Slice/cartSlice";
import { removeFromWishlist } from "../Redux/Slice/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { wishlistItems } = useSelector((state) => state.wishlist);

  const getImageSrc = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith("http")) return thumbnail;
    return `/images/${thumbnail}`;
  };

  const handleRemoveWishlist = (item) => {
    Swal.fire({
      title: `Are you sure you want to remove ${item.title} from Wishlist?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0B6623",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFromWishlist(item.id));
        Swal.fire({
          title: "Removed!",
          text: `${item.title} has been removed from your wishlist.`,
          icon: "success",
        });
      }
    });
  };

  return (
    <div className="min-h-screen lg:max-w-5xl max-lg:max-w-2xl mx-auto bg-white p-4 mt-7">
      <div className="w-full max-w-6xl bg-gray-100 p-8 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-slate-900 flex justify-between items-center mb-6">
          My Wishlist
          <FaPencilAlt className=" text-gray-600" />
        </h3>
        <hr className="border-gray-300 mb-6" />

        {Object.values(wishlistItems).length === 0 ? (
          <div className="flex flex-col justify-center items-center text-center py-24">
            <FaHeartCircleXmark className="text-gray-500 h-16 w-16 mb-4" />
            <p className="text-gray-600 font-medium mb-6">
              Your wishlist is empty!
            </p>
            <button
              onClick={() => navigate("/Products")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(wishlistItems).map((item) => {
              const imageSrc = getImageSrc(item.thumbnail);
              return (
                <div
                  key={`${item.id}-${item.title}`}
                  className="grid sm:grid-cols-5 items-center gap-4 text-center bg-gray-100 rounded-lg p-4 transition"
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">No image found</p>
                  )}
                  <span className="flex justify-center font-medium text-slate-800">
                    {item.title}
                  </span>
                  <span className="flex justify-center text-gray-700">
                    ${item.price}
                  </span>
                  <button
                    className="mx-auto text-xs px-3 py-2 font-medium w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(addToCart(item));
                      toast.success(
                        <span>
                          <b>{item.title}</b> has been Added To Cart!
                        </span>
                      );
                      dispatch(removeFromWishlist(item.id));
                    }}
                  >
                    Add to Cart
                  </button>
                  <div
                    className="cursor-pointer text-red-500 flex justify-center hover:text-red-600 transition"
                    onClick={() => handleRemoveWishlist(item)}
                  >
                    <MdDeleteOutline size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
