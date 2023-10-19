import React, { useState } from "react";
import { Text, View, TextInput, Image, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import ErrorModal from "../components/ErrorModal";
import routes from "../router/routes";
import styles from "../styles/styles";

const Login = () => {
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState(false);

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
      // ! crear funcion login en api
      /* const res = await login(data); */
      if (res) {
        navigate(routes.home);
      } else {
        setErrorModal(true);
      }
    } catch (error) {}
  };

  return (
    <>
      <View style={styles.backBtnContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
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
              value={value}
              style={styles.input}
              placeholder="Operador"
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
    </>
  );
};

export default Login;
