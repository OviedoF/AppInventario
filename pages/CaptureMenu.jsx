import { View, Text, Switch } from "react-native";
import { Link, useNavigate } from "react-router-native";
import React, { useState } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";

const CaptureMenu = () => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  return (
    <>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
      <SectionBar section={"Menu Captura"} backTo={routes.home} />
      <View style={styles.container}>
        <Link to={routes.home} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={styles.white}>INGRESO 1 A 1</Text>
          </View>
        </Link>
        <Link to={routes.home} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
          </View>
        </Link>
        <Link to={routes.home} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={styles.white}>ENVIAR CONTEO WIFI</Text>
          </View>
        </Link>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text>No Catalogados</Text>
          <Switch
            style={styles.mySm}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>
    </>
  );
};

export default CaptureMenu;
