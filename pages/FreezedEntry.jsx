import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import { StyleSheet } from "react-native";
import ConfirmCloseAreaModal from "../components/ConfirmCloseAreaModal";
import Calculator from "../components/Calculator";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/dataContext";
import { useNavigate } from "react-router-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import reverse_icon from "../assets/reverse.png";
import 'react-native-get-random-values';

function GTIN8Digit(codigoGTIN8) {
  if (codigoGTIN8.length !== 7) {
    return "El código GTIN-8 debe tener exactamente 7 dígitos.";
  }

  // Convierte el código GTIN-8 en un arreglo de dígitos
  const digitos = codigoGTIN8.split("").map(Number);

  // Calcula la suma de los dígitos en posiciones impares multiplicada por 3
  let sumaImpares = 0;
  let sumaPares = 0;
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) {
      sumaImpares += digitos[i];
    } else {
      sumaPares += digitos[i];
    }
  }

  // Calcula el dígito de control
  const sumaTotal = sumaImpares * 3 + sumaPares;
  const digitoControl = Math.ceil(sumaTotal / 10) * 10 - sumaTotal;

  return digitoControl;
}

function GtoKG(gramos) {
  // Elimina los ceros a la izquierda utilizando una expresión regular
  gramos = gramos.replace(/^0+/, "");

  // Convierte la cadena de gramos a un número
  const gramosComoNumero = parseFloat(gramos);

  const divisor = 1000;

  // Calcula los kilogramos dividiendo los gramos entre 1000
  const kilogramos = gramosComoNumero / divisor;

  return kilogramos;
}

