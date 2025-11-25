import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "./Context/auth-context";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, setLoading } = useContext(AuthContext);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username)
      newErrors.username = "Username or Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const userData = await login(formData.username, formData.password);

      if (!userData?.user) {
        toast.error("Invalid credentials. Please try again.");
        return;
      }

      toast.success("Logged in successfully!");
      navigate("/Products");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-[480px] w-full bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-center text-slate-900">
          Log in
        </h1>

        <form className="mt-12 space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Username or Email
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username or email"
              className="w-full px-4 py-3 border rounded-md text-sm text-slate-900 outline-blue-600"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 border rounded-md text-sm text-slate-900 outline-blue-600"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-900">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-slate-600 text-sm mt-6 text-center">
            Don't have an account?
            <a
              onClick={() => navigate("/Register")}
              className="text-blue-600 font-medium hover:underline ml-1 cursor-pointer"
            >
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
