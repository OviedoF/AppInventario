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
  const { area, setArea, config, setConfig, setSnackbar, user, setDangerModal, setSerie, sendArea } =
    useContext(dataContext);
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState(parseInt(config.buttons_config));
  const [idDesired, setIdDesired] = useState("");
  const [authType, setAuthType] = useState("");
  const [modalSupervisor, setModalSupervisor] = useState(false);
  const refs = {
    area: useRef(null),
  };
  console.log(config);

  useEffect(() => {
    if (!area) setModal(true);
    if (modal) refs.area.current.focus();
  }, [modal]);

  function calcularDigitoVerificador(rut) {
    let multiplicador = 0;
    let suma = 1;

    for (; rut; rut = Math.floor(rut / 10)) {
      const digito = rut % 10;
      suma = (suma + digito * (9 - multiplicador++ % 6)) % 11;
    }

    return suma ? suma - 1 : 'k';
  }

  const confirmArea = async () => {
    try {
      if (area === "") {
        setSnackbar({
          visible: true,
          text: "Ingrese un área",
          type: "error",
        });
        refs.area.current.focus();
        return;
      }

      // * Agarramos la serie, el número de área y el dígito verificador
      const aux = area;
      const serie = aux.slice(0, 3);
      let numArea = aux.slice(3, aux.length - 1);
      console.log(numArea);
      const digitVerif = aux.slice(aux.length - 1, aux.length);

      // * Si el largo del número de área es menor al largo del tag, le agregamos ceros a la izquierda

      while (numArea.length < config.largo_tag) numArea = "0" + numArea;

      // * Si el largo del número de área es mayor al largo del tag, le quitamos los números de la izquierda hasta que el largo sea igual al largo del tag
      while (numArea.length > config.largo_tag) numArea = numArea.slice(1);

      // * Calculamos el dígito verificador del número de área y lo comparamos con el dígito verificador ingresado
      const digitVerifArea = calcularDigitoVerificador(parseInt(numArea));
      console.log(serie, numArea, digitVerif, digitVerifArea);

      // * Hacer la consulta a la base de datos para ver si el área existe
      const db = SQLite.openDatabase("Maestro.db");

      // * Primero revisamos si la serie existe

      ExecuteQuery(
        db,
        "SELECT * FROM SERIES WHERE NUM_SERIE = ?",
        [serie],
        (result) => {
          if (result.rows.length === 0) {
            setSnackbar({
              visible: true,
              text: `La serie ${serie} no existe`,
              type: "error",
            });
            return;
          }

          // * Si la serie existe, revisamos si el número de área existe

          ExecuteQuery(
            db,
            `SELECT * FROM 'AREAS' WHERE NUM_AREA = "${numArea + digitVerifArea}"`,
            [],
            (result) => {
              const areas = result.rows._array;
              const area = areas[0];

              if (!area) {
                refs.area.current.focus();
                return setSnackbar({
                  visible: true,
                  text: `El área ${numArea + '-' + digitVerifArea} no existe`,
                  type: "error",
                });
              }

              if (digitVerifArea.toString() !== digitVerif.toString()) {
                refs.area.current.focus();
                return setSnackbar({
                  visible: true,
                  text: "Dígito verificador incorrecto",
                  type: "error",
                });
              }

              setSerie(serie);
              setArea(area.NUM_AREA);
              console.log(area.ESTADO);

              if (area.ESTADO === "CERRADA") {
                setDangerModal({
                  visible: true,
                  title: "Área cerrada",
                  text: `El área ${numArea}-${digitVerifArea} se encuentra cerrada, ¿qué desea hacer?`,
                  buttons: [
                    {
                      text: "Ver",
                      onPress: () => navigate(`/view/${area.NUM_AREA}`),
                      style: "cancel",
                    }, {
                      text: "Modificar",
                      onPress: () => {
                        console.log('Modificar');
                        const db = SQLite.openDatabase("Maestro.db");

                        // * CAMBIAMOS EL UEESTADO DEL ÁREA A M Y SUMAMOS 1 AL ESTADOTAG

                        ExecuteQuery(
                          db,
                          `UPDATE AREAS SET UESTADO = "M", ESTADOTAG = ESTADOTAG + 1, ENVIADA = 0 WHERE NUM_AREA = "${area.NUM_AREA}"`,
                          [],
                          (result) => {
                            console.log('SE CAMBIÓ EL UESTADO DEL ÁREA A M Y SE SUMÓ 1 AL ESTADOTAG');
                          },
                          (error) => {
                            console.log(error);
                            setSnackbar({
                              visible: true,
                              text: "Error al modificar el área",
                              type: "error",
                            });
                          }
                        );

                        // * CAMBIAR EL ESTADO DEL ÁREA A INI
                        ExecuteQuery(
                          db,
                          `UPDATE AREAS SET ESTADO = "INI" WHERE NUM_AREA = "${area.NUM_AREA}"`,
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
                    }, {
                      text: 'Retomar',
                      onPress: () => {
                        console.log('Retomar');
                        const db = SQLite.openDatabase("Maestro.db");
                        // * Limpiamos el área
                        ExecuteQuery(
                          db,
                          `DELETE FROM INVENTARIO_APP WHERE area = "${area.NUM_AREA}"`,
                          [],
                          (result) => {
                            console.log('Área limpiada correctamente');
                          },
                          (error) => {
                            console.log(error);
                            setSnackbar({
                              visible: true,
                              text: "Error al limpiar el área",
                              type: "error",
                            });
                          }
                        );

                        // * Cambiar el UESTADO del área a R y sumar 1 al ESTADOTAG
                        ExecuteQuery(
                          db,
                          `UPDATE AREAS SET UESTADO = "R", ESTADOTAG = ESTADOTAG + 1, ENVIADA = 0 WHERE NUM_AREA = "${area.NUM_AREA}"`,
                          [],
                          (result) => {
                            console.log('SE CAMBIÓ EL UESTADO DEL ÁREA A R Y SE SUMÓ 1 AL ESTADOTAG');
                          },
                          (error) => {
                            console.log(error);
                            setSnackbar({
                              visible: true,
                              text: "Error al retomar el área",
                              type: "error",
                            });
                          }
                        );

                        // * Cambiamos el estado del área a INI
                        ExecuteQuery(
                          db,
                          `UPDATE AREAS SET ESTADO = "INI" WHERE NUM_AREA = "${area.NUM_AREA}"`,
                          [],
                          (result) => {
                            setSnackbar({
                              visible: true,
                              text: "Área retomada correctamente!",
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
                      }
                    }, {
                      text: "Volver",
                      onPress: () => {
                        setModal(false);
                        setArea("");
                      },
                      style: "cancel",
                    }
                  ]
                });
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
        }, (error) => {
          console.log(error);
          setSnackbar({
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
    setDangerModal({
      visible: true,
      title: "Cerrar área",
      text: `¿Está seguro que desea cerrar el área ${area}?`,
      buttons: [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Cerrar",
          onPress: async () => {
            setDangerModal({
              visible: false,
              title: "",
              text: "",
              buttons: [],
            });
            const db = SQLite.openDatabase("Maestro.db");

            ExecuteQuery(
              db,
              "SELECT * FROM INVENTARIO_APP WHERE area = ?",
              [area],
              (results) => {
                if (results.rows._array.length === 0) {
                  setSnackbar({
                    visible: true,
                    text: "El área está vacía, no se cerrará",
                    type: "error",
                  });
                  return;
                }

                if (results.rows._array.length > 0) {
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

                      setDangerModal({
                        visible: true,
                        title: "Cargar y Respaldo",
                        text: "¿Desea enviar datos al servidor de inmediato?",
                        bg: "#28a745",
                        buttons: [
                          {
                            text: "NO",
                            onPress: () => {
                              setDangerModal({
                                visible: false,
                                title: "",
                                text: "",
                                buttons: [],
                              });
                              setArea("");
                              setModal(true);
                              navigate(routes.captureMenu);
                            },
                            style: "cancel",
                          },
                          {
                            text: "Si",
                            onPress: () => {
                              setDangerModal({
                                visible: false,
                                title: "",
                                text: "",
                                buttons: [],
                              });
                              ExecuteQuery(
                                db,
                                "SELECT * FROM AREAS WHERE NUM_AREA = ?",
                                [area],
                                async (results) => {
                                  const area = results.rows._array[0];
                                  await sendArea(area, navigate(routes.captureMenu));
                                  setModal(true);
                                },
                                (error) => {
                                  console.log(error);
                                  setSnackbar({
                                    visible: true,
                                    text: "Error al cargar el área",
                                    type: "error",
                                  });
                                }
                              );
                            },
                          },
                        ],
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

                  setArea("");
                  navigate(routes.captureMenu);
                }
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
          },
        },
      ]
    });
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
        <SectionBar section={"Menu Captura"} backTo={routes.login} />
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
              justifyContent: "center",
              width: "95%",
              marginTop: 10,
            }}
          >
            <Text
              style={[styles.subtitle, { fontSize: 16, fontWeight: "normal" }]}
            >
              Área: {area.slice(0, area.length - 1)}-{area.slice(-1)}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setArea("");
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
              }}>NUEVA </Text>
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
              style={[styles.primaryBtn, {
                width: '90%',
                borderRadius: 10
              }]}
              onPress={() => navigate(routes.singleProductEntry)}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO 1 A 1</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {selectedId === 2 || selectedId === 3 ? (
            <TouchableOpacity
              style={[styles.primaryBtn, {
                width: '90%',
                borderRadius: 10
              }]}
              onPress={() => navigate(routes.multipleProductEntry)}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, {
              width: '90%',
              borderRadius: 10
            }]}
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
                  setAuthType("catalog_products");
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
              maxLength={parseInt(config.largo_tag) + 4}
            />

            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >

              <TouchableOpacity
                onPress={() => {
                  setArea("");
                  navigate(routes.sentWifi)
                }}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                  backgroundColor: "#2E97A7",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>ENVIO WIFI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setArea("");
                  navigate(routes.login);
                }}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                  backgroundColor: "#dc3545",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>SALIR</Text>
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
        key={authType}
        newValue={idDesired}
      />
    </KeyboardAvoidingView>
  );
};

export default CaptureMenu;
