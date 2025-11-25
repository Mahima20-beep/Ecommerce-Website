import { useContext } from "react";
import ProductCard from "./ProductCard";
import Filters from "./Filters";
import { ProductContext } from "../Context/products-context";

const Dashboard = () => {
  const { products } = useContext(ProductContext);

  return (
    <div className="flex gap-3">
      <Filters data={products} />
      <ProductCard data={products} />
    </div>
  );
};

export default Dashboard;
