import { View, Text } from "react-native";
import React from "react";
import styles from "../styles/styles";

const SectionBar = ({ section }) => {
  return (
    <View style={[styles.pySm, { backgroundColor: "#005DA6" }]}>
      <Text style={[styles.white, styles.title, styles.mxSm]}>
        {section && section}
      </Text>
    </View>
  );
};

export default SectionBar;
