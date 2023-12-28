import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import styles from "../styles/styles";
import * as SQLite from "expo-sqlite";
import { useNavigate } from "react-router-native";
import { dataContext } from "../context/dataContext";
import EditIdModal from "../components/EditIdModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditSupPasswordModal from "../components/EditSupPasswordModal";
import env from "../env";
import PickInventoryModal from "../components/PickInventarioModal";
import * as SecureStore from 'expo-secure-store';

const AdminMenu = () => {
  const { setSnackbar, reset, setHardwareId, config, setConfig, hardwareId, codCapturador, setCodCapturador, setDangerModal } = useContext(dataContext);
  const [id, setId] = useState(hardwareId);
  const [modalId, setModalId] = useState(false);
  const [ip, setIp] = useState('')
  const [changePasswordModal, setChangePasswordModal] = useState(false)
  const [supervisorPassword, setSupervisorPassword] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    async function getIp() {
      const ip = await AsyncStorage.getItem("IP");
      setIp(ip)
    }

    getIp()
  }, [])

  const eliminarTablaInventarios = () => {
    setDangerModal({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará todos los inventarios y sus datos",
      visible: true,
      buttons: [{
        text: "Cancelar",
        onPress: () => setDangerModal({ visible: false, buttons: [] })
      }, {
        text: "Eliminar",
        onPress: () => {
          const db = SQLite.openDatabase("Maestro.db");
          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM INVENTARIO_APP",
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

          db.transaction((tx) => {
            tx.executeSql(
              "DELETE FROM COMBINACIONES_CD",
              [],
              () => console.log("COMBINACIONES_CD con éxito"),
              (error) => {
                console.log("Error", error);
                setSnackbar({
                  visible: true,
                  text: `Error al eliminar la tabla INVENTARIO_CARGADO: ${error}`,
                  type: "error",
                });
              }
            );
          });
        }
      }]
    })
  };

  const changeHardwareID = async () => {
    try {
      await SecureStore.setItemAsync("hardwareId", id);
      setHardwareId(id);
      await SecureStore.setItemAsync("codCapturador", codCapturador);
      await AsyncStorage.setItem("IP", ip);
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

  const changeSupervisorPassword = async () => {
    try {
      await AsyncStorage.setItem(env.asyncStorage.adminPassword, supervisorPassword);
      setSnackbar({
        visible: true,
        text: "Contraseña cambiada con éxito",
        type: "success",
      });
      return setChangePasswordModal(false);
    } catch (e) {
      setSnackbar({
        visible: true,
        text: `Error al cambiar la contraseña: ${e}`,
        type: "error",
      });
      return setChangePasswordModal(false);
    }
  }

  const changeInventory = async () => {
    reset()
    await AsyncStorage.removeItem('existFirstDB')
    navigate(routes.login);
  }

  useEffect(() => {
    async function getSupervisorPassword() {
      const supervisorPassword = await AsyncStorage.getItem(env.asyncStorage.adminPassword);
      setSupervisorPassword(supervisorPassword)
    }

    getSupervisorPassword()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />

        <SectionBar section={"Menu Administrador"} backTo={routes.login} />

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

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setChangePasswordModal(true)}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                MODIFICAR CLAVE SUPERVISOR
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => changeInventory()}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                SELECCIONAR INVENTARIO
              </Text>
            </View>
          </TouchableOpacity>


          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "40%",
              }}
            >
              <Text>Largo Prod</Text>

              <TextInput
                keyboardType="numeric"
                onChangeText={(value) => {
                  console.log(isNaN(parseInt(value)));
                  if (isNaN(parseInt(value)))
                    return setSnackbar({
                      visible: true,
                      text: "El largo debe ser un número entero",
                      type: "error",
                    });

                  return setConfig({
                    ...config,
                    largo_prod: parseInt(value),
                  });
                }}
                value={config.largo_prod.toString()}
                style={{
                  ...styles.input,
                  marginLeft: 10,
                }}
                placeholder="Largo Prod"
              />
            </View>
          </View>

          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "40%",
              }}
            >
              <Text>Largo Tag</Text>


              <TextInput
                keyboardType="numeric"
                onChangeText={(value) => {
                  if (isNaN(parseInt(value)))
                    return setSnackbar({
                      visible: true,
                      text: "El largo debe ser un número entero",
                      type: "error",
                    });

                  return setConfig({
                    ...config,
                    largo_tag: parseInt(value),
                  });
                }}
                value={config.largo_tag.toString()}
                style={{
                  ...styles.input,
                  marginLeft: 10,
                }}
                placeholder="Largo Tag"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <EditIdModal
        id={id}
        setId={setId}
        codCapturador={codCapturador}
        setCodCapturador={setCodCapturador}
        setModalVisible={setModalId}
        modalVisible={modalId}
        onConfirm={changeHardwareID}
        ip={ip}
        setIp={setIp}
      />

      <EditSupPasswordModal
        supervisorPassword={supervisorPassword}
        setSupervisorPassword={setSupervisorPassword}
        setModalVisible={setChangePasswordModal}
        modalVisible={changePasswordModal}
        onConfirm={changeSupervisorPassword}
      />
    </KeyboardAvoidingView>
  );
};

export default AdminMenu;
