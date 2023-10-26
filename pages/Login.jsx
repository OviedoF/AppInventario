import React, { useState, useRef, useEffect } from "react";
<<<<<<< HEAD
import { Text, View, TextInput, Image, TouchableOpacity, Keyboard } from "react-native";
=======
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
>>>>>>> fe0f856e7eb28c4dbd6788f385babfe0035166d3
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import ErrorModal from "../components/ErrorModal";
import routes from "../router/routes";
import styles from "../styles/styles";
import TopBar from "../components/TopBar";

const Login = () => {
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState(false);
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
    // Si los datos estan bien devuelve true y navega a home
    try {
      // TODO: crear funcion login en api
      /* const res = await login(data); */
      const res = true;
      if (res) {
        navigate(routes.home);
      } else {
        setErrorModal(true);
      }
    } catch (error) {}
  };

  const handleFocus = (ref) => {
    ref.current.focus();
  };

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

        <ErrorModal
          message={"Los datos ingresados son incorrectos, intente nuevamente."}
          modalFailVisible={errorModal}
          setModalFailVisible={setErrorModal}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
