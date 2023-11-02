import { View, Text } from "react-native";
import React from "react";
import styles from "../styles/styles";
import { Link } from "react-router-native";
import { Image } from "react-native";
import arrowLeft from "../assets/left-arrow.png";

const SectionBar = ({ section, backTo }) => {
  return (
    <View
      style={[
        styles.BgBlue,
        {
          flexDirection: "row",
          alignItems: "center",
          padding: 5,
        },
      ]}
    >
      <Link to={backTo} style={styles.backBtn}>
        <Image
          style={{
            width: 15,
            height: 15,
          }}
          source={arrowLeft}
        />
      </Link>

      <Text style={[styles.white, styles.subtitle, styles.mxSm]}>
        {section && section}
      </Text>
    </View>
  );
};

export default SectionBar;
