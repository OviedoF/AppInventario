import React, { useState, useRef, useEffect, useContext } from "react";
import { dataContext } from "../context/dataContext";
import { Snackbar } from "react-native-paper";

export default SnackbarComponent = () => {
  const { snackbar, setSnackbar } = useContext(dataContext);

  return (
    <Snackbar
      visible={snackbar.visible}
      onDismiss={() =>
        setSnackbar({
          visible: false,
          text: "",
          type: "success",
        })
      }
      duration={3000}
      style={{
        backgroundColor: snackbar.type === "success" ? "#4caf50" : "#f44336",
      }}
    >
      {snackbar.text}
    </Snackbar>
  );
};
