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
import { Link, useNavigate } from "react-router-native";
import edit_icon from "../assets/edit.png";
import { Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import reverse_icon from "../assets/reverse.png";

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

const ProductEntry = ({ type }) => {
  const { area, setArea, setSnackbar, config, user } = useContext(dataContext);
  const [calculatorModal, setCalculatorModal] = useState(false);
  const [code, setCode] = useState("");
  const [DBFindedProduct, setDBFindedProduct] = useState(false)
  const [quantity, setQuantity] = useState(
    type === "single" ? 1 : ''
  );
  const [lastProduct, setLastProduct] = useState({
    DESCRIPCION: "",
  });
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [modal, setModal] = useState(false);
  const [scansData, setScansData] = useState({
    products: "...",
    scans: "...",
  });

  const navigate = useNavigate();

  const refs = {
    code: useRef(null),
    quantity: useRef(null),
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

  const getScansData = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    const productsDb = [];
    const query = `SELECT * FROM INVENTARIO_APP WHERE type = "INV"`;

    await ExecuteQuery(
      db,
      query,
      [],
      (results) => {
        console.log("Query completed");

        // * Leemos los scans de la base de datos y contamos los productos no repetidos
        results.rows._array.forEach((product) => {
          if (!productsDb.includes(product.name)) productsDb.push(product.name);
        });

        setScansData({
          products: productsDb.length.toFixed(1),
          scans: results.rows._array.length.toFixed(1),
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

  const addProductToDb = async (product, qty = quantity) => {
    const db = SQLite.openDatabase("Maestro.db");
    const date =
      new Date().toLocaleDateString() + ": " + new Date().toLocaleTimeString();

    ExecuteQuery(
      db,
      "INSERT INTO INVENTARIO_APP (operator, name, quantity, date, posicion, area, pallet, caja, type, inventario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user.NOMBRES,
        product.DESCRIPCION,
        qty,
        date,
        "",
        area,
        "",
        "",
        "INV",
        config.inv_activo,
      ],
      (results) => {
        console.log("Results", results);
        getScansData();
        setSnackbar({
          visible: true,
          text: "Producto agregado correctamente",
          type: "success",
        });
        setCode("");
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
    const query = `SELECT * FROM MAESTRA  WHERE COD_PROD = '${codeToVerify}'`;

    ExecuteQuery(
      masterDb,
      query,
      [],
      (results) => {
        if (results.rows._array.length === 0) {
          setSnackbar({
            visible: true,
            text: "No se encontró el producto en la base de datos",
            type: "error",
          });
          refs.code.current.focus();
          return;
        }

        const product = results.rows._array[0];
        setLastProduct({ ...product, quantity });

        if (config.catalog_products && product.CATALOGADO == 1) {
          Alert.alert(
            "Producto Catalogado",
            "Este producto está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              {
                text: "Continuar",
                onPress: () => addProductToDb(product, quantity),
              },
            ],
            { cancelable: false }
          );
        } // * Si el software está para NO CATALOGADOS, avisamos sobre los que están CATALOGADOS ( CATALOGADO = 1 )

        if (!config.catalog_products && product.CATALOGADO == 0) {
          Alert.alert(
            "Producto NO Catalogado",
            "Este producto NO está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              {
                text: "Continuar",
                onPress: () => addProductToDb(product, quantity),
              },
            ],
            { cancelable: false }
          );
        } // * Si el software está para CATALOGADOS, avisamos sobre los que están NO CATALOGADOS ( CATALOGADO = 0 )

        if (
          (config.catalog_products && product.CATALOGADO == 0) ||
          (!config.catalog_products && product.CATALOGADO == 1)
        ) {
          addProductToDb(product, quantity);
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

  const onCodeSubmit = async () => {
    if (!code)
      return setSnackbar({
        visible: true,
        text: "Ingrese un código",
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

    if (config.pesables) return validatePesable(codeToSend, codeImplicit); // * Si el software está para PESABLES, validamos el código
    console.log("Code to send", codeToSend);
    const masterDb = SQLite.openDatabase("Maestro.db");
    const query = `SELECT * FROM MAESTRA WHERE COD_PROD = '${codeToSend}'`;

    ExecuteQuery(
      masterDb,
      query,
      [],
      (results) => {
        console.log("Results", results.rows._array.length);
        if (results.rows._array.length === 0) {
          setSnackbar({
            visible: true,
            text: "No se encontró el producto en la base de datos",
            type: "error",
          });
          refs.code.current.focus();
          return;
        }

        if (type === 'multi') return onQuantitySubmit();

        const product = results.rows._array[0];
        setLastProduct(product);

        if (config.catalog_products && product.CATALOGADO == 1) {
          Alert.alert(
            "Producto Catalogado",
            "Este producto está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              { text: "Continuar", onPress: () => addProductToDb(product) },
            ],
            { cancelable: false }
          );
        } // * Si el software está para NO CATALOGADOS, avisamos sobre los que están CATALOGADOS ( CATALOGADO = 1 )

        if (!config.catalog_products && product.CATALOGADO == 0) {
          Alert.alert(
            "Producto NO Catalogado",
            "Este producto NO está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              { text: "Continuar", onPress: () => addProductToDb(product) },
            ],
            { cancelable: false }
          );
        } // * Si el software está para CATALOGADOS, avisamos sobre los que están NO CATALOGADOS ( CATALOGADO = 0 )

        if (
          (config.catalog_products && product.CATALOGADO == 0) ||
          (!config.catalog_products && product.CATALOGADO == 1)
        ) {
          addProductToDb(product);
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

  const onQuantitySubmit = () => {
    if (!code)
      return setSnackbar({
        visible: true,
        text: "Ingrese un código",
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

    if (config.pesables) return validatePesable(codeToSend, codeImplicit); // * Si el software está para PESABLES, validamos el código
    console.log("Code to send", codeToSend);
    const masterDb = SQLite.openDatabase("Maestro.db");
    const query = `SELECT * FROM MAESTRA WHERE COD_PROD = '${codeToSend}'`;

    ExecuteQuery(
      masterDb,
      query,
      [],
      (results) => {
        if (results.rows._array.length === 0) {
          setSnackbar({
            visible: true,
            text: "No se encontró el producto en la base de datos",
            type: "error",
          });
          refs.code.current.focus();
          return;
        }

        const product = results.rows._array[0];
        setLastProduct(product);

        if (config.catalog_products && product.CATALOGADO == 1) {
          Alert.alert(
            "Producto Catalogado",
            "Este producto está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              {
                text: "Continuar", onPress: () => {
                  refs.quantity.current.focus();
                  setDBFindedProduct(product);
                }
              },
            ],
            { cancelable: false }
          );
        } // * Si el software está para NO CATALOGADOS, avisamos sobre los que están CATALOGADOS ( CATALOGADO = 1 )

        if (!config.catalog_products && product.CATALOGADO == 0) {
          Alert.alert(
            "Producto NO Catalogado",
            "Este producto NO está catalogado, ¿Desea continuar?",
            [
              {
                text: "Cancelar",
                onPress: () => refs.code.current.focus(),
                style: "cancel",
              },
              {
                text: "Continuar", onPress: () => {
                  refs.quantity.current.focus();
                  setDBFindedProduct(product);
                }
              },
            ],
            { cancelable: false }
          );
        } // * Si el software está para CATALOGADOS, avisamos sobre los que están NO CATALOGADOS ( CATALOGADO = 0 )

        if (
          (config.catalog_products && product.CATALOGADO == 0) ||
          (!config.catalog_products && product.CATALOGADO == 1)
        ) {
          refs.quantity.current.focus();
          setDBFindedProduct(product);
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
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />
        <SectionBar
          section={type === "single" ? "Ingreso 1x1" : "Ingreso por cantidad"}
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
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "80%",
              marginTop: 10,
            }}
          >
            <Text style={[styles.subtitle, { fontSize: 13, fontWeight: 'normal' }]}>Área: {area}</Text>
            <TouchableOpacity
              onPress={() => {
                setModal(true);
              }}
              style={{
                ...styles.logBtn,
                width: 30,
                padding: 5,
                margin: 5,
                borderRadius: 5,
              }}
            >
              <Image
                style={{
                  width: 15,
                  height: 15,
                }}
                source={edit_icon}
              />
            </TouchableOpacity>
          </View>

          <View style={{ width: "80%", justifyContent: "center" }}>
            <View style={styles.flex_row}>
              <TouchableOpacity
                style={{
                  ...styles.logBtn,
                  width: 40,
                  height: 40,
                  borderRadius: 5,
                  alignItems: "center",
                }}
                onPress={() => setCode("")}
              >
                <Text
                  style={{
                    ...styles.white,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  B
                </Text>
              </TouchableOpacity>

              <TextInput
                style={{
                  ...styles.input,
                  width: "70%",
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
              {!config.pesables && (
                <>
                  {type === "multi" ? (
                    <TextInput
                      onChange={(e) => {
                        // Filtrar solo caracteres numéricos, punto decimal y el signo negativo
                        const filteredText = e.nativeEvent.text.replace(/[^0-9.-]/g, '');

                        // Validar que no se ingresen más de 3 decimales
                        const decimalCount = filteredText.split('.')[1]?.length || 0;
                        if (decimalCount > 3) return;

                        if (parseFloat(filteredText) > 1000) return setQuantity('999.999');
                        if (parseFloat(filteredText) < -1000) return setQuantity('-999.999');

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
                      onEndEditing={() => addProductToDb(DBFindedProduct, quantity)}
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
              )}

              {config.pesables && (
                <>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 30,
                      width: 300,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {lastProduct.quantity || "..."} KG
                  </Text>
                </>
              )}
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
                width: "30%",
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
                width: "30%",
                borderRadius: 5,
                alignItems: "center",
              }}
              onPress={() => onCodeSubmit()}
            >
              <Text
                style={{
                  ...styles.white,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                GRABAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                ...styles.logBtn,
                width: "30%",
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

const stylesLocal = StyleSheet.create({});

export default ProductEntry;
