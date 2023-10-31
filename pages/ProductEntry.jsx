import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import { StyleSheet } from "react-native";
import ConfirmCloseAreaModal from "../components/ConfirmCloseAreaModal";
import Calculator from "../components/Calculator";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/dataContext";

const ProductEntry = ({ type }) => {
  console.log(type === "single");
  const { area, setArea } = useContext(dataContext);
  const [calculatorModal, setCalculatorModal] = useState(false);
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const refs = {
    code: useRef(null),
    quantity: useRef(null),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar text={"ID:"} />
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
            <Text style={styles.subtitle}>Área: {area}</Text>

            <TouchableOpacity
              onPress={() => {
                setModal(true);
              }}
              style={{
                ...styles.logBtn,
                width: "40%",
              }}
            >
              <Text style={[styles.white, styles.textCenter]}>CAMBIAR</Text>
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
                keyboardType="numeric"
                style={{
                  ...styles.input,
                  width: "70%",
                }}
                onChangeText={setCode}
                value={code}
                ref={refs.code}
                placeholder="Código"
                onSubmitEditing={() => {
                  if (type === "single") {
                    alert("Grabar producto");
                    refs.code.current.clear();
                    refs.code.current.focus();
                  } else {
                    refs.quantity.current.focus();
                  }
                }}
              />
            </View>

            <Text
              style={{
                marginTop: 5,
                marginBottom: 5,
                textAlign: "center",
              }}
            >
              CIGARRO PREMIER SELECT X 20 UN
            </Text>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {type === "multi" && (
                <TouchableOpacity
                  style={{
                    ...styles.logBtn,
                    width: 40,
                    height: 40,
                    borderRadius: 5,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (quantity === 1) return;
                    setQuantity(quantity - 1);
                  }}
                >
                  <Text
                    style={{
                      ...styles.white,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    -
                  </Text>
                </TouchableOpacity>
              )}

              {type === "multi" ? (
                <TextInput
                  onChange={(e) => {
                    setQuantity(parseInt(e.nativeEvent.text));
                  }}
                  keyboardType="numeric"
                  ref={refs.quantity}
                  style={{
                    ...styles.input,
                    fontWeight: "bold",
                    fontSize: 38,
                    width: 70,
                    textAlign: "center",
                    color: "#000",
                  }}
                  onEndEditing={() => setConfirmingClose(true)}
                >
                  {quantity}
                </TextInput>
              ) : (
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 38,
                    width: 70,
                    textAlign: "center",
                    color: "#000",
                  }}
                >
                  + {quantity}
                </Text>
              )}

              {type === "multi" && (
                <TouchableOpacity
                  style={{
                    ...styles.logBtn,
                    width: 40,
                    height: 40,
                    borderRadius: 5,
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setQuantity(quantity + 1);
                  }}
                >
                  <Text
                    style={{
                      ...styles.white,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
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
              onPress={() => setConfirmingClose(true)}
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
              Cantidad Prod Grabados: 2.0
            </Text>
            <Text style={{ fontSize: 16, marginTop: 5 }}>
              Cantidad de Scan Realizados: 2
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
    </KeyboardAvoidingView>
  );
};

const stylesLocal = StyleSheet.create({});

export default ProductEntry;
