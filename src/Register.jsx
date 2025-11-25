import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "./Context/auth-context";
import supabase from "./supabase";

const Register = () => {
  const navigate = useNavigate();
  const { setLoading, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

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
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast.error(error.message || "Registration failed.");
        return;
      }

      const user = data.user;

      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            username: formData.username,
            email: formData.email,
          },
        ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast.error("Error saving profile data.");
          return;
        }
      }

      toast.success("Account created successfully!");
      navigate("/Login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-[480px] w-full bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-center text-slate-900">
          Register
        </h1>

        <form className="mt-12 space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full px-4 py-3 border rounded-md text-sm text-slate-900 outline-blue-600"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-3 border rounded-md text-sm text-slate-900 outline-blue-600"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
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

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-slate-600 text-sm mt-6 text-center">
            Already have an account?
            <a
              onClick={() => navigate("/Login")}
              className="text-blue-600 font-medium hover:underline ml-1 cursor-pointer"
            >
              Log in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
