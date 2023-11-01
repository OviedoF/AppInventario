import React, { useState, useRef, useEffect } from "react";
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
import ErrorModal from "../components/ErrorModal";
import routes from "../router/routes";
import styles from "../styles/styles";
import TopBar from "../components/TopBar";
import * as SQLite from 'expo-sqlite';
import executeQuery from '../helpers/ExecuteQuery';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Snackbar } from 'react-native-paper';

const Login = () => {
  const navigate = useNavigate();
  const [errorSnackbar, setErrorSnackbar] = useState(false);
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
          console.log(result.rows._array);
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
      console.log(`${FileSystem.documentDirectory}SQLite/Maestro.db`);

      if (!db.exists) {
        console.log('No existe la base de datos, se procede a copiarla');
        const document = await DocumentPicker.getDocumentAsync();
        console.log(document);

        if (!document.canceled) {
          console.log('Documento seleccionado:', document);
          await FileSystem.copyAsync(
            { from: document.assets[0].uri, to: `${FileSystem.documentDirectory}SQLite/Maestro.db` }
          ).then(() => {
            console.log('Base de datos copiada correctamente');
          })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log('No se seleccionó ningún documento');
        }
      }
    };

    openOrCreateDB();
    setErrorSnackbar(true);
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

        <Snackbar
          visible={errorSnackbar}
          onDismiss={() => setErrorSnackbar(false)}
          duration={3000}
        >
          Hey there! I'm a Snackbar.
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
