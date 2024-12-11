import React, { createContext, useState, useContext } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    notiOn: false,
    apiStatus: "",
    apiMessage: "",
  });
  const onClose = () => {
    setPopup((prev) => ({
      ...prev,
      notiOn: false,
      apiStatus: "",
      apiMessage: "",
    }));
  };

  return (
    <PopupContext.Provider value={{ popup, setPopup, onClose }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
