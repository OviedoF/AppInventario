import { View, Text } from "react-native";
import React, { useContext } from "react";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";

const TopBar = () => {
  const {hardwareId, inventario, user} = useContext(dataContext);
  const userTxt = user ? `OP: ${user.COD_USUARIO} - ${user.NOMBRES}` : "SIN USUARIO";
  const userTxtSimplified = userTxt.length > 23 ? userTxt.substring(0, 23) + "..." : userTxt;
  const invTxt = inventario ? `INV: ${inventario}` : "SIN INVENTARIO";
  const invTxtSimplified = invTxt.length > 28 ? invTxt.substring(0, 28) + "..." : invTxt;

  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm, {
        fontSize: 10
      }]}>
        {!user && `ID: ${hardwareId || "SIN ID TODAVÍA"} | INV: ${inventario || "SIN INVENTARIO"}`}

        {user && `${userTxtSimplified} | ${invTxtSimplified}`}
      </Text>
    </View>
  );
};

export default TopBar;
