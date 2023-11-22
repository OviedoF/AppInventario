import { View, Text } from "react-native";
import React, { useContext } from "react";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";

const TopBar = () => {
  const {hardwareId, inventario} = useContext(dataContext);

  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm, {
        fontSize: 10
      }]}>
        ID OP: {hardwareId || "SIN ID TODAVÍA"} | INV: {inventario || "SIN INVENTARIO"}
      </Text>
    </View>
  );
};

export default TopBar;
