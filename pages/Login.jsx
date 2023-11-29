import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import routes from "../router/routes";
import styles from "../styles/styles";
import TopBar from "../components/TopBar";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { dataContext } from "../context/dataContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import dataApp from "../app.json";
import env from "../env";
import { BackHandler } from "react-native";
// import { cargarInventario } from "../api/db";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setSnackbar, setConfig, setHardwareId, setInventario, config, setDangerModal, inventario, codCapturador, setCodCapturador } =
    useContext(dataContext);
  const refs = {
    user: useRef(null),
    password: useRef(null),
  };
  console.log(dataApp.expo.version)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const handleLogin = async (data) => {
    try {
      const openDb = SQLite.openDatabase(`Maestro.db`);

      await ExecuteQuery(
        openDb,
        `CREATE TABLE IF NOT EXISTS INVENTARIO_APP (id INTEGER PRIMARY KEY AUTOINCREMENT, operator TEXT, name TEXT, quantity INT, date TEXT, posicion TEXT, area TEXT, pallet TEXT, caja TEXT, type TEXT, inventario TEXT, serie TEXT, existe TEXT, EstadoTag TEXT, CorrelativoApertura TEXT, invtype TEXT);`,
        [],
        (result) => {
          if (result.rowsAffected > 0) {
            console.log("Tabla INVENTARIO_APP creada correctamente.");
          }
        },
        (error) => {
          console.log(error);
        }
      );

      await ExecuteQuery(
        openDb,
        `SELECT * FROM OPERADOR`,
        [],
        (result) => {
          const users = result.rows._array;

          const user = users.find(
            (user) =>
              user.COD_USUARIO.toString() === data.user.toString() &&
              user.CLAVE === data.password
          );

          if (!user) {
            setSnackbar({
              visible: true,
              text: "Usuario o contraseña incorrectos.",
              type: "error",
            });
            return;
          }

          const userProx = {
            ...user,
            admin: user._id === 1 || user._id === 2 ? true : false,
          };

          if (!userProx.admin && !inventario) return setSnackbar({
            visible: true,
            text: "El administrador no ha configurado el inventario para este usuario.",
            type: "error",
          });

          setUser(userProx);

          setSnackbar({
            visible: true,
            text: "Sesión iniciada correctamente.",
            type: "success",
          });

          BackHandler.addEventListener("hardwareBackPress", () => {
            navigate(-1);
            return true;
          } ); // * Agregar evento para el botón de atrás
          navigate(userProx.admin ? routes.menuAdmin : routes.captureMenu);
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleFocus = (ref) => {
    ref.current.focus();
  };

  const saveConfig = async () => {
    const openDb = await SQLite.openDatabase(`Maestro.db`);

    ExecuteQuery(
      openDb,
      "SELECT * FROM CONFIG",
      [],
      (data) => {
        const config = data.rows._array;
        /* console.log(config[4]); */

        setConfig({
          largo_tag: config[0].LARGO_CAMPO,
          largo_prod: config[1].LARGO_CAMPO,
          buttons_config: isNaN(config[2].LARGO_CAMPO)
            ? 3
            : parseInt(config[2].LARGO_CAMPO),
          catalog_products: config[3].LARGO_CAMPO === "N" ? false : true,
          index_capt: 1,
          pesables: config[5]
            ? config[5].LARGO_CAMPO === "N"
              ? false
              : true
            : false,
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const loadDB = async () => {
    const document = await DocumentPicker.getDocumentAsync();
    console.log(document);

    if (!document.canceled) {
      console.log("Documento seleccionado:", document);
      await FileSystem.copyAsync({
        from: document.assets[0].uri,
        to: `${FileSystem.documentDirectory}SQLite/Maestro.db`,
      })
        .then(async () => {
          setSnackbar({
            visible: true,
            text: "Base de datos copiada correctamente.",
            type: "success",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setSnackbar({
        visible: true,
        text: "No se seleccionó ningún documento. La aplicación no funcionará correctamente.",
        type: "error",
      });
    }

    saveConfig();
  };

  const readIfTheDBIsEmtpy = async () => {
    const openDb = await SQLite.openDatabase(`Maestro.db`);
    const query = `SELECT * FROM INVENTARIO_APP`;

    await ExecuteQuery(
      openDb,
      query,
      [],
      (result) => {
        if (result.rows._array.length === 0) return;

        setDangerModal({
          visible: true,
          title: "¡Atención!",
          text: "La base de datos tiene información.",
          buttons: [
            {
              text: "Entendido",
              onPress: () => console.log("Cancel Pressed"),
            },
          ],
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const getHardwareID = async () => {
    try {
      const value = await AsyncStorage.getItem('hardwareId')
      if (value !== null) {
        setHardwareId(value)
      }
      const codCapturador = await AsyncStorage.getItem('codCapturador')
      if (codCapturador !== null) {
        setCodCapturador(codCapturador)
      }
      
      const adminPassword = await AsyncStorage.getItem(env.asyncStorage.adminPassword)
      if (!adminPassword) {
        console.log("No existe la contraseña de administrador, se procede a crearla");
        await AsyncStorage.setItem(env.asyncStorage.adminPassword, '1234')
      }
    } catch (e) {
      console.log(e);
    }
  }

  const getInvSelected = async () => {
    try {
      const value = await AsyncStorage.getItem(env.asyncStorage.invSelected)
      if (value !== null) {
        setInventario(value)
      }
      console.log(value.split('.')[0])
      setConfig({ ...config, inv_activo: value.split('.')[0] });
    } catch (e) {
      console.log(e);
    }
  }


  useEffect(() => {
    const openOrCreateDB = async () => {
      // Pedir permisos de lectura y escritura
      const db = await FileSystem.getInfoAsync(
        `${FileSystem.documentDirectory}SQLite/Maestro.db`,
        { size: true }
      );

      if (!db.exists) {
        console.log("No existe la base de datos, se procede a copiarla");
        const document = await DocumentPicker.getDocumentAsync();
        console.log(document);

        if (!document.canceled) {
          console.log("Documento seleccionado:", document);
          await FileSystem.copyAsync({
            from: document.assets[0].uri,
            to: `${FileSystem.documentDirectory}SQLite/Maestro.db`,
          })
            .then(async () => {
              setSnackbar({
                visible: true,
                text: "Base de datos copiada correctamente.",
                type: "success",
              });
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          setSnackbar({
            visible: true,
            text: "No se seleccionó ningún documento. La aplicación no funcionará correctamente.",
            type: "error",
          });
        }
      }
    };

    openOrCreateDB();
    saveConfig();
    getHardwareID();
    getInvSelected();
    readIfTheDBIsEmtpy();

    //Eliminar todos los addEventListener de BackHandler
    BackHandler.removeEventListener("hardwareBackPress", () => { });
  }, []);

  useEffect(() => {
    refs.user.current.focus();
  }, [errors, control]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />

        <View style={styles.container}>
          <Image
            style={{
              ...styles.img,
              objectFit: "contain",
              height: 120,
            }}
            source={logo}
          />
        </View>

        <View style={[styles.container]}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                onSubmitEditing={() => handleFocus(refs.password)}
                value={value}
                style={styles.input}
                placeholder="Operador"
                showSoftInputOnFocus={false}
                ref={refs.user}
              />
            )}
            name="user"
            rules={{ required: true }}
          />
          {errors.user && <Text style={styles.red}>* Campo obligatorio.</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                onSubmitEditing={handleSubmit(handleLogin)}
                showSoftInputOnFocus={false}
                ref={refs.password}
                value={value}
                secureTextEntry={true}
                style={styles.input}
                placeholder="Contraseña"
              />
            )}
            name="password"
            rules={{ required: true }}
          />
          {errors.password && (
            <Text style={styles.red}>* Campo obligatorio.</Text>
          )}
          <TouchableOpacity
            accessibilityLabel="Botón de Ingreso"
            onPress={handleSubmit(handleLogin)}
            style={styles.logBtn}
          >
            <Text style={[styles.white, styles.textCenter]}>INGRESAR</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          accessibilityLabel="Botón de Configuración"
          onPress={() => loadDB()}
          style={{
            height: 20,
            marginTop: 5,
            padding: 0,
          }}
        >
          <Text style={[styles.textCenter]}>ABRIR NUEVA BASE DE DATOS</Text>
        </TouchableOpacity>

        <Text style={[styles.textCenter, { marginTop: 5 }]}>
          Versión: {dataApp.expo.version}
        </Text>

        <Text style={[styles.textCenter, { marginTop: 5 }]}>
          Cod Capturador: {codCapturador}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
