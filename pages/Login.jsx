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
import { useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import routes from "../router/routes";
import styles from "../styles/styles";
import TopBar from "../components/TopBar";
import * as SQLite from 'expo-sqlite';
import executeQuery from '../helpers/ExecuteQuery';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { dataContext } from "../context/dataContext";
import InitLocalDB from "../helpers/InitLocalDB";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser, snackbar, setSnackbar, setConfig } = useContext(dataContext);
  const refs = {
    user: useRef(null),
    password: useRef(null),
  };

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
      const openDb = await SQLite.openDatabase(`Maestro.db`);

      executeQuery(
        openDb,
        `SELECT * FROM OPERADOR`,
        [],
        (result) => {
          const users = result.rows._array;

          const user = users.find((user) => user.NOMBRES.toLowerCase() === data.user.toLowerCase() && user.CLAVE === data.password);

          if(!user) {
            setSnackbar({
              visible: true,
              text: "Usuario o contraseña incorrectos.",
              type: "error",
            });
            return;
          }

          setUser({
            ...user,
            admin: user._id === 1 || user._id === 2 ? true : false
          });

          setSnackbar({
            visible: true,
            text: "Sesión iniciada correctamente.",
            type: "success",
          });
          navigate(routes.home);
        },
        (error) => {
          console.log(error)
        }
      )
    } catch (error) {
      console.log(error);
    }
  };

  const handleFocus = (ref) => {
    ref.current.focus();
  };

  useEffect(() => {
    const openOrCreateDB = async () => {
      // Pedir permisos de lectura y escritura
      const db = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite/Maestro.db`, { size: true });

      if (!db.exists) {
        console.log('No existe la base de datos, se procede a copiarla');
        const document = await DocumentPicker.getDocumentAsync();
        console.log(document);

        if (!document.canceled) {
          console.log('Documento seleccionado:', document);
          await FileSystem.copyAsync(
            { from: document.assets[0].uri, to: `${FileSystem.documentDirectory}SQLite/Maestro.db` }
          ).then( async () => {
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

    const saveConfig = async () => {
      const openDb = await SQLite.openDatabase(`Maestro.db`);

      executeQuery(
        openDb,
        "SELECT * FROM CONFIG",
        [],
        (data) => {
          const config = data.rows._array;

          setConfig({
            largo_tag: config[0].LARGO_CAMPO,
            largo_prod: config[1].LARGO_CAMPO,
            buttons_config: isNaN(config[2].LARGO_CAMPO) ? 3 : parseInt(config[2].LARGO_CAMPO),
            catalog_products: config[3].LARGO_CAMPO === 'N' ? false : true,
            index_capt: isNaN(parseInt(config[4].LARGO_CAMPO)) ? 1 : parseInt(config[4].LARGO_CAMPO),
          })
        },
        (error) => {
          console.log(error)
        }
      )
    }

    openOrCreateDB();
    saveConfig();
    InitLocalDB();
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
        <TopBar text={"ID:"} />

        <View style={styles.container}>
          <Image style={styles.img} source={logo} />
        </View>

        <View style={styles.container}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
