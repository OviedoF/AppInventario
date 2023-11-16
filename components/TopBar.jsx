import { View, Text } from "react-native";
import React, { useContext } from "react";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";

const TopBar = () => {
  const {hardwareId} = useContext(dataContext);

  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
        ID OPERADOR: {hardwareId || "SIN ID TODAVÍA"}
      </Text>
    </View>
  );
};

export default TopBar;
