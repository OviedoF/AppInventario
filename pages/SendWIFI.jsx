import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import routes from "../router/routes";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import SelectDropdown from "react-native-select-dropdown";
import TopBar from "../components/TopBar";

const SendWIFI = () => {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />

        <SectionBar section={"Enviar conteo WIFI"} backTo={routes.home} />

        <View style={styles.container}>
          <View style={[styles.flex_row]}>
            <Text style={{ marginRight: 10, fontSize: 20 }}>Nueva IP</Text>

            <TextInput
              style={[
                styles.input,
                {
                  width: 200,
                },
              ]}
            />
          </View>

          <View>
            <Text style={{ marginTop: 10, fontSize: 20 }}>
              ÁREAS REGISTRADAS
            </Text>

            <View style={[styles.flex_row]}>
              <SelectDropdown
                data={[]}
                onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  // text represented after item is selected
                  // if data array is an array of objects then return selectedItem.property to render after item is selected
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item;
                }}
                defaultValue={{
                  label: "Selecciona una opción...",
                  value: null,
                  color: "#9EA0A4",
                }}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { marginLeft: 10, width: "40%" }]}
              >
                <Text
                  style={[
                    styles.white,
                    { fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  ENVIAR
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 10, width: "100vw" }]}
            >
              <Text
                style={[
                  styles.white,
                  { fontWeight: "bold", textAlign: "center" },
                ]}
              >
                ENVIAR PENDIENTES
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={{ marginTop: 30, fontSize: 20 }}>ÁREAS ENVIADAS</Text>

            <View style={[styles.flex_row]}>
              <SelectDropdown
                data={[]}
                onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index);
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  // text represented after item is selected
                  // if data array is an array of objects then return selectedItem.property to render after item is selected
                  return selectedItem;
                }}
                rowTextForSelection={(item, index) => {
                  // text represented for each item in dropdown
                  // if data array is an array of objects then return item.property to represent item in dropdown
                  return item;
                }}
                defaultValue={{
                  label: "Selecciona una opción...",
                  value: null,
                  color: "#9EA0A4",
                }}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { marginLeft: 10, width: "40%" }]}
              >
                <Text
                  style={[
                    styles.white,
                    { fontWeight: "bold", textAlign: "center" },
                  ]}
                >
                  RE-ENVIAR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SendWIFI;
