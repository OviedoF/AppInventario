import {Text} from "react-native";
import React, {  useState, useEffect, useContext } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import routes from "../router/routes";
import { useParams } from "react-router-native";
import { TouchableOpacity } from "react-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import { dataContext } from "../context/dataContext";

const CDReview = () => {
  const [products, setProducts] = useState(null);
  const { area } = useParams();
  const {setArea} = useContext(dataContext);

  const getProducts = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    ExecuteQuery(
      db,
      "SELECT * FROM AREAS WHERE NUM_AREA = ?",
      [area],
      (res) => {
        if (!res.rows._array[0]) return setSnackbar({
          visible: true,
          text: "El área no existe",
          type: "error",
        });

        const query = `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND area = "${area}" AND CorrelativoApertura = "${res.rows._array[0]["ESTADOTAG"]}" ORDER BY id DESC`;
        console.log('area:', res.rows._array[0])
        ExecuteQuery(
          db,
          query,
          [],
          (results) => {
            /* console.log("Query completed");
            console.log(results.rows._array); */
            console.log(results.rows._array);
            return setProducts(results.rows._array);
          },
          (error) => {
            console.log("Error");
            console.log(error);
            return false;
          }
        );
      },
      (err) => {
        console.log(err)
      }
    )
  };

  useEffect(() => {
    getProducts();
    setArea('');
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <TopBar />
        <SectionBar
          section={`Vista de área`}
          backTo={routes.captureMenu}
        />

        {products && products.length === 0 && (
          <Text style={{ textAlign: "center" }}>
            No hay productos en el área
          </Text>
        )}

        {products &&
          products[0] &&
          products.map((item, id) => (
            <TouchableOpacity
              key={id}
              style={[
                {
                  flexDirection: "row",
                  padding: 10,
                  alignItems: "center",
                }
              ]}
            >
              <Text
                style={{ width: "10%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {(id - products.length) * -1}
              </Text>
              <Text
                style={{ width: "55%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.name} - {item.descripcion}
              </Text>
              <Text
                style={{ width: "10%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.quantity < 0 ? item.quantity : `+${item.quantity}`}
              </Text>
              <Text
                style={{ width: "25%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CDReview;