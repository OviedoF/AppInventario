import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import routes from "../router/routes";
import styles from "../styles/styles";
import TopBar from "../components/TopBar";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import { Platform } from "react-native";
import { dataContext } from "../context/dataContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import dataApp from "../app.json";
import env from "../env";
import { BackHandler } from "react-native";
import SelectDBModal from "../components/SelectDBModal";
// import { cargarInventario } from "../api/db";
import * as SecureStore from 'expo-secure-store';
import SupervisorApprobalModal from "../components/SupervisorApprobalModal";
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;

const Login = () => {
  const [selectDBModal, setSelectDBModal] = useState(false);
  const [adminPassModal, setAdminPassModal] = useState(false)
  const navigate = useNavigate();
  const { setUser, setSnackbar, setConfig, setHardwareId, setInventario, config, setDangerModal, inventario, codCapturador, setCodCapturador } = useContext(dataContext);
  const refs = {
    user: useRef(null),
    password: useRef(null),
  }

  const requestPermissions = async () => {
    const storageDir = await SecureStore.getItemAsync(env.asyncStorage.storageDir)
    console.log('storageDir', storageDir)

    if (!storageDir) {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          'Error',
          'No se han otorgado los permisos necesarios para guardar el archivo de respaldo.',
          [
            {
              text: 'REVISAR PERMISOS',
              onPress: () => requestPermissions(),
            },
          ],
          { cancelable: false },
        )
        return;
      }

      directoryUri = permissions.directoryUri
      await SecureStore.setItemAsync(env.asyncStorage.storageDir, permissions.directoryUri)
    }
  }

  useEffect(() => {
    requestPermissions()
  }, [])

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

  const getBasicData = async () => {
    try {
      const value = await SecureStore.getItemAsync('hardwareId')
      if (value === null) {
        await SecureStore.setItemAsync('hardwareId', Application.androidId)
        setHardwareId(Application.androidId)
      } else {
        setHardwareId(value)
      } // * Se guarda el hardwareId en el contexto y en el SecureStore, para que sea persistente en el tiempo

      const codCapturador = await SecureStore.getItemAsync('codCapturador')
      if (codCapturador !== null) {
        setCodCapturador(codCapturador)
      } // * Se guarda el codCapturador en el contexto y en el SecureStore, para que sea persistente en el tiempo

      const adminPassword = await AsyncStorage.getItem(env.asyncStorage.adminPassword)
      if (!adminPassword) {
        await AsyncStorage.setItem(env.asyncStorage.adminPassword, '789')
      } else {
      } // * Se guarda la contraseña de administrador en el AsyncStorage, para que sea persistente en el tiempo
    } catch (e) {
      console.log(e);
    }
  }

  const handleLogin = async (data) => {
    try {
      const openDb = await SQLite.openDatabase(`Maestro.db`);
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
            admin: user.COD_USUARIO === 10 ? true : false,
          };

          if (!userProx.admin && !config.inv_activo) return setSnackbar({
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
          }); // * Agregar evento para el botón de atrás
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
      async (data) => {
        const config = data.rows._array;

        const invSelected = await AsyncStorage.getItem(env.asyncStorage.invSelected)
        if (invSelected) {
          setInventario(invSelected);
        } // * Se guarda el inventario seleccionado en el AsyncStorage, para que sea persistente en el tiempo

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
          inv_activo: invSelected ? invSelected.split('.')[0] : null,
        });

        const ip = await AsyncStorage.getItem("IP")
        if (!ip) await AsyncStorage.setItem("IP", config[6] ? config[6].LARGO_CAMPO : "192.168.0.1");
      },
      (error) => {
        console.log(error);
      }
    );
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
              onPress: () => onDataBaseCharge(),
            },
          ],
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  const createINV_APP = async () => {
    const openDb = SQLite.openDatabase(`Maestro.db`);
    getBasicData();

    await ExecuteQuery(
      openDb,
      `CREATE TABLE IF NOT EXISTS INVENTARIO_APP (id INTEGER PRIMARY KEY AUTOINCREMENT, operator TEXT, name TEXT, quantity INT, date TEXT, posicion TEXT, area TEXT, pallet TEXT, caja TEXT, type TEXT, inventario TEXT, serie TEXT, existe TEXT, EstadoTag TEXT, CorrelativoApertura TEXT, invtype TEXT, descripcion TEXT);`,
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
      `CREATE TABLE IF NOT EXISTS INVENTARIO_APP_ENVIADOS (id INTEGER PRIMARY KEY AUTOINCREMENT, CorrPt TEXT, FechaLectura TEXT, CodOperador INT, Serie TEXT, CodProducto TEXT, Cantidad TEXT, ExistenciaProducto TEXT, TipoLectura TEXT, EstadoTag TEXT, CorrelativoApertura TEXT, idDispositivo TEXT, CodInv TEXT, CodCapturador TEXT, Area TEXT);`,
      [],
      (result) => {
        if (result.rowsAffected > 0) {
          console.log("Tabla INVENTARIO_APP_ENVIADOS creada correctamente.");
        }
      },
      (error) => {
        console.log(error);
      }
    );

  };

  const onDataBaseCharge = async () => {
    try {
      createINV_APP();
      saveConfig();
      getBasicData();
      await AsyncStorage.setItem('existFirstDB', 'true')
      setSelectDBModal(false)
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const openOrCreateDB = async () => {
      // Pedir permisos de lectura y escritura

      const existFirstDB = await AsyncStorage.getItem('existFirstDB')

      if (!existFirstDB) {
        setSelectDBModal(true)
      } else {
        onDataBaseCharge()
      }
    };

    setUser(undefined);
    openOrCreateDB();
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
      {selectDBModal && <SelectDBModal onEnd={onDataBaseCharge} />}
      {adminPassModal && <SupervisorApprobalModal
        setModalVisible={setAdminPassModal}
        modalVisible={adminPassModal}
        user={null}
        idDesired={null}
        setSelectedId={null}
        setConfig={null}
        config={null}
        authType={"new_db"}
        setAuthType={() => { }}
        setSelectDBModal={setSelectDBModal}
      />}

      <ScrollView>
        <TopBar />

        <View style={styles.container}>
          <Image
            style={{
              ...styles.img,
              objectFit: "contain",
              height: 80,
              marginTop: 0,
            }}
            source={logo}
          />
        </View>

        <View style={[styles.container]}>
          <Text style={[styles.title, {
            fontSize: 16,
          }]}>Iniciar Sesión</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                onSubmitEditing={() => handleFocus(refs.password)}
                value={value}
                style={[styles.input, {
                  height: 40
                }]}
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
                style={[styles.input, {
                  height: 40
                }]}
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
          onPress={async () => {
            const ifDbExist = await AsyncStorage.getItem('existFirstDB')
            if (!ifDbExist) {
              setSelectDBModal(true)
            } else {
              setAdminPassModal(true)
            }
          }}
          style={{
            height: 20,
            marginTop: 5,
            padding: 0,
          }}
        >
          <Text style={[styles.textCenter]}>ABRIR NUEVA BASE DE DATOS</Text>
        </TouchableOpacity>

        <Text style={[styles.textCenter, { marginTop: 5 }]}>
          Cod Capturador: {codCapturador}
        </Text>

        <Text style={[styles.textCenter, { marginTop: 5 }]}>
          Versión: {dataApp.expo.version}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
