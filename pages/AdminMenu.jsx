import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import styles from "../styles/styles";
import * as SQLite from "expo-sqlite";
import { useNavigate } from "react-router-native";
import { dataContext } from "../context/dataContext";
import EditIdModal from "../components/EditIdModal";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminMenu = () => {
  const navigate = useNavigate();
  const { setSnackbar, user, setHardwareId } = useContext(dataContext);
  const [id, setId] = useState("");
  const [modalId, setModalId] = useState(false);

  const eliminarTablaInventarios = () => {
    const db = SQLite.openDatabase("Maestro.db");
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM INVENTARIO",
        [],
        () =>
          setSnackbar({
            visible: true,
            text: "Inventarios cargados eliminados con éxito",
            type: "success",
          }),
        (error) => {
          console.log("Error", error);
          setSnackbar({
            visible: true,
            text: `Error al eliminar la tabla INVENTARIO: ${error}`,
            type: "error",
          });
        }
      );
    });
  };

  const changeHardwareID = async () => {
    try {
      await AsyncStorage.setItem("hardwareId", id);
      setHardwareId(id);
      setSnackbar({
        visible: true,
        text: "ID cambiado con éxito",
        type: "success",
      });
      return setModalId(false);
    } catch (e) {
      setSnackbar({
        visible: true,
        text: `Error al cambiar el ID: ${e}`,
        type: "error",
      });
      return setModalId(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />

        <SectionBar section={"Menu Administrador"} backTo={routes.home} />

        <View style={styles.container}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setModalId(true)}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                MODIFICAR ID CAPTURADORA
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              eliminarTablaInventarios();
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                LIMPIEZA
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EditIdModal
        id={id}
        setId={setId}
        setModalVisible={setModalId}
        modalVisible={modalId}
        onConfirm={changeHardwareID}
      />
    </KeyboardAvoidingView>
  );
};

export default AdminMenu;
