import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/auth-context";
import { IoMdHome } from "react-icons/io";
import { BsFillPersonFill } from "react-icons/bs";
import { IoLogInOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import supabase from "../supabase";
import WishIcon from "./WishIcon";
import CartIcon from "./CartIcon";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setProfileUrl(null);
      return;
    }

    const loadPic = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_picture, username")
        .eq("id", user.id)
        .single();

      if (data?.profile_picture) {
        setProfileUrl(`${data.profile_picture}?t=${Date.now()}`);
      }
    };

    loadPic();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadPic();
    });

    return () => listener.subscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          if (payload.new.id === user?.id) {
            if (payload.new.profile_picture) {
              setProfileUrl(`${payload.new.profile_picture}?t=${Date.now()}`);
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleProtectedClick = (path) => {
    if (!user) {
      toast.error("Please Register/Log in to access this feature", {
        id: "login-required",
        style: { marginTop: "60px" },
      });
    } else {
      navigate(path);
    }
  };

  const initials =
    user?.email?.split("@")[0]?.slice(0, 2)?.toUpperCase() || "U";

  return (
    <header className="top-0 left-0 w-full bg-white shadow-md py-7 px-4 md:px-8 flex items-center justify-center z-[9999]">
      <div
        className="absolute left-4 md:left-8 flex items-center cursor-pointer w-10 h-10"
        onClick={() => navigate("/")}
      >
        <IoMdHome size={40} />
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-slate-900 text-center">
        <span className="cursor-pointer" onClick={() => navigate("/Products")}>
          My Products
        </span>
      </h1>

      <div className="absolute right-4 md:right-8 flex items-center space-x-4 w-max">
        <button onClick={() => handleProtectedClick("/Wishlist")}>
          <WishIcon />
        </button>

        <button onClick={() => handleProtectedClick("/Cart")}>
          <CartIcon />
        </button>

        {!user ? (
          <>
            <BsFillPersonFill
              className="w-9 h-9 cursor-pointer"
              onClick={() => navigate("/Register")}
            />
            <IoLogInOutline
              className="w-9 h-9 cursor-pointer"
              onClick={() => navigate("/Login")}
            />
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-200"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{initials}</span>
              )}
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    navigate("/Profile");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  My Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/MyOrders");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  My Orders
                </button>

                <button
                  onClick={async () => {
                    await logout();
                    toast.success("Logged out successfully!", {
                      style: { marginTop: "60px" },
                    });
                    navigate("/");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
