import React, { useContext, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import styles from "../styles/styles";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import env from "../env";
import { dataContext } from "../context/dataContext";

const SupervisorApprobalModal = ({
  setModalVisible,
  modalVisible,
  user,
  idDesired,
  setSelectedId,
  setConfig,
  config,
  authType,
  setAuthType,
  setSelectDBModal
}) => {
  const {setSnackbar} = useContext(dataContext)
  const [code, setCode] = useState("");
  const input = useRef(null);

  const checkSupervisorCode = async () => {
    const adminPassword = await AsyncStorage.getItem(env.asyncStorage.adminPassword);
    console.log(env.asyncStorage.adminPassword, adminPassword);

    if (!user || !user.CLAVE) {
      setCode("");
      setSnackbar({
        visible: true,
        text: `Error al obtener clave de supervisor`,
        type: "error",
      });
    }

    if (code === adminPassword) {
      if (authType === "buttons") {
        setSelectedId(idDesired);
        setConfig({ ...config, buttons_config: idDesired });
      }
      
      if (authType === "pesables") {
        setConfig({
          ...config,
          pesables: !config.pesables,
        });
      }
      if (authType === "catalog_products") {
        setConfig({
          ...config,
          catalog_products: !config.catalog_products,
        });
      }

      if (authType === "new_db") {
        setSelectDBModal(true);
      }

      setSnackbar({
        visible: true,
        text: `Permisos de supervisor conseguidos`,
        type: "success",
      });
      setAuthType("");
      setCode("");
      setModalVisible(false);
    } else {
      setCode("");
      setModalVisible(false);
      setSnackbar({
        visible: true,
        text: `Permisos de supervisor denegados`,
        type: "error",
      });
    }
  };
  return (
    <>
      <View style={stylesModal.centeredView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
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
                Ingrese código de supervisor
              </Text>
              <TextInput
                onChangeText={(value) => setCode(value)}
                value={code.toString()}
                style={styles.input}
                showSoftInputOnFocus={false}
                ref={input}
                autoFocus
                onSubmitEditing={() => checkSupervisorCode()}
              />
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};
export default SupervisorApprobalModal;

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
