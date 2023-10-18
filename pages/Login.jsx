import React, { useState } from "react";
import { Text, View, TextInput, Image, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-native";
import logo from "../assets/logo.png"; //! agregar logo.png a la carpeta assets
import ErrorModal from "../components/ErrorModal";
import routes from "../router/routes";

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
      <View>
        <Image source={logo} />
      </View>

      <View>
        <View>
          <Text>Iniciar Sesión</Text>
        </View>
        <Text>Usuario</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
            />
          )}
          name="user"
          rules={{ required: true }}
        />
        {errors.user && <Text>* Campo obligatorio.</Text>}
        <Text>Contraseña</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              value={value}
              secureTextEntry={true}
            />
          )}
          name="password"
          rules={{ required: true }}
        />
        {errors.password && <Text>* Campo obligatorio.</Text>}
      </View>
      <View>
        <TouchableOpacity
          accessibilityLabel="Botón de Ingreso"
          /* onPress={handleSubmit(handleLogin)} */
        >
          <Text>Ingresar</Text>
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
