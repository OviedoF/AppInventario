import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import styles from "../styles/styles";
import { Link, useNavigate } from "react-router-native";
import { Image } from "react-native";
import arrowLeft from "../assets/left-arrow.png";

const SectionBar = ({ section, backTo }) => {
  const navigate = useNavigate();
  return (
    <View
      style={[
        styles.BgBlue,
        {
          flexDirection: "row",
          alignItems: "center",
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          navigate(backTo);
        }}
        style={[styles.backBtn, { padding: 5 }]}
      >
        <Image
          style={{
            width: 15,
            height: 15,
          }}
          source={arrowLeft}
        />
      </TouchableOpacity>

      <Text style={[styles.white, styles.subtitle, styles.mxSm]}>
        {section && section}
      </Text>
    </View>
  );
};

export default SectionBar;
