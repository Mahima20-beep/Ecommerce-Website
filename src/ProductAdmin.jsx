import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "./Context/admin-context";
import ImageUploading from "react-images-uploading";
import toast from "react-hot-toast";
import { FaPencilAlt } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

const ProductAdmin = () => {
  const navigate = useNavigate();
  const { categories, setCategories } = useContext(AdminContext);

  const [error, setError] = useState({});
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("PRODUCTSADMIN");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    thumbnail: [],
  });

  useEffect(() => {
    if (!categories.length) {
      const savedCategories = localStorage.getItem("CATEGORIES");
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    let err = "";
    switch (name) {
      case "title":
        if (!value.trim()) err = "Product name is required.";
        break;
      case "category":
        if (!value) err = "Please select a category.";
        break;
      case "price":
        if (!value || value <= 0) err = "Enter a valid price.";
        break;
      case "description":
        if (!value.trim()) err = "Description is required.";
        break;
      case "thumbnail":
        if (!value || value.length === 0) err = "Attach at least one image.";
        break;
      default:
        break;
    }
    setError((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const onChange = (imageList) => {
    setFormData({ ...formData, thumbnail: imageList });
    validateField("thumbnail", imageList);
  };

  const handleSubmit = () => {
    const fields = ["title", "category", "price", "description", "thumbnail"];
    let hasError = false;
    fields.forEach((field) => {
      if (validateField(field, formData[field])) hasError = true;
    });
    if (hasError) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const categoryList = JSON.parse(localStorage.getItem("CATEGORIES") || "[]");
    const selectedCategory = categoryList.find(
      (cat) => cat.slug === formData.category
    );

    const newProduct = {
      ...formData,
      category: selectedCategory ? selectedCategory.slug : formData.category,
      id: Date.now(),
      dateModified: new Date().toLocaleString(),
      thumbnail: formData.thumbnail,
    };

    let updatedProducts;
    if (isEditing) {
      updatedProducts = [...products];
      updatedProducts[editIndex] = newProduct;
      toast.success("Product updated successfully");
    } else {
      updatedProducts = [newProduct, ...products];
      toast.success("Product saved successfully");
    }

    setProducts(updatedProducts);
    window.dispatchEvent(new Event("storage"));
    localStorage.setItem("PRODUCTSADMIN", JSON.stringify(updatedProducts));
    setFormData({
      title: "",
      category: "",
      price: "",
      description: "",
      thumbnail: [],
    });
    setIsEditing(false);
    setEditIndex(null);

    const newIndex = isEditing ? editIndex : 0;
    setHighlightIndex(newIndex);
    setTimeout(() => setHighlightIndex(null), 2000);
  };

  const slug = formData.title
    ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div className="flex-grow flex flex-col items-center justify-start mt-10 px-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Product Management Form
        </h1>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="max-w-4xl w-full mx-auto"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Product Name"
                className={`px-4 py-3 w-full border rounded-md outline-[#007bff] text-sm text-black ${
                  error.title ? "border-red-500" : "border-gray-200"
                }`}
              />
              {error.title && (
                <p className="text-red-500 text-sm mt-1">{error.title}</p>
              )}
            </div>

            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Slug
              </label>
              <div className="px-4 py-3 pr-8 w-full text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-100">
                {slug}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Product Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Description"
                className={`px-4 py-3 pr-8 text-black w-full text-sm border outline-[#007bff] rounded-md h-32 resize-none ${
                  error.description ? "border-red-500" : "border-gray-200"
                }`}
              ></textarea>
              {error.description && (
                <p className="text-red-500 text-sm mt-1">{error.description}</p>
              )}
            </div>

            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-4 py-3 w-full border rounded-md outline-[#007bff] text-sm text-black ${
                  error.category ? "border-red-500" : "border-gray-200"
                }`}
              >
                <option value="">Select Category</option>
                {JSON.parse(localStorage.getItem("CATEGORIES") || "[]").map(
                  (c, idx) => (
                    <option key={idx} value={c.slug}>
                      {c.slug}
                    </option>
                  )
                )}
              </select>
              {error.category && (
                <p className="text-red-500 text-sm mt-1">{error.category}</p>
              )}
            </div>

            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Price <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Price"
                className={`px-4 py-3 w-full border outline-[#007bff] rounded-md text-sm text-black ${
                  error.price ? "border-red-500" : "border-gray-200"
                }`}
              />
              {error.price && (
                <p className="text-red-500 text-sm mt-1">{error.price}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Image <span className="text-red-600">*</span>
              </label>
              <ImageUploading
                multiple
                value={formData.thumbnail}
                onChange={onChange}
                dataURLKey="data_url"
                acceptType={["webp"]}
              >
                {({ imageList, onImageUpload, onImageRemove }) => (
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={onImageUpload}
                      className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-300"
                    >
                      Select Image
                    </button>
                    {imageList.map((image, index) => (
                      <div
                        key={index}
                        className={`relative ${
                          highlightIndex === index ? "bg-yellow-100" : ""
                        }`}
                      >
                        <img
                          src={image.data_url}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => onImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full text-xs px-1 hover:bg-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ImageUploading>
              {error.thumbnail && (
                <p className="text-red-500 text-sm mt-1">{error.thumbnail}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              type="button"
              className="px-5 py-2.5 text-[15px] font-medium w-full max-w-[130px] bg-transparent hover:bg-gray-300 border-2 text-gray-600 rounded-md transition-all cursor-pointer"
              onClick={() => {
                setFormData({
                  title: "",
                  category: "",
                  price: "",
                  description: "",
                  thumbnail: [],
                });
                setIsEditing(false);
                setEditIndex(null);
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-5 py-2.5 text-[15px] font-medium w-full max-w-[130px] ${
                isEditing
                  ? "bg-[#22c55e] hover:bg-[#16a34a]"
                  : "bg-[#007bff] hover:bg-[#006bff]"
              } text-white rounded-md transition-all cursor-pointer`}
            >
              {isEditing ? "Save" : "Save"}
            </button>
          </div>

          <div className="flex justify-center items-center gap-6 mt-6">
            <button
              type="button"
              onClick={() => navigate("/Category")}
              className="px-5 py-2.5 mt-4 text-[15px] font-medium w-full max-w-[200px] bg-[#16a34a] hover:bg-[#15803d] text-white rounded-md transition-all cursor-pointer"
            >
              Go to Category
            </button>
          </div>
        </form>

        {products.length > 0 && (
          <div className="mt-12 w-full max-w-5xl pb-5">
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Date Modified</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr
                      key={p.id}
                      className={`border-t hover:bg-gray-50 transition ${
                        highlightIndex === index ? "bg-yellow-100" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        {p.thumbnail?.[0]?.data_url && (
                          <img
                            src={p.thumbnail[0].data_url}
                            alt={p.title}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.description}
                      </td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3">${p.price}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.dateModified}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3 mt-3">
                        <FaPencilAlt
                          size={22}
                          className="cursor-pointer hover:text-[#22c55e]"
                          onClick={() => {
                            setFormData({
                              title: p.title,
                              category: p.category,
                              price: p.price,
                              description: p.description,
                              thumbnail: p.thumbnail,
                            });
                            setIsEditing(true);
                            setEditIndex(index);
                          }}
                        />
                        <MdDeleteOutline
                          size={24}
                          className="cursor-pointer hover:text-[#ff0000]"
                          onClick={() => {
                            const updated = products.filter(
                              (_, i) => i !== index
                            );
                            setProducts(updated);
                            localStorage.setItem(
                              "PRODUCTSADMIN",
                              JSON.stringify(updated)
                            );
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAdmin;
