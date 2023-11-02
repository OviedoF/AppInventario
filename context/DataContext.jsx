import React, { useState, createContext, useEffect } from "react";

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
    index_capt: 1
  })

  useEffect(() => {
    console.log('Contexto de datos cargado.');
    console.log(config)
  }, [config])
  /* const [cart, setCart] = useState([]);
  const [cartCant, setCartCant] = useState();
  //Verificar si esta en carrito
  const isInCartContext = (name) => {
    return cart.some((item) => item.item === name);
  };
  //Agregar al carrito
  const addToCart = (name, cant) => {
    if (isInCartContext(name)) {
      // El producto ya está en el carrito, actualiza la cantidad.
      const updatedCart = cart.map((item) => {
        if (item.item === name) {
          return { item: name, cant: item.cant + cant };
        }
        return item;
      });
      setCart(updatedCart);
    } else {
      // El producto no está en el carrito, entonces lo agrega.
      setCart([...cart, { item: name, cant }]);
    }
    setCartCant(totalItemsInCart());
  };
  //Limpiar carrito
  const clearCart = () => {
    setCart([]);
  };
  //Total carrito
  const totalItemsInCart = () => {
    let total = 0;
    cart.forEach((item) => (total = total + item.cant));
    return total;
  };
  //Borrar item
  const eraseItemFromCart = (name) => {
    let newCart = cart.filter((item) => item !== name);
    setCart(newCart);
  }; */
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
        setConfig
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
