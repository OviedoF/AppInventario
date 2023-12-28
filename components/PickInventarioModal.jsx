import React, { useRef, useState, useContext, useEffect } from "react";
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";
import env from "../env";
import { useNavigate } from "react-router-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import routes from "../router/routes";

const PickInventoryModal = ({ setModalVisible, modalVisible }) => {
  const [inventories, setInventories] = useState([]);
  const { config, setConfig, setSnackbar, setInventario } =
    useContext(dataContext);

  useEffect(() => {
    
    const getInventories = async () => {
      try {
        const db = SQLite.openDatabase("Maestro.db");

        ExecuteQuery(
          db,
          "SELECT * FROM INV_ACTIVOS",
          [],
          (result) => {
            const inventories = result.rows._array;

            if (!inventories.length)
              return setSnackbar({
                visible: true,
                text: "No hay inventarios en la DB",
                type: "error",
              });

            setInventories(inventories);
            console.log(inventories);
          },
          (error) => {
            console.log(error);
          }
        );
      } catch (error) {
        console.log(error);
      }
    };

    getInventories();

    return () => {
      setInventories([]);
    }
  }, []);

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
              <Text style={stylesModal.modalText}>
                Selecciona un inventario
              </Text>

              {inventories.map((inventory, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.primaryBtn, {
                    marginBottom: 10,
                    width: 250,
                  }]}
                  onPress={async () => {
                    setConfig({ ...config, inv_activo: inventory.ID_INV });
                    setInventario(`${inventory.ID_INV}. ${inventory.DESCRIPCION}`);
                    await AsyncStorage.setItem(env.asyncStorage.invSelected, `${inventory.ID_INV}. ${inventory.DESCRIPCION}`);
                    setModalVisible(!modalVisible);
                    return setSnackbar({
                      visible: true,
                      text: "Inventario seleccionado",
                      type: "success",
                    });
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <Text style={{ ...styles.white, fontWeight: "bold" }}>
                      {inventory.ID_INV}. {inventory.DESCRIPCION}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};
export default PickInventoryModal;

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
