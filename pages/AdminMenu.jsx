import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import styles from "../styles/styles";
import { useNavigate } from "react-router-native";

const AdminMenu = () => {
  const navigate = useNavigate();
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
