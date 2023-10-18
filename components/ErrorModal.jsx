import React from "react";
import { Alert, Modal, Text, View, TouchableOpacity } from "react-native";

const ErrorModal = ({ message, setModalFailVisible, modalFailVisible }) => {
  return (
    <>
      <View style={stylesModal.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalFailVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalFailVisible(!modalFailVisible);
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
                {message ? message : "Revisar formulario incompleto"}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[stylesModal.button, stylesModal.buttonSave]}
                  onPress={() => setModalFailVisible(!modalFailVisible)}
                >
                  <Text style={stylesModal.textStyle}>VOLVER</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};
export default ErrorModal;

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
