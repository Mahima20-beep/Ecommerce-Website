import { createContext, useState, useEffect } from "react";
import supabase from "../supabase";
import { useDispatch } from "react-redux";
import { clearCart } from "../Redux/Slice/cartSlice";
import { clearWishlist } from "../Redux/Slice/wishlistSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const currentEmail = user.email;
    const previousEmail = localStorage.getItem("LAST_EMAIL");

    if (previousEmail && previousEmail !== currentEmail) {
      dispatch(clearCart());
      dispatch(clearWishlist());
      localStorage.removeItem("USER_ADDRESS");
      localStorage.removeItem("ORDERS");

      window.dispatchEvent(new Event("reset_address"));
      window.dispatchEvent(new Event("reset_orders"));

      setUser(null);
    }

    localStorage.setItem("LAST_EMAIL", currentEmail);
  }, [user]);

  const login = async (usernameOrEmail, password) => {
    try {
      setLoading(true);

      let email = usernameOrEmail;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
      if (!isEmail) {
        const { data: userRecord, error: lookupError } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", usernameOrEmail)
          .single();

        if (lookupError || !userRecord) {
          throw new Error("No account found with that username.");
        }

        email = userRecord.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
  };

  const value = {
    user,
    loading,
    setLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
