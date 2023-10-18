import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useNavigate, Link } from "react-router-native";
import routes from "../router/routes";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <View>
        <Link to={routes.home}>
          //? reemplazar home por ruta inventario
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text>Inventario</Text>
          </View>
        </Link>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            //! Crear función de logout
            /* logout(); */
            navigate(routes.login);
          }}
        >
          <Text>
            ¿Desea cerrar sesión? Click <Text>AQUÍ</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Home;
