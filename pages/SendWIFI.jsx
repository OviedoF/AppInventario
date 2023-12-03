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
import ReplaceWithLoading from "../components/ReplaceWithLoading";
import * as SecureStore from 'expo-secure-store';

const SendWIFI = () => {
  const { config, setSnackbar, setLoading } = useContext(dataContext)
  const [areas, setAreas] = useState([])
  const [areasSended, setAreasSended] = useState([])
  const [ip, setIp] = useState('')
  const [maxAreas, setMaxAreas] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const getTotalProductsOfAreas = async (areas) => {
    const db = SQLite.openDatabase("Maestro.db");
    ExecuteQuery(
      db,
      "SELECT area, quantity FROM INVENTARIO_APP",
      [],
      (res) => {

        // Mapear el array de áreas y agregar la variable "totalProd" a cada objeto
        const areasConTotalProd = areas.map(area => {
          const totalProd = res.rows._array.filter(item => item.area === area.NUM_AREA).reduce((acc, item) => acc + item.quantity, 0);
          return { ...area, totalProd };
        });

        console.log(areasConTotalProd)
        

        setAreas(areasConTotalProd);
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const getAreasWithProducts = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    const areasFinded = [];

    await ExecuteQuery(
      db,
      "SELECT DISTINCT area FROM INVENTARIO_APP",
      [],
      (res) => {
        setMaxAreas(res.rows._array.length)

        res.rows._array.forEach(async (item) => {
          await ExecuteQuery(
            db,
            "SELECT * FROM AREAS WHERE NUM_AREA = ?",
            [item.area],
            (res) => {
              setAreas([
                ...areasFinded,
                res.rows._array[0]
              ]);
            },
            (err) => {
              console.log(err)
            }
          );
        });
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const passDataToInventarioAppEnviados = async (data) => {
    const db = SQLite.openDatabase("Maestro.db");

    data.Lecturas.forEach(item => {
      ExecuteQuery(
        db,
        "INSERT INTO INVENTARIO_APP_ENVIADOS (CorrPt, FechaLectura, CodOperador, Serie, CodProducto, Cantidad, ExistenciaProducto, TipoLectura, EstadoTag, CorrelativoApertura, idDispositivo, CodInv, CodCapturador, Area) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          item.CorrPt,
          item.FechaLectura,
          item.CodOperador,
          item.Serie,
          item.CodProducto,
          item.Cantidad,
          item.ExistenciaProducto,
          item.TipoLectura,
          item.EstadoTag,
          item.CorrelativoApertura,
          data.Datos.id,
          data.Datos.CodInv,
          data.Datos.CodCapturador,
          data.Datos.Area,
        ],
        (res) => {
          if (res.rowsAffected > 0) {
            ExecuteQuery(
              db,
              "DELETE FROM INVENTARIO_APP WHERE id = ?",
              [item.CorrPt],
              (res) => {
                console.log('Se eliminó el registro de INVENTARIO_APP N° ' + item.CorrPt)
              },
              (err) => {
                console.log(err)
              }
            )
          }
        },
        (err) => {
          console.log(err)
        }
      )
    })

    // * Actualizar el estado de las áreas a "INIT"
    ExecuteQuery(
      db,
      "UPDATE AREAS SET estado = ? WHERE NUM_AREA = ?",
      ["INIT", data.Datos.Area],
      (res) => {
        console.log('Se actualizó el estado del área N° ' + data.Datos.Area + ' a INIT')
        getAreasWithProducts()
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const sendArea = async (area) => {
    try {
      setLoading(true)
      if (!ip) return setSnackbar({ open: true, message: 'Ingrese una IP', type: 'error' })
      if (!config.inv_activo) return setSnackbar({ open: true, message: 'No hay inventario activo', type: 'error' })

      const id = await SecureStore.getItemAsync("hardwareId");
      const codCapturador = await SecureStore.getItemAsync('codCapturador')
      const CodEmpresa = '1';
      const CodInv = config.inv_activo;
      const Area = area.NUM_AREA
      const FechaEnvio = formatDate(new Date());

      const token = await axios.post(`http://${ip}/isam/api/auth.php`, {
        id
      }).then(response => response.data.result.token)
        .catch(error => {
          console.log(error)
          setLoading(false)
          setSnackbar({ open: true, message: 'Error al obtener token', type: 'error' })
        })
        console.log(id)

      if (!token) return setSnackbar({ visible: true, text: 'Error al obtener token', type: 'error' })

      const data = {
        Datos: {
          id,
          token,
          CodEmpresa,
          CodInv,
          CodCapturador: codCapturador || '',
          Area,
          FechaEnvio,
          TotalLectura: area.totalProd,
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
            data.Lecturas.push({
              CorrPt: item.id,
              FechaLectura: formatDate(new Date(item.date)),
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

          console.log(data)

          const sendedArea = await axios.post(`http://${ip}/isam/api/recepcion_areas.php`, data)
          if (sendedArea.data.status !== 'error') {
            console.log(sendedArea.data)
            setLoading(false)
            setAreas(areas.filter(item => item.NUM_AREA !== area.NUM_AREA))
            setAreasSended([...areasSended, area])

            // * Abrir área
            ExecuteQuery(
              db,
              "UPDATE AREAS SET ESTADO = ? WHERE NUM_AREA = ?",
              ["INIT", area.NUM_AREA],
              (res) => {
                console.log('Se actualizó el estado del área N° ' + area.NUM_AREA + ' a INIT')

                return setSnackbar({ visible: true, text: "Carga y Respaldo Realizado con Exito", type: 'success' })
              },
              (err) => {
                console.log(err)
              }
            )
          } else {
            setLoading(false)
            return setSnackbar({ visible: true, text: sendedArea.data.result.error_msg, type: 'error' })
          }
        },
        (err) => {
          console.log(err)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const sendAllAreas = async () => {
    try {
      areas.forEach(async (area) => {
        await sendArea(area)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const sendPendingAreas = async () => {
    try {
      areas.forEach(async (area) => {
        console.log(area)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const sendSelectedAreas = async () => {
    try {
      selectedAreas.forEach(async (area) => {
        await sendArea(area)
      })
    } catch (error) {
      console.log(error)
    }
  }

  const getIP = async () => {
    const ip = await AsyncStorage.getItem("IP");
    setIp(ip);
  }

  useEffect(() => {
    getAreasWithProducts()
    getIP()
  }, [])

  useEffect(() => {
    if(areas.length === maxAreas) {
      // * Hay algún área sin totalProd?
      const areasWithTotalProd = areas.filter(area => area.totalProd === undefined)

      if(areasWithTotalProd.length) {
        getTotalProductsOfAreas(areasWithTotalProd)
      }
    }
  }, [areas])

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

          <ReplaceWithLoading>
            <View style={[styles.flex_row, { justifyContent: "space-between", width: '90%', marginVertical: 10 }]}>
              <TouchableOpacity style={{
                width: '25%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5,
                backgroundColor: selectedAreas.length === 0 ? '#00000020' : '#2E97A7'
              }}
                onPress={() => sendSelectedAreas()}

              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 10 }}>Enviar Seleccionadas</Text>
              </TouchableOpacity>


              <TouchableOpacity style={{ width: '25%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5 }}
                onPress={() => sendPendingAreas()}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 10 }}>Enviar pendientes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ width: '25%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5 }}
                onPress={() => sendAllAreas()}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 10 }}>Enviar Todas</Text>
              </TouchableOpacity>
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
                <TouchableOpacity key={index} style={[styles.flex_row, {
                  width: "90%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  paddingVertical: 10,
                  backgroundColor: selectedAreas.includes(area.NUM_AREA) ? '#00000020' : 'white',
                }]} onPress={
                  () => {
                    if (selectedAreas.includes(area.NUM_AREA)) {
                      setSelectedAreas(selectedAreas.filter(item => item !== area.NUM_AREA))
                    } else {
                      setSelectedAreas([...selectedAreas, area.NUM_AREA])
                    }
                  }
                }>
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.NUM_AREA}</Text>
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.totalProd}</Text>
                  <TouchableOpacity style={{ width: '32%', textAlign: 'center', 
                  backgroundColor: area.ENVIADA === 1 ? '#00000020' : '#2E97A7', 
                  paddingVertical: 5, borderRadius: 5 }}
                    onPress={() => {
                      if (area.ENVIADA === 1) return setSnackbar({ visible: true, text: 'Esta área ya fue enviada', type: 'error' })
                      if (area.ESTADO !== 'CERRADA') return setSnackbar({ visible: true, text: 'Esta área no está cerrada', type: 'error' })
                      sendArea(area)
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Enviar</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              {areasSended.map((area, index) => (
                <TouchableOpacity key={index} style={[styles.flex_row, {
                  width: "90%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  paddingVertical: 10,
                  backgroundColor: selectedAreas.includes(area.NUM_AREA) ? '#00000020' : 'white',
                }]}>
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.NUM_AREA}</Text>
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.totalProd}</Text>
                  <TouchableOpacity style={{ width: '32%', textAlign: 'center', 
                  backgroundColor: '#00000020', 
                  paddingVertical: 5, borderRadius: 5 }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Enviado</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ReplaceWithLoading>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SendWIFI;
