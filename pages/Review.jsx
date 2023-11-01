import { View, Text } from "react-native";
import React, { useContext, useState } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { dataContext } from "../context/dataContext";
import routes from "../router/routes";
import { useParams } from "react-router-native";
import { TouchableOpacity } from "react-native";
import styles from "../styles/styles";

const Review = () => {
  const [selectedId, setSelectedId] = useState(null);
  const { area } = useContext(dataContext);
  const { type } = useParams();
  const products = [
    {
      name: "Cigarro Marlboro Premier Box 20u",
      id: "1523465",
      date: "16/10/23, 16:00",
      cant: "1",
    },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: -1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: 1 },
    { name: "Cigarro", id: "1523465", date: "16/10/23, 16:00", cant: -1 },
  ];
  //? Lista de productos agregados al area
  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <TopBar text={"ID:"} />
        <SectionBar
          section={`Revisar área ${area && area}`}
          backTo={
            type === "single"
              ? routes.singleProductEntry
              : routes.multipleProductEntry
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
                {item.cant < 0 ? "" : "+"} {item.cant}
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

export default Review;
