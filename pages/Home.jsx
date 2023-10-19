import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useNavigate, Link } from "react-router-native";
import routes from "../router/routes";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <View style={styles.topSectionContainer}>
        <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm]}>
          ID:
        </Text>
      </View>
      <SectionBar section={"Home"} backTo={routes.login} />
      <View style={styles.container}>
        <Text>Administrador:</Text>
        <Text>Operador:</Text>
        <Link to={routes.home} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {/* //? reemplazar home por ruta inventario */}
            <Text style={styles.white}>INVENTARIO</Text>
          </View>
        </Link>
        <Link to={routes.captureMenu} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {/* //? reemplazar home por ruta inventario */}
            <Text style={styles.white}>CD</Text>
          </View>
        </Link>
        <Link to={routes.home} style={styles.primaryBtn}>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {/* //? reemplazar home por ruta inventario */}
            <Text style={styles.white}>ENVIAR CONTEO WIFI</Text>
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
    </>
  );
};

export default Home;
