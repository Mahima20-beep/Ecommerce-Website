import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/auth-context";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AdminContextProvider } from "./Context/admin-context";
import Dashboard from "./Components/Dashboard";
import Cart from "./Components/Cart";
import ProductDetail from "./ProductDetail";
import Wishlist from "./Components/Wishlist";
import Toastbox from "./Components/Toastbox";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Register from "./Register";
import Login from "./Login";
import LandingPage from "./LandingPage";
import Checkout from "./Checkout";
import Category from "./Category";
import ProductAdmin from "./ProductAdmin";
import Profile from "./Profile";
import OrderSummary from "./OrderSummary";
import MyOrders from "./MyOrders";

const App = () => {
  return (
    <PayPalScriptProvider
      options={{
        clientId:
          "AdKzH6PjajyWGxcWu8tIfrhtANpzWoP60vXXxC2o147R4EtdC6Sifab16b-yHzDHrvpkdaNUjvPpnK0e",
        currency: "USD",
        components: "buttons",
      }}
    >
      <AdminContextProvider>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Products" element={<Dashboard />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/:name/:id" element={<ProductDetail />} />
            <Route path="/Wishlist" element={<Wishlist />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Checkout" element={<Checkout />} />
            <Route path="/Category" element={<Category />} />
            <Route path="/ProductAdmin" element={<ProductAdmin />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/OrderSummary" element={<OrderSummary />} />
            <Route path="/MyOrders" element={<MyOrders />} />
          </Routes>
          <Footer />
          <Toastbox />
        </AuthProvider>
      </AdminContextProvider>
    </PayPalScriptProvider>
  );
};

export default App;
