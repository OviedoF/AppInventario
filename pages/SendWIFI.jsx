import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import routes from "../router/routes";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import TopBar from "../components/TopBar";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dataContext } from "../context/dataContext";
import axios from "axios";

const SendWIFI = () => {
  const { config, setSnackbar } = useContext(dataContext)
  const [areas, setAreas] = useState([])
  const [ip, setIp] = useState('http://10.0.2.2:80')
  console.log(config)

  const getTotalProductsOfAreas = async (areas) => {
    const db = SQLite.openDatabase("Maestro.db");
    ExecuteQuery(
      db,
      "SELECT * FROM INVENTARIO_APP",
      [],
      (res) => {

        // Obtener un conjunto de áreas únicas del primer array
        const uniqueAreas = new Set(res.rows._array.map(item => item.area));

        // Mapear el array de áreas y agregar la variable "totalProd" a cada objeto
        const areasConTotalProd = areas.map(area => {
          const totalProd = res.rows._array.filter(item => item.area === area.NUM_AREA && uniqueAreas.has(item.area)).length;
          return { ...area, totalProd };
        });

        setAreas(areasConTotalProd);
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const getClosedAreas = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    ExecuteQuery(
      db,
      "SELECT * FROM AREAS WHERE estado = ?",
      ["CERRADA"],
      (res) => {
        getTotalProductsOfAreas(res.rows._array)
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const sendArea = async (area) => {
    try {
      if (!ip) return setSnackbar({ open: true, message: 'Ingrese una IP', type: 'error' })

      const id = await AsyncStorage.getItem("hardwareId");
      const codCapturador = await AsyncStorage.getItem('codCapturador')
      const CodEmpresa = '1';
      const CodInv = config.inv_activo;
      const Area = area.NUM_AREA
      const FechaEnvio = new Date().toISOString();

      const token = await axios.post(`${ip}/isam/api/auth.php`, {
        id
      }).then(response => response.data.result.token)
        .catch(error => {
          console.log(error)
          setSnackbar({ open: true, message: 'Error al obtener token', type: 'error' })
        })

      if(!token) return setSnackbar({ open: true, message: 'Error al obtener token', type: 'error' })

      const data = {
        Datos: {
          id,
          token,
          CodEmpresa,
          CodInv,
          CodCapturador: codCapturador || '',
          Area,
          FechaEnvio,
        },
        Lecturas: [],
      }

      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM INVENTARIO_APP WHERE area = ?",
        [area.NUM_AREA],
        async (res) => {
          res.rows._array.forEach(item => {
            console.log(item)
            data.Lecturas.push({
              CorrPt: item.id,
              FechaLectura: new Date().toISOString(),
              CodOperador: parseInt(item.operator),
              Serie: item.serie,
              CodProducto: item.name,
              Cantidad: item.quantity,
              ExistenciaProducto: item.existe,
              TipoLectura: item.type,
              EstadoTag: item.EstadoTag,
              CorrelativoApertura: item.CorrelativoApertura,
            })
          });

          data['Datos']['TotalLectura'] = data.Lecturas.length

          const sendedArea = await axios.post(`${ip}/isam/api/recepcion_areas.php`, data)
          console.log(sendedArea.data.result)
          if(sendedArea.data.result) return setSnackbar({ visible: true, text: 'Área enviada correctamente', type: 'success' })
        },
        (err) => {
          console.log(err)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getClosedAreas()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />

        <SectionBar section={"Enviar conteo WIFI"} backTo={routes.captureMenu} />

        <View style={styles.container}>
          <View style={[styles.flex_row]}>
            <Text style={{ marginRight: 10, fontSize: 20 }}>Nueva IP</Text>

            <TextInput
              onChangeText={(text) => setIp(text)}
              value={ip}
              style={[
                styles.input,
                {
                  width: 200,
                },
              ]}
            />
          </View>

          <View style={{
            width: "100%",
            alignItems: "center",
          }}>
            <View style={[styles.flex_row, {
              width: "90%",
              backgroundColor: "#2E97A7",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              paddingVertical: 10,
            }]}>
              <Text style={{ width: '32%', textAlign: 'center', color: 'white' }}>Área</Text>
              <Text style={{ width: '32%', textAlign: 'center', color: 'white' }}>Total de productos</Text>
              <Text style={{ width: '32%', textAlign: 'center', color: 'white' }}>Enviar</Text>
            </View>

            {areas.map((area, index) => (
              <View key={index} style={[styles.flex_row, {
                width: "90%",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                paddingVertical: 10,
              }]}>
                <Text style={{ width: '32%', textAlign: 'center' }}>{area.NUM_AREA}</Text>
                <Text style={{ width: '32%', textAlign: 'center' }}>{area.totalProd}</Text>
                <TouchableOpacity style={{ width: '32%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5 }}
                  onPress={() => sendArea(area)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>Enviar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SendWIFI;
