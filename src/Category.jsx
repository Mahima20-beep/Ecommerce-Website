import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "./Context/admin-context";
import { FaPencilAlt } from "react-icons/fa";
import ImageUploading from "react-images-uploading";
import toast from "react-hot-toast";
import { MdDeleteOutline } from "react-icons/md";

const Category = () => {
  const { categories, setCategories } = useContext(AdminContext);

  const navigate = useNavigate();

  const [error, setError] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null);

  const [formData, setFormData] = useState({
    categoryTitle: "",
    thumbnail: [],
  });

  useEffect(() => {
    const savedCategories = localStorage.getItem("CATEGORIES");
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    let err = "";
    switch (name) {
      case "categoryTitle":
        if (!value || value === "Enter Category")
          err = "Please enter a category.";
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
    setFormData((prev) => ({ ...prev, thumbnail: imageList }));
    validateField("thumbnail", imageList);
  };

  const handleSubmit = () => {
    const fields = ["categoryTitle", "thumbnail"];
    let hasError = false;
    fields.forEach((f) => {
      if (validateField(f, formData[f])) hasError = true;
    });

    if (hasError) {
      toast.error("Please fill in all required fields before proceeding");
      return;
    }

    const newCategory = {
      categoryTitle: formData.categoryTitle,
      slug,
      thumbnail: formData.thumbnail,
      dateModified: new Date().toLocaleString(),
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem("CATEGORIES", JSON.stringify(updated));
    setFormData({ categoryTitle: "", thumbnail: [] });

    toast.success("Category created successfully");

    const newIndex = updated.length - 1;
    setHighlightIndex(newIndex);
    setTimeout(() => setHighlightIndex(null), 2000);
  };

  const handleSave = () => {
    const fields = ["categoryTitle", "thumbnail"];
    let hasError = false;
    fields.forEach((f) => {
      if (validateField(f, formData[f])) hasError = true;
    });

    if (hasError) {
      toast.error("Please fill in all required fields before saving");
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[editIndex] = {
      categoryTitle: formData.categoryTitle,
      slug,
      thumbnail: formData.thumbnail,
      dateModified: new Date().toLocaleString(),
    };
    setCategories(updatedCategories);
    localStorage.setItem("CATEGORIES", JSON.stringify(updatedCategories));

    setFormData({ categoryTitle: "", thumbnail: [] });
    setIsEditing(false);
    setEditIndex(null);
    toast.success("Category updated successfully");
  };

  const slug =
    formData.categoryTitle !== ""
      ? formData.categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div className="flex-grow flex flex-col items-center justify-start mt-20">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Category Management Form
        </h1>
        <form
          name="CategoryForm"
          onSubmit={(e) => e.preventDefault()}
          className="max-w-4xl w-full mx-auto"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Category Name <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-col items-start">
                <input
                  name="categoryTitle"
                  placeholder="Category Name"
                  value={formData.categoryTitle}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  className={`px-4 py-3 w-full border rounded-md outline-[#007bff] text-sm text-black ${
                    error.categoryTitle ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {error.categoryTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {error.categoryTitle}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium hidden">
                Slug <span className="text-red-600"></span>
              </label>
              <div className="px-4 py-3 pr-8 w-full text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-100 hidden">
                {slug}
              </div>
            </div>
            <div>
              <label className="mb-2 text-sm text-slate-900 font-medium block">
                Image <span className="text-red-600">*</span>
              </label>
              <div className="flex flex-col items-start">
                <ImageUploading
                  value={formData.thumbnail}
                  onChange={onChange}
                  onBlur={handleBlur}
                  dataURLKey="data_url"
                  acceptType={["webp"]}
                >
                  {({ imageList, onImageUpload, onImageRemove }) => (
                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        type="button"
                        onClick={onImageUpload}
                        className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-300 active:scale-[0.98] transition"
                      >
                        Select Image
                      </button>
                      {imageList.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {imageList.map((image, index) => (
                            <div key={index} className="relative">
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
                    </div>
                  )}
                </ImageUploading>
                {error.thumbnail && (
                  <p className="text-red-500 text-sm mt-1">{error.thumbnail}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-6 mt-8">
            <div className="flex gap-6">
              <button
                type="button"
                className="px-5 py-2.5 text-[15px] font-medium w-full max-w-[130px] bg-transparent hover:bg-gray-300 border-2 text-gray-600 rounded-md transition-all cursor-pointer"
                onClick={() => {
                  setFormData({ categoryTitle: "", thumbnail: [], slug });
                  setIsEditing(false);
                }}
              >
                Reset
              </button>

              <button
                type="button"
                className={`px-5 py-2.5 text-[15px] font-medium w-full max-w-[130px] ${
                  isEditing
                    ? "bg-[#22c55e] hover:bg-[#16a34a]"
                    : "bg-[#007bff] hover:bg-[#006bff]"
                } text-white rounded-md transition-all cursor-pointer`}
                onClick={isEditing ? handleSave : handleSubmit}
              >
                {isEditing ? "Save" : "Create"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/ProductAdmin")}
              className="px-5 py-2.5 mt-4 text-[15px] font-medium w-full max-w-[200px] bg-[#16a34a] hover:bg-[#15803d] text-white rounded-md transition-all cursor-pointer"
            >
              Go to Product Admin
            </button>

            {categories.length > 0 && (
              <div className="w-full mt-8">
                <table className="w-full border border-gray-200 text-sm text-gray-700 rounded-md shadow-sm overflow-hidden">
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium border-b">
                        Category Name
                      </th>
                      <th className="py-3 px-4 text-left font-medium border-b">
                        Image
                      </th>
                      <th className="py-3 px-4 text-left font-medium border-b">
                        Date Modified
                      </th>
                      <th className="py-3 px-4 text-left font-medium border-b">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 pb-5">
                    {categories.map((cat, index) => (
                      <tr
                        key={index}
                        className={
                          highlightIndex === index
                            ? "bg-yellow-100 transition-colors"
                            : ""
                        }
                      >
                        <td className="py-3 px-4 text-gray-600">{cat.slug}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {cat.thumbnail && cat.thumbnail.length > 0 && (
                            <img
                              src={cat.thumbnail[0].data_url}
                              alt={cat.slug}
                              className="w-12 h-12 object-cover rounded-md border border-gray-200"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {cat.dateModified}
                        </td>
                        <td className="py-3 px-4 flex items-center gap-3">
                          <FaPencilAlt
                            size={22}
                            className="cursor-pointer hover:text-[#22c55e]"
                            onClick={() => {
                              setFormData({
                                categoryTitle: cat.categoryTitle,
                                thumbnail: cat.thumbnail,
                              });
                              setIsEditing(true);
                              setEditIndex(index);
                            }}
                          />
                          <MdDeleteOutline
                            size={24}
                            className="cursor-pointer hover:text-[#ff0000]"
                            onClick={() => {
                              const updated = categories.filter(
                                (_, i) => i !== index
                              );
                              setCategories(updated);
                              localStorage.setItem(
                                "CATEGORIES",
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
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Category;
