import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigate } from "react-router-native";
import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import RadioGroup from "react-native-radio-buttons-group";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/dataContext";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import edit_icon from "../assets/edit.png";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import SupervisorApprobalModal from "../components/SupervisorApprobalModal";
import { Alert } from "react-native";

const CaptureMenu = () => {
  const navigate = useNavigate();
  const { area, setArea, config, setConfig, setSnackbar, user } =
    useContext(dataContext);
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState(parseInt(config.buttons_config));
  const [idDesired, setIdDesired] = useState("");
  const [authType, setAuthType] = useState("");
  const [modalSupervisor, setModalSupervisor] = useState(false);
  const refs = {
    area: useRef(null),
  };

  useEffect(() => {
    if (!area) setModal(true);
    if (modal) refs.area.current.focus();
  }, [modal]);

  const confirmArea = async () => {
    try {
      if (area === "") {
        setSnackbar({
          visible: true,
          text: "Ingrese un área",
          type: "error",
        });
        return;
      }

      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        `SELECT * FROM 'AREAS' WHERE NUM_AREA = "${area}"`,
        [],
        (result) => {
          const areas = result.rows._array;
          const area = areas[0];

          if (!area) return setSnackbar({
            visible: true,
            text: "Área no encontrada",
            type: "error",
          });

          if (area.ESTADO === "CERRADA") {
            Alert.alert(
              "Área cerrada",
              `El área ${area.NUM_AREA} se encuentra cerrada, ¿desea abrirla y continuar?`,
              [
                {
                  text: "Cancelar",
                  onPress: () => {
                    setArea("");
                    setModal(true);
                  },
                },{
                  text: "Aceptar",
                  onPress: () => {
                    const db = SQLite.openDatabase("Maestro.db");
                    ExecuteQuery(
                      db,
                      `UPDATE AREAS SET ESTADO = "INIT" WHERE NUM_AREA = "${area.NUM_AREA}"`,
                      [],
                      (result) => {
                        setSnackbar({
                          visible: true,
                          text: "Área abierta correctamente",
                          type: "success",
                        });
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al abrir el área",
                          type: "error",
                        });
                      }
                    );
                    setModal(false);
                  },
                  style: "cancel",
                }
              ],
              { cancelable: false }
            );
            return;
          }

          setModal(false);
        },
        (error) => {
          console.log(error);
          return setSnackbar({
            visible: true,
            text: "Error al ingresar el área",
            type: "error",
          });
        }
      );
    } catch (error) {
      console.log(error);
      setSnackbar({
        visible: true,
        text: "Error al ingresar el área",
        type: "error",
      });
    }
  };

  const confirmCloseArea = async () => {
    Alert.alert(
      "Cerrar área",
      `¿Está seguro que desea cerrar el área ${area}?`,
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Cerrar",
          onPress: async () => {
            setArea("");
            const db = SQLite.openDatabase("Maestro.db");
            ExecuteQuery(
              db,
              `UPDATE AREAS SET ESTADO = "CERRADA" WHERE NUM_AREA = "${area}"`,
              [],
              (result) => {
                setSnackbar({
                  visible: true,
                  text: "Área cerrada correctamente",
                  type: "success",
                });
              },
              (error) => {
                console.log(error);
                setSnackbar({
                  visible: true,
                  text: "Error al cerrar el área",
                  type: "error",
                });
              }
            );

            return setModal(true);
          },
        },
      ],
      { cancelable: false }
    );
  }

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />
        <SectionBar section={"Menu Captura"} backTo={routes.home} />
        <View
          style={{
            ...styles.container,
            marginTop: 0,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "90%",
              marginTop: 10,
            }}
          >
            <Text
              style={[styles.subtitle, { fontSize: 13, fontWeight: "normal" }]}
            >
              Área: {area}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setModal(true);
              }}
              style={{
                ...styles.logBtn,
                width: 60,
                padding: 5,
                margin: 5,
                borderRadius: 5,
              }}
            >
              <Text style={{
                color: "#fff",
              }}>EDITAR </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => confirmCloseArea()}
              style={{
                ...styles.logBtn,
                width: 70,
                padding: 5,
                margin: 5,
                borderRadius: 5,
                backgroundColor: "#dc3545",
              }}
            >
              <Text style={{
                color: "#fff",
              }}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.container}>
          {selectedId === 1 || selectedId === 3 ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigate(routes.singleProductEntry)}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO 1 A 1</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {selectedId === 2 || selectedId === 3 ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigate(routes.multipleProductEntry)}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigate(routes.sentWifi)}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.white}>ENVIAR CONTEO WIFI</Text>
            </View>
          </TouchableOpacity>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginBottom: 0,
              height: 40,
              marginTop: 0,
              padding: 0,
            }}
          >
            <Text>No Catalogados</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => {
                if (!user.admin) {
                  setAuthType("pesables");
                  setModalSupervisor(true);
                } else {
                  setConfig({
                    ...config,
                    catalog_products: !config.catalog_products,
                  });
                }
              }}
              value={config.catalog_products}
            />

            <Text>Pesables</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => {
                if (!user.admin) {
                  setAuthType("pesables");
                  setModalSupervisor(true);
                } else {
                  setConfig({
                    ...config,
                    pesables: !config.pesables,
                  });
                }
              }}
              value={config.pesables}
            />
          </View>

          <RadioGroup
            radioButtons={optionsRadio}
            onPress={(value) => {
              if (!user.admin) {
                setAuthType("buttons");
                setIdDesired(value);
                setModalSupervisor(true);
              } else {
                setSelectedId(value);
                setConfig({ ...config, buttons_config: value });
              }
            }}
            selectedId={selectedId}
            containerStyle={{ alignItems: "baseline" }}
          />
        </View>
      </ScrollView>

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
              style={styles.input}
              onChangeText={setArea}
              value={area}
              ref={refs.area}
              placeholder="Área"
              onSubmitEditing={confirmArea}
              autoFocus
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                onPress={() => confirmArea()}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>INGRESAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setArea("");
                  navigate(routes.home);
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

      <SupervisorApprobalModal
        setModalVisible={setModalSupervisor}
        modalVisible={modalSupervisor}
        setSnackbar={setSnackbar}
        user={user}
        idDesired={idDesired}
        setSelectedId={setSelectedId}
        setConfig={setConfig}
        config={config}
        authType={authType}
        setAuthType={setAuthType}
      />
    </KeyboardAvoidingView>
  );
};

export default CaptureMenu;
