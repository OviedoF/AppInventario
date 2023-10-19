import { View, Text } from "react-native";
import React from "react";
import styles from "../styles/styles";
import { Link } from "react-router-native";

const SectionBar = ({ section, backTo }) => {
  return (
    <View
      style={[
        styles.pySm,
        {
          backgroundColor: "#005DA6",
          flexDirection: "row",
          alignItems: "center",
        },
      ]}
    >
      <Link to={backTo} style={styles.backBtn}>
        <Text>Volver</Text>
      </Link>
      <Text style={[styles.white, styles.title, styles.mxSm]}>
        {section && section}
      </Text>
    </View>
  );
};

export default SectionBar;
