import React from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import { useNavigate, Link } from "react-router-native";
import { useForm, Controller } from "react-hook-form";
import routes from "../router/routes";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";

const Home = () => {
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
    <>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>

      <SectionBar section={"Menu Operador"} backTo={routes.login} />

      <View style={styles.container}>
        <Text
          style={{
            marginBottom: 10,
          }}
        >
          Administrador:
        </Text>

        <Text
          style={{
            marginBottom: 10,
          }}
        >
          Operador:
        </Text>

        <Link to={routes.captureMenu} style={styles.primaryBtn}>
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

        <Link to={routes.cD} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {/* //? reemplazar home por ruta inventario */}
            <Text
              style={{
                ...styles.white,
                fontWeight: "bold",
              }}
            >
              CD
            </Text>
          </View>
        </Link>

        <Link to={routes.calculator} style={styles.primaryBtn}>
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

      {/* 
        TODO: Estos inputs van a manejar variables globales 
        */}

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
            width: "50%",
          }}
        >
          <Text>Largo Prod</Text>

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => console.log(value)}
                value={value}
                secureTextEntry={true}
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
            width: "50%",
          }}
        >
          <Text>Largo Tag</Text>

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={(value) => console.log(value)}
                value={value}
                secureTextEntry={true}
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
    </>
  );
};

export default Home;
