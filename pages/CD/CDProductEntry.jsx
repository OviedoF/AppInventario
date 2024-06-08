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

const CDProductEntry = ({ type }) => {
  const { setSnackbar, config, user, setDangerModal, serie, cdInfo, setCdInfo } = useContext(dataContext);
  const [infoData, setInfoData] = useState({
    ESTADO: '',
    ESTADONUM: ''
  })
  const [calculatorModal, setCalculatorModal] = useState(false);
  const [code, setCode] = useState("");
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
        console.log("Results", results.rows._array);
        // * Leemos los scans de la base de datos y contamos los productos no repetidos
        results.rows._array.forEach((product) => {
          if (!productsDb.includes(product.name)) productsDb.push(product.name);
        });

        let totalProducts = 0;

        results.rows._array.forEach((product) => {
          if(config.index_capt == 2 && product.posicion == cdInfo.posicion) totalProducts += parseFloat(product.quantity);
          if((config.index_capt == 3 || config.index_capt == 5) && product.area == cdInfo.area) totalProducts += parseFloat(product.quantity);
          if((config.index_capt == 4 || config.index_capt == 6) && product.caja == cdInfo.caja) totalProducts += parseFloat(product.quantity);
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
            setLastProduct({ ...product, quantity, type: additionType });
            if (type === 'multi') setQuantity('');
            if (type === 'single') setQuantity(1);
            refs.code.current.clear();
            refs.code.current.focus();
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

  const validatePesable = (code, codeImplicit) => {
    const sixDigits = codeImplicit.substring(0, 6);
    const lastSixDigits = code.substring(config.largo_prod - 6, config.largo_prod - 1);

    const controlDigit = GTIN8Digit(`0${sixDigits}`);

    // * Rellenar con 0 hasta la longitud original del código

    let codeToVerify = sixDigits;

    const codeLength = codeToVerify.length;
    const codeToAdd = codeImplicit.length - codeLength;
    for (let i = 0; i < codeToAdd; i++) {
      codeToVerify = `${codeToVerify}0`;
    }

    // * Reemplazar el último numero por el dígito de control

    codeToVerify = codeToVerify.slice(0, -1) + controlDigit;
    const quantity = GtoKG(lastSixDigits);

    // * Si el código no cumple con la configuración, rellenamos el código con 0s a la izquierda

    if (codeToVerify.length < config.largo_prod) {
      const codeLength = codeToVerify.length;
      const codeToAdd = config.largo_prod - codeLength;
      for (let i = 0; i < codeToAdd; i++) {
        codeToVerify = `0${codeToVerify}`;
      }
    }

    console.log("Code to verify", codeToVerify);
    console.log("Cantidad", quantity);

    const masterDb = SQLite.openDatabase("Maestro.db");
    const query = `SELECT * FROM MAESTRA WHERE COD_PROD = '${codeToVerify}'`;

    ExecuteQuery(
      masterDb,
      query,
      [],
      (results) => {

        const product = results.rows._array[0];

        if (results.rows._array.length === 0) {
          return setDangerModal({
            visible: true,
            title: "Producto NO Encontrado",
            bg: "#dc3545",
            color: "#fff",
            text: "¿Desea agregarlo igualmente?",
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
                    ...lastProduct,
                    DESCRIPCION: "",
                  });
                  setCode("");
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
                    COD_PROD: codeToVerify,
                    exists: 'N',
                    type: "S",
                    DESCRIPCION: `PESABLE ${codeToVerify} x ${quantity}kg`,
                  }, quantity, "PESABLE");

                  return;
                },
              },
            ],
          });
        } // * Si el producto no se encuentra en la base de datos, preguntamos si se quiere agregar igualmente

        if (config.catalog_products && product.CATALOGADO == 1) {
          setDangerModal({
            visible: true,
            title: "Producto Catalogado",
            text: "Este producto es catalogado. Si quiere añadirlo desactive la opción de no catalogados.",
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
                  refs.code.current.focus();
                },
                style: "cancel",
              }
            ],
          });
        } // * Si el software está para NO CATALOGADOS, avisamos sobre los que están CATALOGADOS ( CATALOGADO = 1 )

        if (!config.catalog_products && product.CATALOGADO == 0) {
          setDangerModal({
            visible: true,
            title: "Producto NO Catalogado",
            text: "Este producto NO está catalogado, ¿Desea continuar?",
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
                  setLastProduct({
                    ...lastProduct,
                    DESCRIPCION: "",
                  });
                  refs.code.current.focus();
                },
                style: "cancel",
              },
              {
                text: "Continuar",
                onPress: () => {
                  setDangerModal({
                    visible: false,
                    title: "",
                    text: "",
                    buttons: [],
                  });
                  addProductToDb({
                    ...product,
                    DESCRIPCION: `${product.DESCRIPCION} x ${quantity}kg`,
                    type: "S"
                  }, quantity, "PESABLE");
                },
              },
            ],
          });
        } // * Si el software está para CATALOGADOS, avisamos sobre los que están NO CATALOGADOS ( CATALOGADO = 0 )

        if (
          (config.catalog_products && product.CATALOGADO == 0) ||
          (!config.catalog_products && product.CATALOGADO == 1)
        ) {
          addProductToDb({
            ...product,
            DESCRIPCION: `${product.DESCRIPCION} x ${quantity}kg`,
            type: "S"
          }, quantity, "PESABLE");
        }
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

  const onCodeSubmit = async (sendedBy) => {
    if (!code)
      return setSnackbar({
        visible: true,
        text: "Ingrese un código",
        type: "error",
      });

    if(!quantity && sendedBy === "qtyInput") return setSnackbar({
      visible: true,
      text: "Ingrese una cantidad",
      type: "error",
    });

    let codeImplicit = code;
    let codeToSend = code;
    if (codeToSend.length < config.largo_prod) {
      const codeLength = codeToSend.length;
      const codeToAdd = config.largo_prod - codeLength;
      for (let i = 0; i < codeToAdd; i++) {
        codeToSend = `0${codeToSend}`;
      }
      setCode(codeToSend);
    } // * Si el código no cumple con la configuración, rellenamos el código con 0s a la izquierda

    // * ¿El código empieza con 25?

    const firstTwoDigits = codeImplicit.substring(0, 2);

    if (config.pesables && firstTwoDigits.toString() == "25") return validatePesable(codeToSend, codeImplicit); // * Si el software está para PESABLES, validamos el código

    // if (!config.pesables && firstTwoDigits.toString() == "25") return setDangerModal({
    //   visible: true,
    //   title: "Producto PESABLE",
    //   text: "Este producto es pesable. Si quiere añadirlo active la opción de pesables.",
    //   buttons: [
    //     {
    //       text: "Entendido",
    //       onPress: () => {
    //         setDangerModal({
    //           visible: false,
    //           title: "",
    //           text: "",
    //           buttons: [],
    //         });
    //         refs.code.current.focus();
    //         refs.code.current.clear();
    //       },
    //       style: "cancel",
    //     }
    //   ],
    // });

    const masterDb = SQLite.openDatabase("Maestro.db");
    const query = `SELECT * FROM MAESTRA WHERE COD_PROD = '${codeToSend}'`;

    ExecuteQuery(
      masterDb,
      query,
      [],
      (results) => {
        const product = results.rows._array[0];

        console.log("Results", results.rows._array.length);
        if (results.rows._array.length === 0) {
          return setDangerModal({
            visible: true,
            title: `Producto ${codeToSend} NO Encontrado`,
            bg: "#dc3545",
            color: "#fff",
            text: "¿Desea agregarlo igualmente?",
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

                  if (type === 'multi' && sendedBy !== 'qtyInput') {
                    setLastProduct({
                      DESCRIPCION: `NO ENCONTRADO ${codeToSend}`,
                    });

                    return refs.quantity.current.focus();
                  }

                  addProductToDb({
                    COD_PROD: codeToSend,
                    exists: 'N',
                    type: type === 'single' ? "A" : "S",
                    DESCRIPCION: codeToSend,
                  }, quantity, "1X1");
                  return;
                },
              },
            ],
          });
        } // * Si el producto no se encuentra en la base de datos, preguntamos si se quiere agregar igualmente

        if (type === 'multi' && sendedBy !== 'qtyInput') {
          setLastProduct({
            ...product,
            DESCRIPCION: product.DESCRIPCION,
          });

          return refs.quantity.current.focus();
        }

        if (config.catalog_products && product.CATALOGADO == 1) {
          setDangerModal({
            visible: true,
            title: "Producto Catalogado",
            text: "Este producto es catalogado. Si quiere añadirlo desactive la opción de no catalogados.",
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
                  refs.code.current.focus();
                },
                style: "cancel",
              }
            ],
          });
        } // * Si el software está para NO CATALOGADOS, avisamos sobre los que están CATALOGADOS ( CATALOGADO = 1 )

        if (!config.catalog_products && product.CATALOGADO == 0) {
          setDangerModal({
            visible: true,
            title: "Producto NO Catalogado",
            text: "Este producto NO está catalogado, ¿Desea continuar?",
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
                  refs.code.current.focus();
                },
                style: "cancel",
              },
              {
                text: "Continuar",
                onPress: () => {
                  setDangerModal({
                    visible: false,
                    title: "",
                    text: "",
                    buttons: [],
                  });
                  addProductToDb({
                    ...product,
                    type: type === 'single' ? "A" : "S"
                  }, quantity, "1X1");
                },
              },
            ],
          });
        } // * Si el software está para CATALOGADOS, avisamos sobre los que están NO CATALOGADOS ( CATALOGADO = 0 )

        if (
          (config.catalog_products && product.CATALOGADO == 0) ||
          (!config.catalog_products && product.CATALOGADO == 1)
        ) {
          addProductToDb({
            ...product,
            type: type === 'single' ? "A" : "S"
          }, quantity, "1X1");
        }
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
        console.log("Combinaciones", res.rows._array);
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

  useEffect(() => {
    console.log("Last Product", lastProduct);
  }, [lastProduct]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps='handled'>
        <TopBar />
        <SectionBar
          section={type === "single" ? `Ingreso 1x1 - ${
            config.index_capt === 2 ? `Pos: ${cdInfo.posicion}` : 
            config.index_capt === 3 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
            config.index_capt === 4 ? `Caja: ${cdInfo.caja}` :
            config.index_capt === 5 ? `Área: ${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}` :
            config.index_capt === 6 ? `Caja: ${cdInfo.caja}` : `Pos: ${cdInfo.posicion}`
          }` : `Ingreso por cantidad - ${
            config.index_capt === 2 ? `Pos: ${cdInfo.posicion}` :
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
                placeholder="Código"
                onSubmitEditing={() => onCodeSubmit()}
                autoFocus
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
                    onEndEditing={() => onCodeSubmit('qtyInput')}
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

export default CDProductEntry;
