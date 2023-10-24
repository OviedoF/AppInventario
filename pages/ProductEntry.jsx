import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import { StyleSheet } from "react-native";
import { useNavigate } from "react-router-native";
import ConfirmCloseAreaModal from "../components/ConfirmCloseAreaModal";
import Calculator from "../components/Calculator";

const ProductEntry = ({ type }) => {
  console.log(type === "single");
  const [modal, setModal] = useState(true);
  const [calculatorModal, setCalculatorModal] = useState(false);
  const [area, setArea] = useState("");
  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const navigate = useNavigate();
  const refs = {
    area: useRef(null),
    code: useRef(null),
    quantity: useRef(null),
  };

  useEffect(() => {
    if (modal) refs.area.current.focus();
  }, [modal]);

  const confirmArea = () => {
    console.log("Area: ", area);
    if (area === "") {
      alert("Ingrese un área");
      return;
    }

    setModal(false);
    refs.code.current.focus();
  };

  return (
    <View>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
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
                width: 50,
                height: 50,
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
              ...styles.subtitle,
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
                  width: "40%",
                  width: 50,
                  height: 50,
                  borderRadius: 5,
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
                  width: 50,
                  height: 50,
                  borderRadius: 5,
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
                  height: 50,
                  borderRadius: 5,
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
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={{
              ...styles.logBtn,
              width: "30%",
              height: 50,
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
              height: 50,
              borderRadius: 5,
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
              height: 50,
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
              VOLVER
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: "80%" }}>
          <Text style={{ fontSize: 18, marginTop: 5 }}>
            Cantidad Prod Grabados: 2.0
          </Text>
          <Text style={{ fontSize: 18, marginTop: 5 }}>
            Cantidad de Scan Realizados: 2
          </Text>
        </View>
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
      <Calculator
        setModalCalculatorVisible={setCalculatorModal}
        modalCalculatorVisible={calculatorModal}
      />

      {confirmingClose && (
        <ConfirmCloseAreaModal
          area={area}
          onClose={() => setConfirmingClose(false)}
        />
      )}
    </View>
  );
};

const stylesLocal = StyleSheet.create({});

export default ProductEntry;