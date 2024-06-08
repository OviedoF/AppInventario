import { View, Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/styles";
import { dataContext } from "../context/dataContext";
import * as SecureStore from "expo-secure-store";

const TopBar = () => {
  const [codCapturador, setCodCapturador] = useState('...')
  const {hardwareId, inventario, user} = useContext(dataContext);
  const userTxt = user ? `OP: ${user.COD_USUARIO} - ${user.NOMBRES}` : "SIN USUARIO";
  const userTxtSimplified = userTxt.length > 21 ? userTxt.substring(0, 21) + "." : userTxt;
  const invTxt = inventario ? `INV: ${inventario}` : "SIN INVENTARIO";
  const invTxtSimplified = invTxt.length > 25 ? invTxt.substring(0, 25) + "." : invTxt;

  useEffect(() => {
    const getCodCapturador = async () => {
      const cod = await SecureStore.getItemAsync("codCapturador");
      return setCodCapturador(cod);
    }
    getCodCapturador();
  }, [])


  return (
    <View style={styles.topSectionContainer}>
      <Text style={[styles.subtitle, styles.white, styles.mxSm, styles.pySm, {
        fontSize: 10
      }]}>
        {!user && `ID: ${hardwareId || "SIN ID TODAVÍA"} | INV: ${inventario || "SIN INVENTARIO"}`}

        {user && `${userTxtSimplified} | ${invTxtSimplified} | PT: ${codCapturador}`}
      </Text>
    </View>
  );
};

export default TopBar;
