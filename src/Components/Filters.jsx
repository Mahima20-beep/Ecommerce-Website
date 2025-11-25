import { useContext, useState } from "react";
import { AdminContext } from "../Context/admin-context";
import { ProductContext } from "../Context/products-context";
import { CiFilter } from "react-icons/ci";
import { SiBrandfolder } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { IoIosPricetags } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdArrowDropup } from "react-icons/io";

const Filters = ({ data }) => {
  const { categories } = useContext(AdminContext);

  const {
    selectedBrand,
    handleBrandClick,
    selectedCategory,
    handleCategoryClick,
    clearFilters,
    selectedMinPrice,
    selectedMaxPrice,
    handlePriceChange,
  } = useContext(ProductContext);

  const [searchBrand, setSearchBrand] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const prices = data.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const trackLeft =
    ((selectedMinPrice - minPrice) / (maxPrice - minPrice)) * 100;
  const trackWidth =
    ((selectedMaxPrice - selectedMinPrice) / (maxPrice - minPrice)) * 100;

  const uniqueBrands = [
    ...new Set(
      data.map((item) =>
        item.brand && item.brand.trim() ? item.brand : "Unknown"
      )
    ),
  ];

  const filteredBrands = uniqueBrands.filter((brand) =>
    brand.toLowerCase().includes(searchBrand.toLowerCase())
  );

  const productCategories = [...new Set(data.map((item) => item.category))];
  const adminCategories = categories.map((cat) => cat.slug);
  const uniqueCategories = [
    ...new Set([...productCategories, ...adminCategories]),
  ];

  return (
    <div className="flex min-h-screen">
      <div className="h-full w-64 flex-shrink-0 flex flex-col bg-gray-200 border-r shadow-lg p-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-xl font-semibold">
            <span>Filter</span>
            <CiFilter className="ml-1" />
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-red-500 font-semibold cursor-pointer"
          >
            Clear all
          </button>
        </div>
        <div className="border-b-2 border-gray-400"></div>

        <div className="mb-4">
          {selectedBrand.length > 0 && (
            <span className="text-green-800 font-medium text-md">
              <u>Brand: </u>
              {selectedBrand.join(", ")}
            </span>
          )}

          {selectedCategory && selectedCategory.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategory.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 border rounded-md text-md font-medium bg-gray-900 text-white border-gray-900"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center text-lg font-semibold text-slate-900">
            <span>Brand</span>
            <SiBrandfolder className="ml-1" />
            {brandOpen ? (
              <IoMdArrowDropup
                onClick={() => setBrandOpen(!brandOpen)}
                className="cursor-pointer"
                size={28}
              />
            ) : (
              <IoMdArrowDropdown
                onClick={() => setBrandOpen(!brandOpen)}
                className="cursor-pointer"
                size={28}
              />
            )}
          </div>
          {brandOpen && (
            <div className="flex px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 mt-2">
              <input
                type="text"
                placeholder="Search brand"
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 text-sm"
              />
            </div>
          )}

          {brandOpen && (
            <ul className="mt-4 space-y-1">
              {filteredBrands
                .sort((a, b) => (a > b ? 1 : -1))
                .map((brand, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={brand}
                      name="brand"
                      checked={selectedBrand.includes(brand)}
                      onChange={() => handleBrandClick(brand)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor={brand}
                      className="text-slate-600 font-medium text-sm cursor-pointer"
                    >
                      {brand}
                    </label>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="border-b-2 border-gray-400 mb-6 mt-3"></div>

        <div>
          <div className="flex items-center text-lg font-semibold text-slate-900 mb-3">
            <span>Category</span>
            <TbCategory className="ml-1" />
            {categoryOpen ? (
              <IoMdArrowDropup
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="cursor-pointer"
                size={28}
              />
            ) : (
              <IoMdArrowDropdown
                className="cursor-pointer"
                size={28}
                onClick={() => setCategoryOpen(!categoryOpen)}
              />
            )}
          </div>
          {categoryOpen && (
            <div className="flex flex-wrap gap-2">
              {uniqueCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium cursor-pointer ${
                    selectedCategory.includes(category)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-100 border-gray-300 text-slate-600 hover:border-gray-900"
                  }`}
                  onClick={() => {
                    // Merge both API and local categories together
                    const combinedCategory = category || cat?.slug;
                    handleCategoryClick(combinedCategory);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-b-2 border-gray-400 mb-6 mt-3"></div>

        <div>
          <div className="flex items-center text-lg font-semibold text-slate-900 mb-3">
            <span>Price</span>
            <IoIosPricetags className="ml-1" />
          </div>

          <div className="relative h-2 w-full bg-gray-300 rounded-full pointer-events-none">
            <div
              className="absolute h-2 bg-pink-500 rounded-full pointer-events-none"
              style={{
                left: `${trackLeft}%`,
                width: `${trackWidth}%`,
              }}
            ></div>

            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={selectedMinPrice ?? minPrice}
              onChange={(e) => {
                const value = Math.min(
                  Number(e.target.value),
                  selectedMaxPrice - 1
                );
                handlePriceChange(value, selectedMaxPrice);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer top-0 z-3 pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:bg-pink-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:bg-pink-500
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md"
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={selectedMaxPrice ?? maxPrice}
              onChange={(e) => {
                const value = Math.max(
                  Number(e.target.value),
                  selectedMinPrice + 1
                );
                handlePriceChange(selectedMinPrice, value);
              }}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer top-0 z-4 pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:bg-pink-500
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:bg-pink-500
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md"
            />
          </div>

          <div className="flex justify-between text-slate-600 font-medium text-sm mt-4">
            <span>${selectedMinPrice}</span>
            <span>${selectedMaxPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
