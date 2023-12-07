import React, { useState, createContext, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";

export const dataContext = createContext();

export const DataProvider = ({ children }) => {
  const [area, setArea] = useState('');
  const [serie, setSerie] = useState('')
  const [user, setUser] = useState(undefined);
  const [inventario, setInventario] = useState('')
  const [hardwareId, setHardwareId] = useState('')
  const [codCapturador, setCodCapturador] = useState('')
  const [loading, setLoading] = useState(false)
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
  const [dangerModal, setDangerModal] = useState({
    visible: false,
    title: "",
    text: "",
    buttons: [],
  })
  const [cdInfo, setCdInfo] = useState({})

  const reset = () => {
    setArea('')
    setSerie('')
    setUser(undefined)
    setLoading(false)
    setConfig({
      ...config,
      largo_tag: 0,
      largo_prod: 0,
      buttons_config: '',
      catalog_products: true,
      index_capt: 1,
    })
  }

  useEffect(() => {
    console.log('dataContext')
    console.log(config)
  }, [config])

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
        hardwareId,
        setHardwareId,
        inventario,
        setInventario,
        dangerModal,
        setDangerModal,
        serie,
        setSerie,
        codCapturador,
        setCodCapturador,
        loading,
        setLoading,
        reset
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
