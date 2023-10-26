import { View, Text } from "react-native";
import React from "react";
import styles from "../styles/styles";

const TopBar = ({ text }) => {
  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
        {text && text}
      </Text>
    </View>
  );
};

export default TopBar;
