import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useRef, useState } from "react";
import styles from "../styles/styles";
import routes from "../router/routes";
import SectionBar from "../components/SectionBar";
import { Controller, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import TopBar from "../components/TopBar";

const CD = () => {
  const [errorModal, setErrorModal] = useState(false);
  const {
    handleSubmit,
    resetField,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      position: "",
      box: "",
      area: "",
    },
  });

  const refs = {
    position: useRef(null),
    box: useRef(null),
    area: useRef(null),
  };

  const handleFocus = (ref) => {
    ref.current.focus();
  };

  const handleCD = async (data) => {
    try {
      // ! crear funcion para ingresar datos
      /* const res = await login(data); */
      const res = true;
      if (res) {
        navigate(routes.home);
      } else {
        setErrorModal(true);
      }
    } catch (error) {}
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar text={"ID:"} />
        <SectionBar section={"Ingreso CD"} backTo={routes.home} />
        <View style={styles.mySm}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TouchableOpacity
                    accessibilityLabel="Posición"
                    style={styles.cdBtn}
                    onPress={() => resetField("position")}
                  >
                    <Text>Posición</Text>
                  </TouchableOpacity>
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    style={styles.cdField}
                    onSubmitEditing={() => handleFocus(refs.box)}
                    ref={refs.position}
                  />
                </>
              )}
              name="position"
              rules={{ required: true }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TouchableOpacity
                    accessibilityLabel="Caja o Pallet"
                    style={styles.cdBtn}
                    onPress={() => resetField("box")}
                  >
                    <Text>Caja o Pallet</Text>
                  </TouchableOpacity>
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    style={styles.cdField}
                    onSubmitEditing={() => handleFocus(refs.area)}
                    ref={refs.box}
                  />
                </>
              )}
              name="box"
              rules={{ required: true }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TouchableOpacity
                    accessibilityLabel="Área"
                    style={styles.cdBtn}
                    onPress={() => resetField("area")}
                  >
                    <Text>Área</Text>
                  </TouchableOpacity>
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    style={styles.cdField}
                    ref={refs.area}
                  />
                </>
              )}
              name="area"
              rules={{ required: true }}
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              accessibilityLabel="Aceptar"
              onPress={handleSubmit(handleCD)}
              style={styles.logBtn}
            >
              <Text style={[styles.white, styles.textCenter]}>ACEPTAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ErrorModal
          message={"Los datos ingresados son incorrectos, intente nuevamente."}
          modalFailVisible={errorModal}
          setModalFailVisible={setErrorModal}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CD;
