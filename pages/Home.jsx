import React from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import { useNavigate, Link } from "react-router-native";
import { useForm, Controller } from "react-hook-form";
import routes from "../router/routes";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import TopBar from "../components/TopBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { useContext } from "react";
import { dataContext } from "../context/dataContext";

const Home = () => {
  const { config, setConfig, user } = useContext(dataContext);
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      large_prod: "",
      large_tag: "",
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar text={"ID:"} />

        <SectionBar section={"Menu Operador"} backTo={routes.login} />

        <View style={styles.container}>
          <Text
            style={{
              marginBottom: 10,
            }}
          >
            Administrador: {user.admin ? "Si" : "No"}
          </Text>

          <Text
            style={{
              marginBottom: 10,
            }}
          >
            Operador: {user.NOMBRES}
          </Text>

          <Link to={
            config.index_capt === 1 ? routes.captureMenu : routes.cD
          } style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              {/* //? reemplazar home por ruta inventario */}
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                INVENTARIO
              </Text>
            </View>
          </Link>

          {/* <Link to={routes.cD} style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              //? reemplazar home por ruta inventario
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                CD
              </Text>
            </View>
          </Link> */}

          <Link to={routes.sentWifi} style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              {/* //? reemplazar home por ruta inventario */}
              <Text
                style={{
                  ...styles.white,
                  fontWeight: "bold",
                }}
              >
                ENVIAR CONTEO WIFI
              </Text>
            </View>
          </Link>
        </View>

        {/* 
        TODO: Estos inputs van a manejar variables globales 
        */}

        <View style={{ alignItems: "center", marginVertical: 5 }}>
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

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(value) => setConfig({ ...config, largo_prod: value })}
                    value={config.largo_prod}
                    style={{
                      ...styles.input,
                      marginLeft: 10,
                    }}
                    placeholder="Largo Prod"
                  />
                )}
                name="large_prod"
                rules={{ required: true }}
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

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(value) => setConfig({ ...config, largo_tag: value })}
                    value={config.largo_tag}
                    style={{
                      ...styles.input,
                      marginLeft: 10,
                    }}
                    placeholder="Largo Tag"
                  />
                )}
                name="large_tag"
                rules={{ required: true }}
              />
            </View>
          </View>
        </View>

        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => {
              //! Crear función de logout
              /* logout(); */
              navigate(routes.login);
            }}
            style={styles.mySm}
          >
            <Text>
              ¿Desea cerrar sesión? Click <Text style={styles.link}>AQUÍ</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Home;
