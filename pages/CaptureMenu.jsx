import { View, Text, Switch } from "react-native";
import { Link, useNavigate } from "react-router-native";
import React, { useState, useMemo } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import RadioGroup from "react-native-radio-buttons-group";

const CaptureMenu = () => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState(3);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const optionsRadio = useMemo(
    () => [
      {
        id: 1,
        label: "Ingreso 1 a 1",
        value: "single",
      },
      {
        id: 2,
        label: "Ingreso por cantidad",
        value: "multiple",
      },
      {
        id: 3,
        label: "Ambos",
        value: "both",
        default: true,
      },
    ],
    []
  );

  return (
    <>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
      <SectionBar section={"Menu Captura"} backTo={routes.home} />

      <View style={styles.container}>
        {selectedId === 1 || selectedId === 3 ? (
          <Link to={routes.singleProductEntry} style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.white}>INGRESO 1 A 1</Text>
            </View>
          </Link>
        ) : null}

        {selectedId === 2 || selectedId === 3 ? (
          <Link to={routes.multipleProductEntry} style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
            </View>
          </Link>
        ) : null}

        <Link to={routes.sentWifi} style={styles.primaryBtn}>
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
        <RadioGroup
          radioButtons={optionsRadio}
          onPress={setSelectedId}
          selectedId={selectedId}
          containerStyle={{ alignItems: "baseline" }}
        />
      </View>
    </>
  );
};

export default CaptureMenu;
