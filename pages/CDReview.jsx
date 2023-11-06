import { View, Text } from "react-native";
import React, { useContext, useState,useEffect } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { dataContext } from "../context/dataContext";
import routes from "../router/routes";
import { useParams } from "react-router-native";
import { TouchableOpacity } from "react-native";
import styles from "../styles/styles";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";

const CDReview = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [products, setProducts] = useState(null);
  const { area } = useContext(dataContext);
  const { type } = useParams();

  useEffect(() => { 
    const getCDProducts = async () => {
      const db = SQLite.openDatabase("Maestro.db");
      const query = `SELECT * FROM INVENTARIO_APP WHERE type = "CD"`;
      await ExecuteQuery(
        db,
        query,
        [],
        (results) => {
          console.log("Query completed");
          console.log(results.rows._array);
          return setProducts(results.rows._array);
        },
        (error) => {
          console.log("Error");
          console.log(error);
          return false;
        }
      );
    }
    
    getCDProducts();
  }, [])

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <TopBar text={"ID:"} />
        <SectionBar
          section={`CD - Revisar`}
          backTo={
            type === "single"
              ? routes.cdSingleProductEntry
              : routes.cdMultipleProductEntry
          }
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity style={[styles.primaryBtn, { width: "30%" }]}>
            <Text style={[styles.white, { textAlign: "center" }]}>
              Modificar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { width: "30%" }]}>
            <Text style={[styles.white, { textAlign: "center" }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
        {products &&
          products[0] &&
          products.map((item, id) => (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedId(id)}
              style={[
                {
                  flexDirection: "row",
                  padding: 10,
                  alignItems: "center",
                },
                selectedId === id && { backgroundColor: "orange" },
              ]}
            >
              <Text
                style={{ width: "25%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.id}
              </Text>
              <Text
                style={{ width: "40%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.name}
              </Text>
              <Text
                style={{ width: "10%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.quantity < 0 ? item.quantity : `+${item.quantity}`}
              </Text>
              <Text
                style={{ width: "25%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CDReview;