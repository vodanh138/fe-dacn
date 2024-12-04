import { useEffect, useState } from "react";

const Popup = ({ status, message }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setIsOn(true)
    if (status === "success") setIsSuccess(true);
    setTimeout(() => {
        setIsOn(false);
      }, 3000);
  }, [status]);
  

  return (
    <>
      {isOn && !isSuccess && (
        <div className="fixed top-4 right-4 bg-red-500 text-white py-2 px-4 rounded shadow-lg flex items-center">{message}</div>
      )}
      {isOn && isSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-lg flex items-center">
        <span>{message}</span>
      </div>
      )}
    </>
  );
};

export default Popup;
