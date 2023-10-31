import { View, Text, Switch, TextInput, TouchableOpacity } from "react-native";
import { Link, useNavigate } from "react-router-native";
import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import RadioGroup from "react-native-radio-buttons-group";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/DataContext";

const CaptureMenu = () => {
  const navigate = useNavigate();
  const { area, setArea } = useContext(dataContext);
  const [modal, setModal] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState(3);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const refs = {
    area: useRef(null),
  };

  useEffect(() => {
    console.log(area);
    if (!area) setModal(true);
    if (modal) refs.area.current.focus();
  }, [modal]);

  const confirmArea = () => {
    if (area === "") {
      alert("Ingrese un área");
      return;
    }

    setModal(false);
  };

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
      <TopBar text={"ID:"} />
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
      {modal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Ingresar Área
            </Text>

            <TextInput
              keyboardType="numeric"
              style={styles.input}
              onChangeText={setArea}
              value={area}
              ref={refs.area}
              placeholder="Área"
              onSubmitEditing={confirmArea}
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                onPress={confirmArea}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>INGRESAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigate(routes.captureMenu);
                }}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                  backgroundColor: "#ccc",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>VOLVER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default CaptureMenu;
