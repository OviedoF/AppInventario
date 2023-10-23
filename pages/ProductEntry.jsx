import { View, Text } from "react-native";
import React from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";

const ProductEntry = ({ type }) => {
  return (
    <View>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
      <SectionBar
        section={type === "single" ? "Ingreso 1x1" : "Ingreso por cantidad"}
        backTo={routes.captureMenu}
      />
    </View>
  );
};

export default ProductEntry;
