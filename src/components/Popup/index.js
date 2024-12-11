import { useEffect, useState } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

const Popup = ({ status, message, onClose }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (status === "success") setIsSuccess(true);
  }, [status]);

  return (
    <div
      className={`fixed top-4 right-4 py-2 px-4 rounded shadow-lg flex items-center ${
        isSuccess ? "bg-white text-black border-green-500" : "bg-white text-black border-red-500"
      } border-2`}
      style={{
        zIndex: 9999,
      }}
    >
      <div className="mr-2">
        {isSuccess ? (
          <FaCheck className="text-green-500" />
        ) : (
          <FaTimes className="text-red-500" />
        )}
      </div>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-black font-bold"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        X
      </button>
    </div>
  );
};

export default Popup;
