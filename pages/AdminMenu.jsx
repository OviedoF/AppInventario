import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useContext } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import styles from "../styles/styles";
import * as SQLite from "expo-sqlite";
import { useNavigate } from "react-router-native";
import { dataContext } from "../context/dataContext";

const AdminMenu = () => {
  const navigate = useNavigate();
  const { setSnackbar, user } = useContext(dataContext);
  const eliminarTablaInventarios = () => {
    const db = SQLite.openDatabase("NombreDeTuBaseDeDatos.db");
    db.transaction((tx) => {
      tx.executeSql(
        "DROP TABLE IF EXISTS INVENTARIO",
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
            text: `Error al eliminar la tabla INVENTARIOS: ${error}`,
            type: "error",
          });
        }
      );
    });
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar text={"ID:"} />

        <SectionBar section={"Menu Administrador"} backTo={routes.home} />

        <View style={styles.container}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              navigate(routes.menuAdmin);
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                MODIFICACIÓN DE PARÁMETROS
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
    </KeyboardAvoidingView>
  );
};

export default AdminMenu;
