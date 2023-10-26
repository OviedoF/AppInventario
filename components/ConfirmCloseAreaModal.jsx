import React from "react";
import styles from "../styles/styles";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";

export default function ConfirmCloseAreaModal({ area, onClose }) {
  return (
    <View style={styles.modal}>
      <View style={[styles.modalContent]}>
        <Text
          style={[
            styles.title,
            {
              fontSize: 30,
            },
          ]}
        >
          PRECAUCIÓN
        </Text>
        <Text
          style={{
            fontSize: 20,
            marginTop: 20,
          }}
        >
          Vamos a cerrar el area: {area}
        </Text>

        <View
          style={{
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
            }}
          >
            Cantidad de Scan Realizados: 2
          </Text>
        </View>

        <View
          style={{
            fontSize: 30,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
            }}
          >
            Cantidad de Productos Grabados: 2.0
          </Text>
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            style={{
              ...styles.logBtn,
              width: "45%",
              borderRadius: 5,
            }}
            onPress={onClose}
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

          <TouchableOpacity
            style={{
              ...styles.logBtn,
              width: "45%",
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
              CERRAR
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
