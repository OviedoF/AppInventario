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
import styles from "../../styles/styles";
import SectionBar from "../../components/SectionBar";
import routes from "../../router/routes";
import Calculator from "../../components/Calculator";
import TopBar from "../../components/TopBar";
import { dataContext } from "../../context/dataContext";
import { useNavigate } from "react-router-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../../helpers/ExecuteQuery";
import reverse_icon from "../../assets/reverse.png";
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

const CDFreezedEntry = ({ type }) => {
  const { setSnackbar, config, user, setDangerModal, serie, cdInfo } = useContext(dataContext);
  const [infoData, setInfoData] = useState({
    ESTADO: '',
    ESTADONUM: ''
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
  const [scansData, setScansData] = useState({
    products: "...",
    scans: "...",
    totalOfArea: "...",
  });

  const navigate = useNavigate();

  const refs = {
    code: useRef(null),
    quantity: useRef(null),
    codePallet: useRef(null),
  };

  const getScansData = async () => {
    const posicion = cdInfo.posicion || '';
    const pallet = cdInfo.pallet || '';
    const caja = cdInfo.caja || '';
    const area = cdInfo.area || '';

    const db = SQLite.openDatabase("Maestro.db");
    const productsDb = [];
    let query = `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND posicion = "${posicion}" AND pallet = "${pallet}" AND caja = "${caja}" AND area = "${area}"`;

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
          if (config.index_capt == 2 && product.posicion == cdInfo.posicion) totalProducts += parseFloat(product.quantity);
          if ((config.index_capt == 3 || config.index_capt == 5) && product.area == cdInfo.area) totalProducts += parseFloat(product.quantity);
          if ((config.index_capt == 4 || config.index_capt == 6) && product.caja == cdInfo.caja) totalProducts += parseFloat(product.quantity);
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

  const addProductToDb = async (product, qty = quantity, additionType) => {
    const db = SQLite.openDatabase("Maestro.db");
    const date = new Date().toISOString();
    const posicion = cdInfo.posicion;
    const pallet = config.index_capt == 4 || config.index_capt == 5 ? cdInfo.pallet ? cdInfo.pallet : '' : "";
    const caja = config.index_capt == 4 || config.index_capt == 6 ? cdInfo.caja ? cdInfo.caja : '' : "";
    const area = config.index_capt == 3 || config.index_capt == 5 ? cdInfo.area ? cdInfo.area : '' : "";

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
      `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND posicion = "${posicion}" AND pallet = "${pallet}" AND caja = "${caja}" AND area = "${area}"`,
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
            posicion,
            area,
            pallet,
            caja,
            product.type,
            config.inv_activo,
            serie ? serie : '',
            product.exists ? product.exists : 'S',
            infoData.ESTADO == 'INI' ? '0' : infoData.ESTADO,
            infoData.ESTADONUM,
            'INV',
            product.DESCRIPCION,
            results.rows._array.length + 1
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
                  }, quantity, "1X1");

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
        }, quantity, "1X1");

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
          return setSnackbar({
            visible: true,
            text: "Pallet no encontrado",
            type: "error",
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
              onPress: () => {
                results.rows._array.forEach((product, index) => {
                  addProductToDb({
                    COD_PROD: product.CODIGO,
                    exists: 'S',
                    type: type === 'single' ? "A" : "S",
                    DESCRIPCION: product['DESCRIPCIÓN'],
                  }, quantity, "1X1");

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
            },
          ],
        });
      }
    );
  }

  useEffect(() => {
    getScansData();
    const posicion = cdInfo.posicion || '';
    const pallet = cdInfo.pallet || '';
    const caja = cdInfo.caja || '';
    const area = cdInfo.area || '';

    const db = SQLite.openDatabase("Maestro.db");
    let query = `SELECT * FROM COMBINACIONES_CD WHERE posicion = "${posicion}" AND pallet = "${pallet}" AND caja = "${caja}" AND area = "${area}"`;

    ExecuteQuery(
      db,
      query,
      [],
      (res) => {
        if (!res.rows._array[0]) return setSnackbar({
          visible: true,
          text: "No se encontró la combinación",
          type: "error",
        });

        setInfoData({
          ESTADONUM: res.rows._array[0].status_num,
          ESTADO: res.rows._array[0].status_corr,
        });
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
          section={type === "single" ? `Ingreso 1x1 - ${config.index_capt === 2 ? `Pos: ${cdInfo.posicion}` :
              config.index_capt === 3 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
                config.index_capt === 4 ? `Caja: ${cdInfo.caja}` :
                  config.index_capt === 5 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
                    config.index_capt === 6 ? `Caja: ${cdInfo.caja}` : `Pos: ${cdInfo.posicion}`
            }` : `Ingreso por cantidad - ${config.index_capt === 2 ? `Pos: ${cdInfo.posicion}` :
            config.index_capt === 3 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
              config.index_capt === 4 ? `Caja: ${cdInfo.caja}` :
                config.index_capt === 5 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
                  config.index_capt === 6 ? `Caja: ${cdInfo.caja}` : `Pos: ${cdInfo.posicion}`
          }`}
          backTo={routes.cD}
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
                return navigate(routes.cDEdit);
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
              }}>NUEVOS DATOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate(routes.cDFastSend)}
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
              }}>CERRAR DATOS</Text>
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
                }}
                onChangeText={setCodePallet}
                value={codePallet}
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

                    <TouchableOpacity
                      onPress={() => {
                        quantity === 1 ? setQuantity(-1) : setQuantity(1);
                      }}
                      style={{
                        backgroundColor: "transparent",
                        width: 30,
                        padding: 5,
                        margin: 5,
                      }}
                    >
                      <Image
                        style={{ width: 30, height: 30 }}
                        source={reverse_icon}
                      />
                    </TouchableOpacity>
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
                  type === "single" ? "/cdReview/single" : "/cdReview/multiple"
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
              onPress={() => navigate(routes.cD)}
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
    </KeyboardAvoidingView>
  );
};

export default CDFreezedEntry;