const FreezedEntry = ({ type }) => {
  const { area, setArea, setSnackbar, config, user, setDangerModal, serie, sendArea, setLoading } = useContext(dataContext);
  const [areaData, setAreaData] = useState({
    UESTADO: '',
    ESTADOTAG: ''
  })
  const [calculatorModal, setCalculatorModal] = useState(false);
  const [code, setCode] = useState("");
  const [codePallet, setCodePallet] = useState("")
  const [quantity, setQuantity] = useState(
    type === "single" ? 1 : ''
  );
  const [lastProduct, setLastProduct] = useState({
    DESCRIPCION: "",
    TYPE: "",
  });
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [modal, setModal] = useState(false);
  const [scansData, setScansData] = useState({
    products: "...",
    scans: "...",
    totalOfArea: "...",
  });
  const [disabledPallet, setDisabledPallet] = useState(false)

  const navigate = useNavigate();

  const refs = {
    code: useRef(null),
    quantity: useRef(null),
    codePallet: useRef(null),
  };

  const confirmArea = () => {
    if (area === "") {
      setSnackbar({
        visible: true,
        text: "Ingrese un área",
        type: "error",
      });
      return;
    }

    setModal(false);
  };

  const confirmCloseArea = async () => {
    setDangerModal({
      visible: true,
      title: "Cerrar área",
      text: "¿Está seguro que desea cerrar el área?",
      buttons: [
        {
          text: "Cancelar",
          onPress: () => {
            setDangerModal({
              visible: false,
              title: "",
              text: "",
              buttons: [],
            });
          },
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
              "SELECT * FROM INVENTARIO_APP WHERE area = ? AND invtype = 'INV' AND CorrelativoApertura = ?",
              [area, areaData.ESTADOTAG],
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
                        text: "¿Desea Enviar datos al servidor de inmediato?",
                        bg: "#28a745",
                        buttons: [
                          {
                            text: "NO",
                            onPress: () => {
                              setArea("");
                              setDangerModal({
                                visible: false,
                                title: "",
                                text: "",
                                buttons: [],
                              });
                              navigate(
                                config.congelados ?
                                  type === "single" ? routes.captureMenuFreezed1x1 : routes.captureMenu1x1
                                  : type === "multi" ? routes.captureMenuFreezedMulti : routes.captureMenuMulti
                              );
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
                              sendArea(areaData,
                                navigate(
                                  config.congelados ?
                                    type === "single" ? routes.captureMenuFreezed1x1 : routes.captureMenu1x1
                                    : type === "multi" ? routes.captureMenuFreezedMulti : routes.captureMenuMulti
                                ));
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
      ],
    });
  }

  const getScansData = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    const productsDb = [];
    const query = `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND area = "${area}"`;

    await ExecuteQuery(
      db,
      query,
      [],
      (results) => {
        // * Leemos los scans de la base de datos y contamos los productos no repetidos
        results.rows._array.forEach((product) => {
          if (!productsDb.includes(product.name)) productsDb.push(product.name);
        });

        let totalProducts = 0;

        results.rows._array.forEach((product) => {
          if (product.area === area) totalProducts += parseFloat(product.quantity);
        });

        setScansData({
          products: productsDb.length.toFixed(1),
          scans: results.rows._array.length.toFixed(1),
          totalOfArea: totalProducts
        });
      },
      (error) => {
        setSnackbar({
          visible: true,
          text: "Error al obtener los datos de los escaneos",
          type: "error",
        });
        console.log(error);
        return false;
      }
    );
  };

  const addProductToDb = async (product, qty = quantity, corrPT) => {
    const db = SQLite.openDatabase("Maestro.db");
    const date = new Date().toISOString();
    // * Rellenar con 0s el product.COD_PROD hasta el largo de config.largo_prod
    const codeLength = product.COD_PROD.length;

    if (codeLength < parseInt(config.largo_prod)) {
      const codeToAdd = parseInt(config.largo_prod) - codeLength;
      for (let i = 0; i < codeToAdd; i++) {
        product.COD_PROD = `0${product.COD_PROD}`;
      }
    }

    await ExecuteQuery(
      db,
      `SELECT * FROM INVENTARIO_APP WHERE area = "${area}" AND invtype = "INV" AND CorrelativoApertura = "${areaData.ESTADOTAG}" ORDER BY id DESC`,
      [],
      (results) => {

        ExecuteQuery(
          db,
          "INSERT INTO INVENTARIO_APP (operator, name, quantity, date, posicion, area, pallet, caja, type, inventario, serie, existe, EstadoTag, CorrelativoApertura, invtype, descripcion, CorrPT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            user.COD_USUARIO,
            product.COD_PROD,
            config.num_decimales ? parseFloat(qty).toFixed(config.num_decimales) : parseInt(qty),
            date,
            "",
            area,
            "",
            "",
            product.type,
            config.inv_activo,
            serie,
            product.exists ? product.exists : 'S',
            areaData.UESTADO == 'INI' ? '0' : areaData.UESTADO,
            areaData.ESTADOTAG,
            'INV',
            product.DESCRIPCION,
            corrPT || results.rows._array.length + 1
          ],
          (results) => {
            getScansData();
            setCode("");
            if (type === 'multi') setQuantity('');
            if (type === 'single') setQuantity(1);
          },
          (error) => {
            console.log("Error", error);
            setSnackbar({
              visible: true,
              text: "Error al agregar el producto",
              type: "error",
            });
          }
        );
      },
      (error) => {
        setSnackbar({
          visible: true,
          text: "Error al obtener los datos de los escaneos",
          type: "error",
        });
        console.log(error);
        return false;
      }
    );
  };

  const onCodeSubmit = async (sendedBy) => {
    if (!code)
      return setSnackbar({
        visible: true,
        text: "Ingrese un código",
        type: "error",
      });

    if (!quantity && sendedBy === "qtyInput") return setSnackbar({
      visible: true,
      text: "Ingrese una cantidad",
      type: "error",
    });

    const masterDb = SQLite.openDatabase("Maestro.db");


    // * Rellenar con 0s el product.COD_PROD hasta el largo de config.largo_prod
    const codeLength = code.length;
    let codeProduct = code;

    if (codeLength < parseInt(config.largo_prod)) {
      const codeToAdd = parseInt(config.largo_prod) - codeLength;
      for (let i = 0; i < codeToAdd; i++) {
        codeProduct = `0${codeProduct}`;
      }
    }

    // * Validar si el código está repetido en la base de datos con el mismo correlativo de apertura
    console.log(`SELECT * FROM INVENTARIO_APP WHERE name = "${codeProduct}" AND area = "${area}" AND CorrelativoApertura = "${areaData.ESTADOTAG}"`)
    ExecuteQuery(
      masterDb,
      `SELECT * FROM INVENTARIO_APP WHERE name = "${codeProduct}" AND area = "${area}" AND CorrelativoApertura = "${areaData.ESTADOTAG}"`,
      [],
      (results) => {
        if (results.rows._array.length > 0) {
          return setDangerModal({
            visible: true,
            title: "Caja ya escaneada",
            text: "No se puede agregar la misma caja dos veces",
            bg: "#dc3545",
            color: "#fff",
            buttons: [
              {
                text: "Continuar",
                onPress: () => {
                  setDangerModal({
                    visible: false,
                    title: "",
                    text: "",
                    buttons: [],
                  });

                  setCode("");
                  refs.code.current.focus();
                  return;
                },
              },
            ],
          });
        }
        console.log('results.rows._array', results.rows._array)

        const query = `SELECT * FROM CONGELADOS WHERE CODIGO = '${code}'`;
        ExecuteQuery(
          masterDb,
          query,
          [],
          (results) => {
            const product = results.rows._array[0];

            if (type === 'multi' && sendedBy !== 'qtyInput') {
              return refs.quantity.current.focus();
            }

            if (!quantity && sendedBy === "qtyInput") return setSnackbar({
              visible: true,
              text: "Ingrese una cantidad",
              type: "error",
            });

            if (results.rows._array.length === 0) {
              return setDangerModal({
                visible: true,
                title: `Caja ${code} NO Encontrada`,
                bg: "#dc3545",
                color: "#fff",
                text: "¿Desea agregarla igualmente?",
                buttons: [
                  {
                    text: "NO, NO AGREGAR",
                    onPress: () => {
                      setDangerModal({
                        visible: false,
                        title: "",
                        text: "",
                        buttons: [],
                      });
                      refs.code.current.focus();
                      setLastProduct({
                        DESCRIPCION: "",
                      });
                      return;
                    },
                    style: "cancel",
                  },
                  {
                    text: "Sí, agregar",
                    onPress: () => {
                      setDangerModal({
                        visible: false,
                        title: "",
                        text: "",
                        buttons: [],
                      });

                      addProductToDb({
                        COD_PROD: code,
                        exists: 'N',
                        type: type === 'single' ? "A" : "S",
                        DESCRIPCION: `Caja ${code}`,
                      }, quantity);

                      setCode("");
                      refs.code.current.focus();
                      setSnackbar({
                        visible: true,
                        text: "Caja agregada correctamente",
                        type: "success",
                      });
                      return;
                    },
                  },
                ],
              });
            } // * Si el producto no se encuentra en la base de datos, preguntamos si se quiere agregar igualmente

            addProductToDb({
              COD_PROD: code,
              exists: 'S',
              type: type === 'single' ? "A" : "S",
              DESCRIPCION: product['DESCRIPCIÓN'],
            }, quantity);

            setLastProduct({
              DESCRIPCION: product['DESCRIPCIÓN'],
            })

            setCode("");
            refs.code.current.focus();
            setSnackbar({
              visible: true,
              text: "Caja agregada correctamente",
              type: "success",
            });
          },
          (error) => {
            console.log("Error", error);
            setSnackbar({
              visible: true,
              text: "Error al buscar el producto en la base de datos",
              type: "error",
            });
          }
        );
      },
      (error) => {
        console.log("Error", error);
        setSnackbar({
          visible: true,
          text: "Error al buscar el producto en la base de datos",
          type: "error",
        });
      }
    );
  };

  const getPalletData = async (sendedBy) => {
    const db = SQLite.openDatabase("Maestro.db");
    const query = `SELECT * FROM CONGELADOS WHERE PALLET = '${codePallet}'`;

    ExecuteQuery(
      db,
      query,
      [],
      (results) => {
        if (results.rows._array.length === 0) {
          refs.code.current.focus();
          return setDangerModal({
            visible: true,
            title: `Pallet ${codePallet} NO Encontrado`,
            bg: "#dc3545",
            color: "#fff",
            buttons: [
              {
                text: "Continuar a caja",
                onPress: () => {
                  setDangerModal({
                    visible: false,
                    title: "",
                    text: "",
                    buttons: [],
                  });
                  setCodePallet("");
                  setDisabledPallet(true);

                  refs.code.current.focus();
                  return;
                },
              },
            ],
          });
        }

        if (type === 'multi' && sendedBy !== 'qtyInput') {
          return refs.quantity.current.focus()
        }

        if (!quantity && sendedBy === "qtyInput") return setSnackbar({
          visible: true,
          text: "Ingrese una cantidad",
          type: "error",
        });

        return setDangerModal({
          visible: true,
          title: `El pallet ${codePallet} tiene ${results.rows._array.length} caja(s)`,
          color: "#fff",
          bg: "#28a745",
          text: "¿Desea agregar estas cajas al inventario?",
          buttons: [
            {
              text: "NO, NO AGREGAR",
              onPress: () => {
                refs.code.current.focus();
                return;
              },
              style: "cancel",
            },
            {
              text: "Sí, agregar",
              onPress: async () => {
                ExecuteQuery(
                  db,
                  `SELECT * FROM INVENTARIO_APP WHERE area = "${area}" AND invtype = "INV" AND CorrelativoApertura = "${areaData.ESTADOTAG}" ORDER BY id DESC`,
                  [],
                  (result_inv) => {
                    results.rows._array.forEach((product, index) => {
                      addProductToDb({
                        COD_PROD: product.CODIGO,
                        exists: 'S',
                        type: type === 'single' ? "A" : "S",
                        DESCRIPCION: product['DESCRIPCIÓN'],
                      },
                        quantity,
                        result_inv.rows._array.length + (index + 1)
                      );

                      if (index === results.rows._array.length - 1) {
                        setLastProduct({
                          DESCRIPCION: `Pallet ${codePallet}`,
                        });
                      }
                    });

                    setDangerModal({
                      visible: false,
                      title: "",
                      text: "",
                      buttons: [],
                    });
                    setSnackbar({
                      visible: true,
                      text: "Cajas agregadas correctamente",
                      type: "success",
                    });
                    setCodePallet("");
                    refs.codePallet.current.focus();
                    return;

                  },
                  (error) => {
                    setSnackbar({
                      visible: true,
                      text: "Error al obtener los datos de los escaneos",
                      type: "error",
                    });
                    console.log(error);
                    return false;
                  }
                );
              },
            },
          ],
        });
      }
    );
  }

  useEffect(() => {
    getScansData();

    const db = SQLite.openDatabase("Maestro.db");
    ExecuteQuery(
      db,
      "SELECT * FROM AREAS WHERE NUM_AREA = ?",
      [area],
      (res) => {
        if (!res.rows._array[0]) return setSnackbar({
          visible: true,
          text: "El área no existe",
          type: "error",
        });

        setAreaData(res.rows._array[0]);
      },
      (err) => {
        console.log(err)
      }
    )
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps='handled'>
        <TopBar />
        <SectionBar
          section={type === "single" ? `Ingreso 1x1 - Área: ${area.slice(0, area.length - 1)}-${area.slice(-1)}` : `Ingreso por cantidad - Área: ${area.slice(0, area.length - 1)}-${area.slice(-1)}`}
          backTo={routes.captureMenu}
        />

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
              alignItems: "flex-start",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setArea("");
                return navigate(routes.captureMenu);
              }}
              style={{
                ...styles.logBtn,
                width: 120,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
                margin: 5,
                borderRadius: 5,
              }}
            >
              <Text style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 12
              }}>NUEVA ÁREA</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => confirmCloseArea()}
              style={{
                ...styles.logBtn,
                width: 120,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
                margin: 5,
                borderRadius: 5,
                backgroundColor: "#dc3545",
              }}
            >
              <Text style={{
                color: "#fff",
                textAlign: "center",
                fontSize: 12
              }}>CERRAR ÁREA</Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: "80%", justifyContent: "center" }}>
            <View style={styles.flex_row}>
              <TouchableOpacity
                style={{
                  ...styles.logBtn,
                  width: 40,
                  height: 35,
                  borderRadius: 5,
                  alignItems: "center",
                  padding: 0,
                  justifyContent: "center",
                }}
                onPress={() => {
                  setDisabledPallet(false);
                  setCodePallet("");
                  setLastProduct({
                    DESCRIPCION: "",
                  });
                  return refs.codePallet.current.focus();
                }}
              >
                <Text
                  style={{
                    ...styles.white,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  B
                </Text>
              </TouchableOpacity>

              <TextInput
                style={{
                  ...styles.input,
                  width: "70%",
                  height: 30,
                  borderBottomColor: "transparent",
                  fontSize: 20,
                  opacity: disabledPallet ? 0.5 : 1,
                }}
                onChangeText={disabledPallet ? () => { } : setCodePallet}
                value={disabledPallet ? "" : codePallet}
                ref={refs.codePallet}
                placeholder="Folio Pallet"
                onSubmitEditing={() => getPalletData('')}
                autoFocus
              />
            </View>
          </View>

          <View style={{ width: "80%", justifyContent: "center" }}>
            <View style={styles.flex_row}>
              <TouchableOpacity
                style={{
                  ...styles.logBtn,
                  width: 40,
                  height: 35,
                  borderRadius: 5,
                  alignItems: "center",
                  padding: 0,
                  justifyContent: "center",
                }}
                onPress={() => {
                  setCode("");
                  setLastProduct({
                    DESCRIPCION: "",
                  });
                  return refs.code.current.focus();
                }}
              >
                <Text
                  style={{
                    ...styles.white,
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  B
                </Text>
              </TouchableOpacity>

              <TextInput
                style={{
                  ...styles.input,
                  width: "70%",
                  height: 30,
                  borderBottomColor: "transparent",
                  fontSize: 20,
                }}
                onChangeText={setCode}
                value={code}
                ref={refs.code}
                placeholder="Folio Caja"
                onSubmitEditing={() => onCodeSubmit()}
                maxLength={parseInt(config.largo_prod)}
              />
            </View>

            {lastProduct.DESCRIPCION && (
              <Text
                style={{
                  marginTop: 5,
                  marginBottom: 5,
                  textAlign: "center",
                }}
              >
                {lastProduct.DESCRIPCION}
              </Text>
            )}

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >

              <>
                {type === "multi" ? (
                  <TextInput
                    onChange={(e) => {
                      // Filtrar solo caracteres numéricos, punto decimal y el signo negativo
                      const filteredText = e.nativeEvent.text.replace(/[^0-9.-]/g, '');

                      // Validar que no se ingresen más de 3 decimales
                      const decimalCount = filteredText.split('.')[1]?.length || 0;
                      if (decimalCount > 3) return;

                      if (parseFloat(filteredText) > 1000) return setDangerModal({
                        visible: true,
                        title: "Error",
                        text: "El valor máximo es 999.999",
                        buttons: [
                          {
                            text: "Entendido",
                            onPress: () => {
                              setDangerModal({
                                visible: false,
                                title: "",
                                text: "",
                                buttons: [],
                              });
                              refs.quantity.current.focus();
                            },
                            style: "cancel",
                          }
                        ],
                      })

                      if (parseFloat(filteredText) < -1000) return setDangerModal({
                        visible: true,
                        title: "Error",
                        text: "El valor mínimo es -999.999",
                        buttons: [
                          {
                            text: "Entendido",
                            onPress: () => {
                              setDangerModal({
                                visible: false,
                                title: "",
                                text: "",
                                buttons: [],
                              });
                              refs.quantity.current.focus();
                            },
                            style: "cancel",
                          }
                        ],
                      });

                      // Validar el rango máximo y mínimo
                      if (filteredText !== '' && (parseFloat(filteredText) > 999999 || parseFloat(filteredText) < -999999)) {
                        return;
                      }

                      setQuantity(filteredText);
                    }}
                    keyboardType="numeric"
                    value={quantity}
                    ref={refs.quantity}
                    style={{
                      ...styles.input,
                      fontWeight: "bold",
                      fontSize: 38,
                      width: 150,
                      textAlign: "center",
                      color: "#000",
                    }}
                    onEndEditing={() => {
                      codePallet ? getPalletData('qtyInput') : onCodeSubmit('qtyInput');
                    }}
                  />

                ) : (
                  <>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 38,
                        width: 70,
                        textAlign: "center",
                        color: "#000",
                      }}
                    >
                      {quantity > 0 && "+"}
                      {quantity}
                    </Text>
                  </>
                )}

                {type === "multi" && (
                  <TouchableOpacity
                    style={{
                      ...styles.logBtn,
                      width: 70,
                      borderRadius: 5,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setCalculatorModal(true);
                    }}
                  >
                    <Text
                      style={{
                        ...styles.white,
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      CALC
                    </Text>
                  </TouchableOpacity>
                )}
              </>

            </View>
          </View>

          <View
            style={{
              width: "80%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              style={{
                ...styles.logBtn,
                width: "49%",
                height: 45,
                justifyContent: 'center',
                borderRadius: 5,
              }}
              onPress={() =>
                navigate(
                  type === "single" ? "/review/single" : "/review/multiple"
                )
              }
            >
              <Text
                style={{
                  ...styles.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                REVISAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                ...styles.logBtn,
                width: "49%",
                height: 45,
                justifyContent: 'center',
                borderRadius: 5,
                alignItems: "center",
              }}
              onPress={() => navigate(routes.captureMenu)}
            >
              <Text
                style={{
                  ...styles.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                VOLVER
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ width: "80%" }}>
            <Text style={{ fontSize: 16, marginTop: 5 }}>
              Cantidad Prod Grabados: {scansData.products}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 5 }}>
              Cantidad de Scan Realizados: {scansData.scans}
            </Text>
            <Text style={{ fontSize: 16, marginTop: 5 }}>
              Total de productos: {scansData.totalOfArea}
            </Text>
          </View>
        </View>

        <Calculator
          setModalCalculatorVisible={setCalculatorModal}
          modalCalculatorVisible={calculatorModal}
          setQuantity={setQuantity}
        />
      </ScrollView>

      {confirmingClose && (
        <ConfirmCloseAreaModal
          area={area}
          onClose={() => setConfirmingClose(false)}
        />
      )}

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
                  setModal(false);
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
    </KeyboardAvoidingView>
  );
};

export default FreezedEntry;
