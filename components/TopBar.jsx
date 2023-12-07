import { View, Text } from "react-native";
import React, { useContext } from "react";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";

const TopBar = () => {
  const {hardwareId, inventario, user} = useContext(dataContext);
  console.log("user", user);

  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm, {
        fontSize: 10
      }]}>
        {!user && `ID: ${hardwareId || "SIN ID TODAVÍA"} | INV: ${inventario || "SIN INVENTARIO"}`}

        {user && `OP: ${user.COD_USUARIO} - ${user.NOMBRES} | ${inventario || "SIN INVENTARIO"}`}
      </Text>
    </View>
  );
};

export default TopBar;
