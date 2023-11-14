import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../styles/styles";
import { checkId } from "../helpers/db";

const TopBar = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const id = checkId();
    console.log("esto es", id);
    setData(id);
  }, []);
  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
        ID OPERADOR: {data && data}
      </Text>
    </View>
  );
};

export default TopBar;
