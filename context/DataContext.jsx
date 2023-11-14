import React, { useState, createContext } from "react";

export const dataContext = createContext();

export const DataProvider = ({ children }) => {
  const [area, setArea] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    text: "",
    type: "success",
  });
  const [config, setConfig] = useState({
    largo_tag: 0,
    largo_prod: 0,
    buttons_config: '',
    catalog_products: true,
    index_capt: 1,
    inv_activo: '',
  })
  const [cdInfo, setCdInfo] = useState({})

  return (
    <dataContext.Provider
      value={{
        area,
        setArea,
        user,
        setUser,
        snackbar,
        setSnackbar,
        config,
        setConfig,
        cdInfo,
        setCdInfo,
        /* cartCant,
        addToCart,
        clearCart,
        eraseItemFromCart, */
      }}
    >
      {children}
    </dataContext.Provider>
  );
};
