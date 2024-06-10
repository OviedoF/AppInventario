import React, { useState, createContext, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import env from "../env";
import { StorageAccessFramework } from 'expo-file-system';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';

export const dataContext = createContext();

export const DataProvider = ({ children }) => {
  const [area, setArea] = useState('');
  const [serie, setSerie] = useState('')
  const [user, setUser] = useState(undefined);
  const [inventario, setInventario] = useState('')
  const [hardwareId, setHardwareId] = useState('')
  const [codCapturador, setCodCapturador] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    visible: false,
    text: "",
    type: "success",
  });
  const [config, setConfig] = useState({
    largo_tag: 0,
    largo_prod: 0,
    buttons_config: '',
    catalog_products: true,
    index_capt: 1,
    inv_activo: '',
    congelados: false,
  })
  const [dangerModal, setDangerModal] = useState({
    visible: false,
    title: "",
    text: "",
    buttons: [],
  })
  const [cdInfo, setCdInfo] = useState({})

  const reset = () => {
    setArea('')
    setSerie('')
    setUser(undefined)
    setLoading(false)
    setConfig({
      ...config,
      largo_tag: 0,
      largo_prod: 0,
      buttons_config: '',
      catalog_products: true,
      index_capt: 1,
    })
  }

  const sendArea = async (area, navigateFn) => {
    try {

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
          console.log('ESCRIBIENDO DESDE CONTEXT')
          const area = data.Datos.Area.slice(0, -1)
          requestPermissions()
          const fecha = data.Datos.FechaEnvio.split(' ')[0];
          const hora = data.Datos.FechaEnvio.split(' ')[1].replaceAll(':', '-')
          const nombreArchivo = `1_${data.Datos.CodEmpresa}_${data.Datos.CodInv}_${data.Datos.CodCapturador}_${area}_${fecha}_${hora}.txt`
          const fileUri = `${FileSystem.documentDirectory}${nombreArchivo}`;

          let text = ``;
          data.Lecturas.forEach(item => {
            text += `${item.CorrPt}|${item.FechaLectura}|${data.Datos.CodCapturador}|${item.CodOperador}|${item.Serie}|${area}|${item.CodProducto}|${item.Cantidad}|${item.ExistenciaProducto}|${item.TipoLectura}|${item.EstadoTag}|${item.CorrelativoApertura}\n`
          })

          await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 })

          const file = await FileSystem.getInfoAsync(fileUri);
          console.log('file', file)

          const dir = await ensureDirAsync(`${FileSystem.documentDirectory}`);
          console.log('dir', dir)

          saveAndroidFile(fileUri, nombreArchivo)
        } catch (error) {
          console.log(error)
          return setSnackbar({ visible: true, text: 'Error al crear el archivo de respaldo', type: 'error' })
        }
      }

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

      setLoading(true)
      const ip = await AsyncStorage.getItem("IP");

      if (!ip) return setSnackbar({ open: true, message: 'Ingrese una IP', type: 'error' })
      if (!config.inv_activo) return setSnackbar({ open: true, message: 'No hay inventario activo', type: 'error' })

      const id = await SecureStore.getItemAsync("hardwareId");
      const codCapturador = await SecureStore.getItemAsync('codCapturador')
      const CodEmpresa = '1';
      const CodInv = config.inv_activo;
      const Area = area.NUM_AREA.slice(0, -1);
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
          Posicion: '',
          Pallet: '',
          Caja: '',
          FechaEnvio,
          TotalLectura: 0,
        },
        Lecturas: [],
      }

      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM INVENTARIO_APP WHERE area = ? AND CorrelativoApertura = ?",
        [area.NUM_AREA, area.ESTADOTAG],
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

            data.Datos.TotalLectura += parseFloat(item.quantity)
          });

          console.log('data', data)

          const sendedArea = await axios.post(`http://${ip}/isam_inventoriesv2/api/recepcion_areas.php`, data)
          if (sendedArea.data.status !== 'error') {
            await writeTxtFile(data)
            setLoading(false)
            setArea("");
            navigateFn && navigateFn()

            ExecuteQuery(
              db,
              'UPDATE AREAS SET ENVIADA = 1 WHERE NUM_AREA = ?',
              [area.NUM_AREA],
              (res) => {
                console.log('res', res)
              },
              (err) => {
                console.log('err', err)
              }
            )

            return setSnackbar({ visible: true, text: "Carga y Respaldo Realizado con Exito", type: 'success' })
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

  return (
    <dataContext.Provider
      value={{
        area,
        setArea,
        user,
        setUser,
        snackbar,
        setSnackbar,
        config,
        setConfig,
        cdInfo,
        setCdInfo,
        hardwareId,
        setHardwareId,
        inventario,
        setInventario,
        dangerModal,
        setDangerModal,
        serie,
        setSerie,
        codCapturador,
        setCodCapturador,
        loading,
        setLoading,
        reset,
        sendArea,
        /* cartCant,
        addToCart,
        clearCart,
        eraseItemFromCart, */
      }}
    >
      {children}
    </dataContext.Provider>
  );
};
