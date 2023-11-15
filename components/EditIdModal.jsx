import React, { useRef } from "react";
import {
  Alert,
  Modal,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import styles from "../styles/styles";
import { createOrUpdateId } from "../helpers/db";

const EditIdModal = ({ id, setId, setModalVisible, modalVisible }) => {
  const inputEdit = useRef(null);

  return (
    <>
      <View style={stylesModal.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View
            style={[
              stylesModal.centeredView,
              { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            ]}
          >
            <View style={stylesModal.modalView}>
              <Text
                style={[
                  stylesModal.modalText,
                  { fontWeight: "bold", fontSize: 16 },
                ]}
              >
                Ingrese ID de capturador
              </Text>
              <TextInput
                onChangeText={(value) => setId(value)}
                value={id.toString()}
                style={styles.input}
                showSoftInputOnFocus={false}
                ref={inputEdit}
                autoFocus
                onSubmitEditing={() => {
                  setModalVisible(!modalVisible);
                }}
              />
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={styles.logBtn}
                  onPress={() => {
                    createOrUpdateId(id);
                    setModalVisible(!modalVisible);
                  }}
                >
                  <Text style={stylesModal.textStyle}>EDITAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};
export default EditIdModal;

const stylesModal = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    width: 96,
    height: 48,
    borderColor: "blue",
    justifyContent: "center",
    color: "white",
    backgroundColor: "#4960F9",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  textStyle: {
    color: "#f5f5f5",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
