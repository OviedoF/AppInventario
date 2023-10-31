import React, { useState, createContext } from "react";

export const dataContext = createContext();

export const DataProvider = ({ children }) => {
  const [area, setArea] = useState(undefined);

  return (
    <dataContext.Provider
      value={{
        area,
        setArea,
      }}
    >
      {children}
    </dataContext.Provider>
  );
};
