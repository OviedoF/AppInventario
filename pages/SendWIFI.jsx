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
import * as FileSystem from "expo-file-system";
const { StorageAccessFramework } = FileSystem;
import env from "../env";

const SendWIFI = () => {
  const { config, setSnackbar, setLoading } = useContext(dataContext)
  const [areas, setAreas] = useState([])
  const [ip, setIp] = useState('')
  const [filter, setFilter] = useState('PENDIENTES')
  const [selectedAreas, setSelectedAreas] = useState([])
  const [orderBy, setOrderBy] = useState('ASC')

  // * Función para crear el archivo de respaldo

  const ensureDirAsync = async (dir, intermediates = true) => {
    const props = await FileSystem.getInfoAsync(dir)
    if (props.exists && props.isDirectory) {
      return props;
    }

    await FileSystem.makeDirectoryAsync(dir, { intermediates })
    return await ensureDirAsync(dir, intermediates)
  }

  const saveAndroidFile = async (fileUri, fileName = 'File') => {
    try {
      const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      let directoryUri = ""

      const storageDir = await SecureStore.getItemAsync(env.asyncStorage.storageDir)

      if (!storageDir) {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          return;
        }

        directoryUri = permissions.directoryUri
        await SecureStore.setItemAsync(env.asyncStorage.storageDir, permissions.directoryUri)
      }

      directoryUri = storageDir

      try {
        await StorageAccessFramework.createFileAsync(directoryUri, fileName, 'text/plain')
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
          })
          .catch((e) => {
          });
      } catch (e) {
        throw new Error(e);
      }

    } catch (err) {
    }
  }

  const requestPermissions = async () => {
    const storageDir = await SecureStore.getItemAsync(env.asyncStorage.storageDir)

    if (!storageDir) {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          'Error',
          'No se han otorgado los permisos necesarios para guardar el archivo de respaldo.',
          [
            {
              text: 'REVISAR PERMISOS',
              onPress: () => requestPermissions(),
            },
          ],
          { cancelable: false },
        )
        return;
      }

      directoryUri = permissions.directoryUri
      await SecureStore.setItemAsync(env.asyncStorage.storageDir, permissions.directoryUri)
    }
  }

  const writeTxtFile = async (data) => {
    try {
      requestPermissions()
      const fecha = data.Datos.FechaEnvio.split(' ')[0];
      const hora = data.Datos.FechaEnvio.split(' ')[1].replaceAll(':', '-')
      const nombreArchivo = `1_${data.Datos.CodEmpresa}_${data.Datos.CodInv}_${data.Datos.CodCapturador}_${data.Datos.Area}_${fecha}_${hora}.txt`
      const fileUri = `${FileSystem.documentDirectory}${nombreArchivo}`;

      let text = ``;
      data.Lecturas.forEach(item => {
        text += `${item.CorrPt}|${item.FechaLectura}|${data.Datos.CodCapturador}|${item.CodOperador}|${item.Serie}|${data.Datos.Area}|${item.CodProducto}|${item.Cantidad}|${item.ExistenciaProducto}|${item.TipoLectura}|${item.EstadoTag}|${item.CorrelativoApertura}\n`
      })

      await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 })

      const file = await FileSystem.getInfoAsync(fileUri);

      const dir = await ensureDirAsync(`${FileSystem.documentDirectory}`);

      saveAndroidFile(fileUri, nombreArchivo)
    } catch (error) {
      console.log(error)
      return setSnackbar({ visible: true, text: 'Error al crear el archivo de respaldo', type: 'error' })
    }
  }

  useEffect(() => {
    requestPermissions()
  }, [])

  // * Función para dar formato a la fecha

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // * Función para obtener el total de productos de cada área

  const getTotalProductsOfAreas = async (areas) => {
    console.log('areas en total', areas)
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

        console.log('areasConTotalProd', areasConTotalProd)

        setAreas(areasConTotalProd);
      },
      (err) => {
        console.log(err)
      }
    )
  }

  const getAreasWithProducts = async () => {
    const db = SQLite.openDatabase("Maestro.db");

    await ExecuteQuery(
      db,
      "SELECT DISTINCT area FROM INVENTARIO_APP",
      [],
      (res) => {
        const areasNumbers = res.rows._array.map(item => item.area);
        ExecuteQuery(
          db,
          `SELECT * FROM AREAS WHERE NUM_AREA IN (${areasNumbers.map((item, index) => `?`).join(', ')}) AND ${
            filter === 'PENDIENTES' ? 'ENVIADA = 0 AND ESTADO = "CERRADA"' : filter === 'ENVIADAS' ? 'ENVIADA = 1' : filter === 'ABIERTAS' ? 'ESTADO = "INI"' : ''
          } ORDER BY NUM_AREA ${orderBy}`,
          [...areasNumbers],
          (res) => {
            setAreas(res.rows._array)
          },
          (err) => {
            console.log(err)
          }
        );
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

      const token = await axios.post(`http://${ip}/isam_inventoriesv2/api/auth.php`, {
        id
      }).then(response => response.data.result.token)
        .catch(error => {
          console.log(error)
          setLoading(false)
          setSnackbar({ visible: true, text: 'Error al obtener token', type: 'error' })
        })

      if (!token) return setSnackbar({ visible: true, text: 'Error al obtener token', type: 'error' })

      const data = {
        Datos: {
          id,
          token,
          CodEmpresa,
          CodInv,
          CodCapturador: codCapturador || '',
          Area,
          Pallet: "",
          Caja: "",
          Posicion: "",
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
              CorrPt: parseInt(item.CorrPT),
              FechaLectura: formatDate(new Date(item.date)),
              CodOperador: parseInt(item.operator),
              Serie: item.serie,
              CodProducto: item.name,
              Cantidad: item.quantity,
              ExistenciaProducto: item.existe,
              TipoLectura: item.type,
              EstadoTag: area.UESTADO == 'INI' ? '0' : area.UESTADO,
              CorrelativoApertura: area.ESTADOTAG,
              // EstadoTag: item.EstadoTag,
              // CorrelativoApertura: item.CorrelativoApertura,
            })
          });

          const sendedArea = await axios.post(`http://${ip}/isam_inventoriesv2/api/recepcion_areas.php`, data)
          if (sendedArea.data.status !== 'error') {
            await writeTxtFile(data)
            setLoading(false)

            await ExecuteQuery(
              db,
              "UPDATE AREAS SET ENVIADA = 1 WHERE NUM_AREA = ?",
              [area.NUM_AREA],
              (res) => {
                getAreasWithProducts()
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
      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM AREAS WHERE ENVIADA = 0 AND ESTADO = 'CERRADA'",
        [],
        (res) => {
          if(!res.rows._array.length) return setSnackbar({ visible: true, text: 'No hay áreas pendientes', type: 'error' })

          res.rows._array.forEach(async (area) => {
            await ExecuteQuery(
              db,
              "SELECT SUM(quantity) FROM INVENTARIO_APP WHERE area = ?",
              [area.NUM_AREA],
              async (res) => {
                await sendArea({
                  ...area,
                  totalProd: res.rows._array[0]['SUM(quantity)']
                })
              }
            )
          });
        },
        (err) => {
          console.log(err)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const sendSelectedAreas = async () => {
    try {
      selectedAreas.forEach(async (area) => {
        db = SQLite.openDatabase("Maestro.db");
        ExecuteQuery(
          db,
          `SELECT * FROM AREAS WHERE NUM_AREA IN (${selectedAreas.map((item, index) => `?`).join(', ')})`,
          [...selectedAreas],
          (res) => {
            res.rows._array.forEach(async (area) => {
              if(area.ESTADO !== 'CERRADA') return setSnackbar({ visible: true, text: `El área ${area.NUM_AREA} no está cerrada, se salteó.`, type: 'error' })

              await ExecuteQuery(
                db,
                "SELECT SUM(quantity) FROM INVENTARIO_APP WHERE area = ?",
                [area.NUM_AREA],
                async (res) => {
                  await sendArea({
                    ...area,
                    totalProd: res.rows._array[0]['SUM(quantity)']
                  })
                }
              )
            });
          },
          (err) => {
            console.log(err)
          }
        )
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
    setLoading(false)
    getIP()
  }, [])

  useEffect(() => {
    getAreasWithProducts()
  }, [filter, orderBy])

  useEffect(() => {
    const areasWithTotalProd = areas.filter(area => area.totalProd === undefined)

    if (areasWithTotalProd.length) {
      getTotalProductsOfAreas(areasWithTotalProd)
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
                width: '30%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5,
                backgroundColor: filter === 'PENDIENTES' ? '#2E97A7' : '#00000020'
              }}
                onPress={() => setFilter('PENDIENTES')}

              >
                <Text style={{
                  color: filter === 'PENDIENTES' ? 'white' : 'black',
                  textAlign: 'center',
                  fontSize: 13
                }}>PENDIENTES</Text>
              </TouchableOpacity>


              <TouchableOpacity style={{
                width: '30%', textAlign: 'center',
                backgroundColor: filter === 'ENVIADAS' ? '#2E97A7' : '#00000020',
                paddingVertical: 5, borderRadius: 5
              }}
                onPress={() => setFilter('ENVIADAS')}
              >
                <Text style={{
                  color: filter === 'ENVIADAS' ? 'white' : 'black',
                  textAlign: 'center',
                  fontSize: 13
                }}>ENVIADAS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{
                width: '30%', textAlign: 'center',
                backgroundColor: filter === 'ABIERTAS' ? '#2E97A7' : '#00000020',
                paddingVertical: 5,
                borderRadius: 5
              }}
                onPress={() => setFilter('ABIERTAS')}
              >
                <Text style={{
                  color: filter === 'ABIERTAS' ? 'white' : 'black',
                  textAlign: 'center',
                  fontSize: 13
                }}>SIN CERRAR</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.flex_row, { justifyContent: "space-between", width: '90%', marginVertical: 10 }]}>
              <TouchableOpacity style={{
                width: '30%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5,
                backgroundColor: selectedAreas.length === 0 ? '#00000020' : '#2E97A7'
              }}
                onPress={() => sendSelectedAreas()}

              >
                <Text style={{ color: selectedAreas.length === 0 ? 'black' : 'white', textAlign: 'center', fontSize: 13 }}>Enviar Seleccionadas</Text>
              </TouchableOpacity>


              <TouchableOpacity style={{ width: '30%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5 }}
                onPress={() => sendPendingAreas()}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 13 }}>Enviar pendientes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ width: '30%', textAlign: 'center', backgroundColor: '#2E97A7', paddingVertical: 5, borderRadius: 5 }}
                onPress={() => sendAllAreas()}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 13 }}>Enviar Todas</Text>
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
                <TouchableOpacity style={{ width: '32%', textAlign: 'center' }}
                  onPress={() => {
                    setOrderBy(orderBy === 'ASC' ? 'DESC' : 'ASC')
                  }}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>Área ({orderBy})</Text>
                </TouchableOpacity>
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
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.NUM_AREA.slice(0, area.NUM_AREA.length - 1)}-{area.NUM_AREA[area.NUM_AREA.length - 1]}</Text>
                  <Text style={{ width: '32%', textAlign: 'center' }}>{area.totalProd}</Text>
                  <TouchableOpacity style={{
                    width: '32%', textAlign: 'center',
                    backgroundColor: '#2E97A7',
                    paddingVertical: 5, borderRadius: 5
                  }}
                    onPress={() => {
                      if (area.ESTADO !== 'CERRADA') return setSnackbar({ visible: true, text: 'Esta área no está cerrada', type: 'error' })
                      sendArea(area)
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>
                      {filter === "ENVIADAS" ? "Reenviar" : "Enviar"}
                    </Text>
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
