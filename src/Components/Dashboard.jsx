import ProductCard from "./ProductCard";
import Filters from "./Filters";

const Dashboard = () => {
  return (
    <div className="flex gap-3">
      <Filters />
      <ProductCard />
    </div>
  );
};

export default Dashboard;
