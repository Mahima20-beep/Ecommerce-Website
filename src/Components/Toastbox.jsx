import React from "react";
import { Toaster } from "react-hot-toast";

const Toastbox = () => {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} gutter={0} />
    </div>
  );
};

export default Toastbox;
