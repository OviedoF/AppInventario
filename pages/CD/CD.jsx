import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigate } from "react-router-native";
import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import styles from "../../styles/styles";
import SectionBar from "../../components/SectionBar";
import routes from "../../router/routes";
import RadioGroup from "react-native-radio-buttons-group";
import TopBar from "../../components/TopBar";
import { dataContext } from "../../context/dataContext";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../../helpers/ExecuteQuery";
import SupervisorApprobalModal from "../../components/SupervisorApprobalModal";
import axios from "axios";
import env from "../../env";
import { Alert } from "react-native";
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from "expo-file-system";
import * as StorageAccessFramework from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const CaptureMenu = ({ clear, fastSend, fastEdit }) => {
  const navigate = useNavigate();
  const { config, setConfig, setSnackbar, user, cdInfo, setCdInfo, setDangerModal, setSerie,
    setLoading
  } =
    useContext(dataContext);
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState(parseInt(config.buttons_config));
  const [idDesired, setIdDesired] = useState("");
  const [authType, setAuthType] = useState("");
  const [modalSupervisor, setModalSupervisor] = useState(false);
  const [error, setError] = useState(false)
  const [edit, setEdit] = useState(false)
  const [disabled, setDisabled] = useState({
    posicion: false,
    pallet: false,
  })
  const refs = {
    posicion: useRef(null),
    pallet: useRef(null),
    caja: useRef(null),
    area: useRef(null),
  };

  const activeEdit = () => {
    setEdit(true);
    setModal(true);
  }


  const sendComb = async (comb) => {
    try {
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
          const nombreArchivo = `1_${data.Datos.CodEmpresa}_${data.Datos.CodInv}_${data.Datos.CodCapturador}${data.Datos.Posicion ? `_${data.Datos.Posicion}` : ''
            }${data.Datos.Pallet ? `_${data.Datos.Pallet}` : ''
            }${data.Datos.Area ? `_${data.Datos.Area}` : ''
            }${data.Datos.Caja ? `_${data.Datos.Caja}` : ''
            }_${fecha}_${hora}.txt`
          const fileUri = `${FileSystem.documentDirectory}${nombreArchivo}`;

          console.log(nombreArchivo)

          let text = ``;
          data.Lecturas.forEach(item => {
            text += `${item.CorrPt}|${item.FechaLectura}|${data.Datos.CodCapturador}|${item.CodOperador}${item.serie ? `|${item.serie}` : ''
              }${data.Datos.Posicion ? `|${data.Datos.Posicion}` : ''
              }${data.Datos.Pallet ? `|${data.Datos.Pallet}` : ''
              }${data.Datos.Area ? `|${data.Datos.Area}` : ''
              }${data.Datos.Caja ? `|${data.Datos.Caja}` : ''
              }|${item.CodProducto}|${item.Cantidad}|${item.ExistenciaProducto}|${item.TipoLectura}|${item.EstadoTag}|${item.CorrelativoApertura}\n`
          })

          console.log(text)

          await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 })

          const file = await FileSystem.getInfoAsync(fileUri);

          const dir = await ensureDirAsync(`${FileSystem.documentDirectory}`);

          saveAndroidFile(fileUri, nombreArchivo)
        } catch (error) {
          console.log(error)
          return setSnackbar({ visible: true, text: 'Error al crear el archivo de respaldo', type: 'error' })
        }
      }

      console.log(comb)
      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        `SELECT * FROM COMBINACIONES_CD WHERE posicion = "${comb.posicion}" AND area = "${comb.area}" AND pallet = "${comb.pallet}" AND caja = "${comb.caja}"`,
        [],
        async (result) => {
          if (result.rows._array.length === 0) return setSnackbar({ visible: true, text: 'La combinación no existe', type: 'error' })

          const comb = result.rows._array[0];
          comb.area = comb.area || '';
          comb.pallet = comb.pallet || '';
          comb.caja = comb.caja || '';
          comb.posicion = comb.posicion || '';

          ExecuteQuery(
            db,
            'SELECT SUM(quantity) FROM INVENTARIO_APP WHERE posicion = ? AND area = ? AND pallet = ? AND caja = ?',
            [comb.posicion, comb.area, comb.pallet, comb.caja],
            async (result) => {
              comb.totalProd = result.rows._array[0]['SUM(quantity)'] || 0;

              setLoading(true)
              const ip = await AsyncStorage.getItem("IP");
              console.log(ip)
              if (!ip) return setSnackbar({ open: true, message: 'Ingrese una IP desde el admin', type: 'error' })

              if (!config.inv_activo) return setSnackbar({ open: true, message: 'No hay inventario activo', type: 'error' })

              const id = await SecureStore.getItemAsync("hardwareId");
              const codCapturador = await SecureStore.getItemAsync('codCapturador')
              if (!codCapturador) {
                setLoading(false)
                return setSnackbar({ visible: true, text: 'No se ha ingresado el código del capturador', type: 'error' })
              }
              const CodEmpresa = '1';
              const CodInv = config.inv_activo;
              const Area = comb.area;
              const Pallet = comb.pallet;
              const Caja = comb.caja;
              const Posicion = comb.posicion;
              const FechaEnvio = formatDate(new Date());

              const token = await axios.post(`http://${ip}/isam/api/auth.php`, {
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
                  Pallet,
                  Caja,
                  Posicion,
                  FechaEnvio,
                  TotalLectura: comb.totalProd,
                },
                Lecturas: [],
              }

              const db = SQLite.openDatabase("Maestro.db");

              ExecuteQuery(
                db,
                "SELECT * FROM INVENTARIO_APP WHERE area = ? AND pallet = ? AND caja = ? AND posicion = ?",
                [comb.area, comb.pallet, comb.caja, comb.posicion],
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
                      EstadoTag: comb.status_corr == 'INI' ? '0' : comb.status_corr,
                      CorrelativoApertura: comb.status_num,
                    })
                  });

                  setLoading(false)

                  const sendedArea = await axios.post(`http://${ip}/isam/api/recepcion_areas.php`, data)
                  if (sendedArea.data.status !== 'error') {
                    await writeTxtFile(data)
                    setLoading(false)

                    await ExecuteQuery(
                      db,
                      "UPDATE COMBINACIONES_CD SET enviada = 1 WHERE area = ? AND pallet = ? AND caja = ? AND posicion = ?",
                      [comb.area, comb.pallet, comb.caja, comb.posicion],
                      (res) => {
                        activeEdit();
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
            },
            (err) => {
              console.log(err)
            }
          )
        },
        (error) => {
          console.log(error)
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const resetModal = () => {
    setModal(false);
    setEdit(false);
  }

  const saveCombination = async (data = {}) => {
    const db = SQLite.openDatabase("Maestro.db");
    const posicion = data.posicion || cdInfo.posicion || "";
    const area = data.area || cdInfo.area || "";
    const pallet = data.pallet || cdInfo.pallet || "";
    const caja = data.caja || cdInfo.caja || "";
    setError(false);
    console.log(posicion, area, pallet, caja);

    switch (config.index_capt) {
      case 2:
        if (!cdInfo.posicion) {
          setError('Ingrese todos los datos.');
          return;
        }
        break;
      case 3:
        if (!cdInfo.posicion || !cdInfo.area) return setError('Ingrese todos los datos.');
        break;
      case 4:
        if (!cdInfo.posicion || !cdInfo.pallet || !cdInfo.caja) return setError('Ingrese todos los datos.');
        break;
      case 5:
        if (!cdInfo.posicion || !cdInfo.pallet || !cdInfo.area) return setError('Ingrese todos los datos.');
        break;
      case 6:
        if (!cdInfo.posicion || !cdInfo.caja) return setError('Ingrese todos los datos.');
      default:
        break;
    }

    // * Buscar si existe la combinación
    ExecuteQuery(
      db,
      "SELECT * FROM COMBINACIONES_CD WHERE posicion = ? AND area = ? AND pallet = ? AND caja = ?",
      [posicion, area, pallet, caja],
      (results) => {
        console.log(results.rows._array);
        if (results.rows._array.length === 0) {
          // * Insertar la combinación
          ExecuteQuery(
            db,
            "INSERT INTO COMBINACIONES_CD (posicion, area, caja, pallet, status, status_num, status_corr, enviada) VALUES (?, ?, ?, ?, 'INI', 0, 'INI', 0)",
            [posicion, area, caja, pallet],
            (results) => {
              console.log(results);
              setSnackbar({
                visible: true,
                text: "Combinación guardada correctamente",
                type: "success",
              });
            },
            (error) => {
              console.log(error);
              setSnackbar({
                visible: true,
                text: "Error al guardar la combinación",
                type: "error",
              });
            }
          );
        }

        if (results.rows._array.length > 0) {
          const combination = results.rows._array[0];
          console.log('Comb', combination);

          if (combination.status === "CERRADA") {
            setDangerModal({
              visible: true,
              title: "Combinación cerrada",
              text: `La combinación ${posicion ? posicion : ""
                } ${area ? `-${area}` : ""
                } ${pallet ? `-${pallet}` : ""
                } ${caja ? `-${caja}` : ""
                } se encuentra cerrada, ¿qué desea hacer?`,
              buttons: [
                {
                  text: "Ver",
                  onPress: () => navigate(routes.cdView),
                  style: "cancel",
                }, {
                  text: "Modificar",
                  onPress: () => {
                    console.log('Modificar');
                    const db = SQLite.openDatabase("Maestro.db");

                    // * CAMBIAMOS EL status_corr DE la comb A M Y SUMAMOS 1 AL status_num

                    ExecuteQuery(
                      db,
                      `UPDATE COMBINACIONES_CD SET status_corr = "M", status_num = status_num + 1 WHERE posicion = "${posicion}" AND area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}"`,
                      [],
                      (result) => {
                        console.log('SE CAMBIÓ EL UESTADO DEL ÁREA A M Y SE SUMÓ 1 AL ESTADOTAG');
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al modificar la combinación",
                          type: "error",
                        });
                      }
                    );

                    // * CAMBIAR EL status DE LA COMB A INI
                    ExecuteQuery(
                      db,
                      `UPDATE COMBINACIONES_CD SET status = "INI", enviada = 0 WHERE posicion = "${posicion}" AND area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}"`,
                      [],
                      (result) => {
                        setSnackbar({
                          visible: true,
                          text: "Combinación abierta correctamente",
                          type: "success",
                        });
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al abrir la combinación",
                          type: "error",
                        });
                      }
                    );
                    resetModal();
                  },
                }, {
                  text: 'Retomar',
                  onPress: () => {
                    console.log('Retomar');
                    const db = SQLite.openDatabase("Maestro.db");
                    // * Limpiamos la combinación
                    ExecuteQuery(
                      db,
                      `DELETE FROM INVENTARIO_APP WHERE area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}" AND posicion = "${posicion}"`,
                      [],
                      (result) => {
                        console.log('Combinación limpiada correctamente');
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al limpiar la Combinación",
                          type: "error",
                        });
                      }
                    );

                    // * Cambiar el status_corr de la combinación a R y sumar 1 al status_num
                    ExecuteQuery(
                      db,
                      `UPDATE COMBINACIONES_CD SET status_corr = "R", status_num = status_num + 1 WHERE posicion = "${posicion}" AND area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}"`,
                      [],
                      (result) => {
                        console.log('SE CAMBIÓ EL UESTADO DE LA Combinación A R Y SE SUMÓ 1 AL ESTADOTAG');
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al retomar la Combinación",
                          type: "error",
                        });
                      }
                    );

                    // * Cambiamos el estado la Combinación a INI
                    ExecuteQuery(
                      db,
                      `UPDATE COMBINACIONES_CD SET status = "INI", enviada = 0 WHERE posicion = "${posicion}" AND area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}"`,
                      [],
                      (result) => {
                        setSnackbar({
                          visible: true,
                          text: "Combinación retomada correctamente!",
                          type: "success",
                        });
                      },
                      (error) => {
                        console.log(error);
                        setSnackbar({
                          visible: true,
                          text: "Error al abrir la Combinación",
                          type: "error",
                        });
                      }
                    );

                    resetModal()
                  }
                }, {
                  text: "Volver",
                  onPress: () => {
                    resetModal()
                    setCdInfo({});
                  },
                  style: "cancel",
                }
              ]
            });
            return;
          }

          setSnackbar({
            visible: true,
            text: "Combinación actualizada correctamente",
            type: "success",
          });
        }
        resetModal()
      },
      (error) => {
        console.log(error);
        setSnackbar({
          visible: true,
          text: "Error al guardar la combinación",
          type: "error",
        });
      }
    );
  };

  const confirmPosicion = async (cb) => {
    try {
      if (!cdInfo.posicion) return setError('Ingrese una posición');

      // * Hacer la consulta a la base de datos para ver si la posición existe
      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM POSICION WHERE POSICION = ?",
        [cdInfo.posicion],
        (results) => {
          if (results.rows._array.length === 0) {
            setError("La posición no existe");
            refs.posicion.current.focus();
            return;
          }

          if (results.rows._array.length > 0) {
            if (cb) cb();
          }
        },
        (error) => {
          console.log(error);
          setSnackbar({
            visible: true,
            text: "Error al ingresar la posición",
            type: "error",
          });
        }
      );

    } catch (error) {
      console.log(error);
      setSnackbar({
        visible: true,
        text: "Error al ingresar el área",
        type: "error",
      });
    }
  };

  function calcularDigitoVerificador(rut) {
    let multiplicador = 0;
    let suma = 1;

    for (; rut; rut = Math.floor(rut / 10)) {
      const digito = rut % 10;
      suma = (suma + digito * (9 - multiplicador++ % 6)) % 11;
    }

    return suma ? suma - 1 : 'k';
  }

  const confirmArea = async () => {
    try {
      if (cdInfo.area === "") {
        setError("Ingrese un área");
        refs.area.current.focus();
        return;
      }

      // * Agarramos la serie, el número de área y el dígito verificador
      const aux = cdInfo.area;
      const serie = aux.slice(0, 3);
      let numArea = aux.slice(3, aux.length - 1);
      console.log(numArea);
      const digitVerif = aux.slice(aux.length - 1, aux.length);

      // * Si el largo del número de área es menor al largo del tag, le agregamos ceros a la izquierda

      while (numArea.length < config.largo_tag) numArea = "0" + numArea;

      // * Si el largo del número de área es mayor al largo del tag, le quitamos los números de la izquierda hasta que el largo sea igual al largo del tag
      while (numArea.length > config.largo_tag) numArea = numArea.slice(1);

      // * Calculamos el dígito verificador del número de área y lo comparamos con el dígito verificador ingresado
      const digitVerifArea = calcularDigitoVerificador(parseInt(numArea));
      console.log(serie, numArea, digitVerif, digitVerifArea);

      // * Hacer la consulta a la base de datos para ver si el área existe
      const db = SQLite.openDatabase("Maestro.db");

      // * Primero revisamos si la serie existe
      ExecuteQuery(
        db,
        "SELECT * FROM SERIES WHERE NUM_SERIE = ?",
        [serie],
        (result) => {
          if (result.rows.length === 0) return setError(`La serie ${serie} no existe`)

          // * Si la serie existe, revisamos si el número de área existe
          ExecuteQuery(
            db,
            `SELECT * FROM 'AREAS' WHERE NUM_AREA = "${numArea + digitVerifArea}"`,
            [],
            (result) => {
              const areas = result.rows._array;
              const area = areas[0];

              if (!area) {
                refs.area.current.focus();
                return setError(`El área ${numArea}-${digitVerifArea} no existe`);
              }

              if (digitVerifArea.toString() !== digitVerif.toString()) {
                refs.area.current.focus();
                return setError(`El dígito verificador ${digitVerifArea} es incorrecto`);
              }

              setSerie(serie);
              setCdInfo({
                ...cdInfo,
                area: area.NUM_AREA
              });

              saveCombination({
                ...cdInfo,
                area: area.NUM_AREA,
              });
            },
            (error) => {
              console.log(error);
              return setSnackbar({
                visible: true,
                text: "Error al ingresar el área",
                type: "error",
              });
            }
          );
        }, (error) => {
          console.log(error);
          return setError(`La serie ${serie} no existe`)
        }
      );

      return console.log("Area");
    } catch (error) {
      console.log(error);
      setSnackbar({
        visible: true,
        text: "Error al ingresar el área",
        type: "error",
      });
    }
  };

  const confirmPallet = async () => {
    try {
      if (cdInfo.pallet === "") {
        setError("Ingrese un pallet");
        refs.pallet.current.focus();
        return;
      }

      // * Hacer la consulta a la base de datos para ver si el pallet existe
      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM PALLETS WHERE POSICION = ?",
        [cdInfo.pallet],
        (results) => {
          if (results.rows._array.length === 0) {
            setError("El pallet no existe");
            refs.pallet.current.focus();
            return;
          }

          if (results.rows._array.length > 0) {
            setError(false);
            if (config.index_capt == 4) return refs.caja.current.focus();
            if (config.index_capt == 5) return refs.area.current.focus();
          }
        },
        (error) => {
          console.log(error);
          setSnackbar({
            visible: true,
            text: "Error al ingresar el pallet",
            type: "error",
          });
        }
      );
    } catch (error) {
      console.log(error);
      setSnackbar({
        visible: true,
        text: "Error al ingresar el pallet",
        type: "error",
      });
    }
  };

  const confirmCaja = async () => {
    try {
      if (cdInfo.caja === "") {
        setError("Ingrese una caja");
        refs.caja.current.focus();
        return;
      }

      // * Hacer la consulta a la base de datos para ver si la caja existe
      const db = SQLite.openDatabase("Maestro.db");

      ExecuteQuery(
        db,
        "SELECT * FROM CAJAS WHERE CAJAS = ?",
        [cdInfo.caja],
        (results) => {
          if (results.rows._array.length === 0) {
            setError("La caja no existe");
            refs.caja.current.focus();
            return;
          }

          return saveCombination();
        },
        (error) => {
          console.log(error);
          setSnackbar({
            visible: true,
            text: "Error al ingresar la caja",
            type: "error",
          });
        }
      );
    } catch (error) {
      console.log(error);
      setSnackbar({
        visible: true,
        text: "Error al ingresar la caja",
        type: "error",
      });
    }
  };

  const confirmCloseComb = async () => {
    const posicion = cdInfo.posicion || "";
    const area = cdInfo.area || "";
    const pallet = cdInfo.pallet || "";
    const caja = cdInfo.caja || "";

    setDangerModal({
      visible: true,
      title: "Cerrar área",
      text: "¿Está seguro que desea cerrar el área?",
      buttons: [
        {
          text: "Cancelar",
          onPress: () => {
            setDangerModal({
              visible: false,
              title: "",
              text: "",
              buttons: [],
            });
          },
          style: "cancel",
        },
        {
          text: "Cerrar",
          onPress: async () => {
            setDangerModal({
              visible: false,
              title: "",
              text: "",
              buttons: [],
            });
            const db = SQLite.openDatabase("Maestro.db");

            ExecuteQuery(
              db,
              "SELECT * FROM INVENTARIO_APP WHERE area = ? AND pallet = ? AND caja = ? AND posicion = ?",
              [area, pallet, caja, posicion],
              (results) => {
                if (results.rows._array.length === 0) {
                  setSnackbar({
                    visible: true,
                    text: "La combinación está vacía, no se cerrará",
                    type: "error",
                  });
                  return;
                }

                if (results.rows._array.length > 0) {
                  ExecuteQuery(
                    db,
                    `UPDATE COMBINACIONES_CD SET status = "CERRADA" WHERE posicion = "${posicion}" AND area = "${area}" AND pallet = "${pallet}" AND caja = "${caja}"`,
                    [],
                    (result) => {
                      if (result.rowsAffected > 0) {
                        setSnackbar({
                          visible: true,
                          text: "Combinación cerrada correctamente",
                          type: "success",
                        });

                        setDangerModal({
                          visible: true,
                          title: "Cargar y Respaldo",
                          text: "¿Desea Enviar datos al servidor de inmediato?",
                          bg: "#28a745",
                          buttons: [
                            {
                              text: "NO",
                              onPress: () => {
                                setDangerModal({
                                  visible: false,
                                  title: "",
                                  text: "",
                                  buttons: [],
                                });
                                activeEdit();
                              },
                              style: "cancel",
                            },
                            {
                              text: "Si",
                              onPress: async () => {
                                await sendComb({
                                  posicion,
                                  area,
                                  pallet,
                                  caja
                                })
                                setDangerModal({
                                  visible: false,
                                  title: "",
                                  text: "",
                                  buttons: [],
                                });
                                // sendArea(areaData, navigate(routes.cD));
                              },
                            },
                          ],
                        });
                      }

                      if (result.rowsAffected === 0) {
                        setSnackbar({
                          visible: true,
                          text: "Error al cerrar la combinación",
                          type: "error",
                        });
                      }
                    },
                    (error) => {
                      console.log(error);
                      setSnackbar({
                        visible: true,
                        text: "Error al cerrar el área",
                        type: "error",
                      });
                    }
                  );

                  activeEdit();
                }
              },
              (error) => {
                console.log(error);
                setSnackbar({
                  visible: true,
                  text: "Error al cerrar el área",
                  type: "error",
                });
              }
            );
          },
        },
      ],
    });
  };

  const optionsRadio = useMemo(
    () => [
      {
        id: 1,
        label: "Ingreso 1 a 1",
        value: "single",
      },
      {
        id: 2,
        label: "Ingreso por cantidad",
        value: "multiple",
      },
      {
        id: 3,
        label: "Ambos",
        value: "both",
        default: true,
      },
    ],
    []
  );

  useEffect(() => {
    console.log('clear', clear);
    if (clear) {
      setCdInfo({});
      setModal(true);
    }

    if (fastSend) {
      confirmCloseComb();
    }

    if (fastEdit) {
      activeEdit();
    }
  }, [clear, fastSend, fastSend]);

  useEffect(() => {
    switch (config.index_capt) {
      case 2:
        if (!cdInfo.posicion) setModal(true);
        break;
      case 3:
        if (!cdInfo.posicion || !cdInfo.area) setModal(true);
        break;
      case 4:
        if (!cdInfo.posicion || !cdInfo.pallet || !cdInfo.caja) setModal(true);
        break;
      case 5:
        if (!cdInfo.posicion || !cdInfo.pallet || !cdInfo.area) setModal(true);
        break;
      case 6:
        if (!cdInfo.posicion || !cdInfo.caja) setModal(true);
      default:
        break;
    }

    if (modal) refs.posicion.current.focus();

    if (edit && modal) {
      switch (config.index_capt) {
        case 2:
          setCdInfo({});
          refs.posicion.current.focus();
          break;
        case 3:
          setCdInfo({
            posicion: "",
            area: "",
          });
          setDisabled({
            ...disabled,
            posicion: true,
          });
          refs.posicion.current.focus();
          break;
        case 4:
          setCdInfo({
            posicion: "",
            pallet: "",
            caja: "",
          });
          setDisabled({
            pallet: true,
            posicion: true,
          });
          refs.posicion.current.focus();
          break;
        case 5:
          setCdInfo({
            posicion: "",
            pallet: "",
            area: "",
          })
          setDisabled({
            pallet: true,
            posicion: true,
          });
          refs.posicion.current.focus();
          break;
        case 6:
          setCdInfo({
            posicion: "",
            caja: "",
          });
          setDisabled({
            ...disabled,
            posicion: true,
          });
          refs.posicion.current.focus();
          break;
        default:
          break;
      }
    }
  }, [modal]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar />
        <SectionBar section={"Menu Captura - CD"} backTo={routes.login} />
        <View
          style={{
            ...styles.container,
            marginTop: 0,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                activeEdit();
              }}
              style={{
                ...styles.logBtn,
                width: '40%',
                padding: 5,
                margin: 5,
                borderRadius: 5,
              }}
            >
              <Text style={{
                color: "#fff",
                textAlign: 'center'
              }}>CAMBIAR DATOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => confirmCloseComb()}
              style={{
                ...styles.logBtn,
                width: '40%',
                padding: 5,
                margin: 5,
                borderRadius: 5,
                backgroundColor: "#dc3545",
              }}
            >
              <Text style={{
                color: "#fff",
                textAlign: 'center'
              }}>CERRAR DATOS</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "95%",
              marginTop: 10,
            }}
          >
            <Text
              style={[styles.subtitle, { fontSize: 16, fontWeight: "normal", textAlign: 'center' }]}
            >
              Posición: {cdInfo.posicion ? cdInfo.posicion : "..."}
            </Text>

            {config.index_capt == 3 || config.index_capt == 5 ? <Text
              style={[styles.subtitle, { fontSize: 16, fontWeight: "normal", textAlign: 'center' }]}
            >
              Area: {cdInfo.area ? 
              `${cdInfo.area.slice(0, cdInfo.area.length - 1)}-${cdInfo.area.slice(cdInfo.area.length - 1, cdInfo.area.length)}`
              : "..."}
            </Text> : null}
            
            {config.index_capt == 4 || config.index_capt == 5 ? <Text
              style={[styles.subtitle, { fontSize: 16, fontWeight: "normal", textAlign: 'center' }]}
            >
              Pallet: {cdInfo.pallet ? cdInfo.pallet : "..."}
            </Text> : null}

            {config.index_capt == 4 || config.index_capt == 6 ? <Text
              style={[styles.subtitle, { fontSize: 16, fontWeight: "normal", textAlign: 'center' }]}
            >
              Caja: {cdInfo.caja ? cdInfo.caja : "..."}
            </Text> : null}
          </View>
        </View>

        <View style={styles.container}>
          {selectedId === 1 || selectedId === 3 ? (
            <TouchableOpacity
              style={[styles.primaryBtn, {
                width: '90%',
                borderRadius: 10
              }]}
              onPress={() => {
                config.congelados ? navigate(routes.cdSingleFreezedEntry) : navigate(routes.cdSingleProductEntry)
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO 1 A 1</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {selectedId === 2 || selectedId === 3 ? (
            <TouchableOpacity
              style={[styles.primaryBtn, {
                width: '90%',
                borderRadius: 10
              }]}
              onPress={() => {
                config.congelados ? navigate(routes.cdMultipleFreezedEntry) : navigate(routes.cdMultipleProductEntry)
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, {
              width: '90%',
              borderRadius: 10
            }]}
            onPress={() => navigate(routes.cDWifiSend)}
          >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.white}>ENVIAR CONTEO WIFI</Text>
            </View>
          </TouchableOpacity>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 0,
              marginTop: 0,
              padding: 0,
            }}
          >
            <Text>No Catalogados</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => {
                if (!user.admin) {
                  setAuthType("catalog_products");
                  setModalSupervisor(true);
                } else {
                  setConfig({
                    ...config,
                    catalog_products: !config.catalog_products,
                  });
                }
              }}
              value={config.catalog_products}
            />

            <Text>Pesables</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => {
                if (!user.admin) {
                  setAuthType("pesables");
                  setModalSupervisor(true);
                } else {
                  setConfig({
                    ...config,
                    pesables: !config.pesables,
                  });
                }
              }}
              value={config.pesables}

            />

            <Text>Congelados</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => {
                if (!user.admin) {
                  setAuthType("congelados");
                  setModalSupervisor(true);
                } else {
                  setConfig({
                    ...config,
                    congelados: !config.congelados,
                  });
                }
              }}
              value={config.congelados}
            />
          </View>

          <RadioGroup
            radioButtons={optionsRadio}
            onPress={(value) => {
              if (!user.admin) {
                setAuthType("buttons");
                setIdDesired(value);
                setModalSupervisor(true);
              } else {
                setSelectedId(value);
                setConfig({ ...config, buttons_config: value });
              }
            }}
            selectedId={selectedId}
            containerStyle={{ alignItems: "baseline" }}
          />
        </View>
      </ScrollView>

      {modal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text
              style={{
                fontSize: 16,
              }}
            >
              {edit ? 'Cambiar datos' : 'Ingresar datos'}
            </Text>

            {error && <Text style={{ color: 'red' }}>{error}</Text>}

            <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left', width: '100%', marginLeft: 45 }}>Posición</Text>
            {edit ? config.index_capt == 2 ? <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setCdInfo({
                  ...cdInfo,
                  posicion: text,
                });
              }}
              value={cdInfo.posicion}
              ref={refs.posicion}
              placeholder="Posición"
              onSubmitEditing={() => confirmPosicion(() => {
                setError(false)
                console.log(config.index_capt);
                if (config.index_capt == 2) return saveCombination();
                if (config.index_capt == 3 || config.index_capt == 5) return refs.area.current.focus();
                if (config.index_capt == 4 || config.index_capt == 6) return refs.caja.current.focus();
              })}
              autoFocus
            /> : <View style={{ height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity className="btn" style={{
                backgroundColor: '#2E97A7',
                width: 30,
                height: 30,
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5
              }} onPress={() => {
                setCdInfo({
                  ...cdInfo,
                  posicion: "",
                });
                setDisabled({
                  ...disabled,
                  posicion: true,
                })
                refs.posicion.current.focus();
              }}>
                <Text>B</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setCdInfo({
                    ...cdInfo,
                    posicion: text,
                  });
                }}
                value={cdInfo.posicion}
                ref={refs.posicion}
                placeholder="Posición"
                onSubmitEditing={() => confirmPosicion(() => {
                  console.log(config.index_capt);
                  if (config.index_capt == 2) return saveCombination();
                  if (config.index_capt == 3) return refs.area.current.focus();
                  if (config.index_capt == 4) return refs.pallet.current.focus();
                  if (config.index_capt == 5) return refs.pallet.current.focus();
                  if (config.index_capt == 6) return refs.caja.current.focus();
                })}
                editable={disabled.posicion ? true : false}
                maxLength={parseInt(config.largo_tag) + 4}
              />
            </View> : <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setCdInfo({
                  ...cdInfo,
                  posicion: text,
                });
              }}
              value={cdInfo.posicion}
              ref={refs.posicion}
              placeholder="Posición"
              onSubmitEditing={() => confirmPosicion(() => {
                setError(false)
                console.log(config.index_capt);
                if (config.index_capt == 2) return saveCombination();
                if (config.index_capt == 3) return refs.area.current.focus();
                if (config.index_capt == 4) return refs.pallet.current.focus();
                if (config.index_capt == 5) return refs.pallet.current.focus();
                if (config.index_capt == 6) return refs.caja.current.focus();
              })}
              autoFocus
            />}

            {(config.index_capt == 4 || config.index_capt == 5) && <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left', width: '100%', marginLeft: 45 }}>Pallet</Text>} 
            {(config.index_capt == 4 || config.index_capt == 5) && <>
              {edit ? <View style={{ height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity className="btn" style={{
                  backgroundColor: '#2E97A7',
                  width: 30,
                  height: 30,
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5
                }} onPress={() => {
                  setCdInfo({
                    ...cdInfo,
                    pallet: "",
                  });
                  setDisabled({
                    ...disabled,
                    pallet: true,
                  })
                  refs.pallet.current.focus();
                }}>
                  <Text>B</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  onChangeText={(text) => {
                    setCdInfo({
                      ...cdInfo,
                      pallet: text,
                    });
                  }}
                  value={cdInfo.pallet}
                  placeholder="Pallet"
                  ref={refs.pallet}
                  onSubmitEditing={() => confirmPallet()}
                />
              </View> : <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setCdInfo({
                    ...cdInfo,
                    pallet: text,
                  });
                }}
                value={cdInfo.pallet}
                placeholder="Pallet"
                ref={refs.pallet}
                onSubmitEditing={() => confirmPallet()}
              />}
            </>}

            {(config.index_capt == 3 || config.index_capt == 5) && <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left', width: '100%', marginLeft: 45 }}>Área</Text>}
            {config.index_capt == 3 || config.index_capt == 5 ? <>
              <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setCdInfo({
                    ...cdInfo,
                    area: text,
                  });
                }}
                value={cdInfo.area}
                placeholder="Área"
                maxLength={parseInt(config.largo_tag) + 4}
                ref={refs.area}
                onSubmitEditing={() => confirmArea()}
              />
            </> : null}

            {(config.index_capt == 4 || config.index_capt == 6) && <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'left', width: '100%', marginLeft: 45 }}>Caja</Text>}
            {config.index_capt == 6 || config.index_capt == 4 ? (
              <TextInput
                style={styles.input}
                onChangeText={(text) => {
                  setCdInfo({
                    ...cdInfo,
                    caja: text,
                  });
                }}
                value={cdInfo.caja}
                placeholder="Caja"
                ref={refs.caja}
                onSubmitEditing={() => confirmCaja()}
              />
            ) : null}

            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >

              <TouchableOpacity
                onPress={() => {
                  setCdInfo({});
                  navigate(routes.cDWifiSend)
                }}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                  backgroundColor: "#2E97A7",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>ENVIO WIFI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCdInfo({});
                  navigate(routes.login);
                }}
                style={{
                  ...styles.logBtn,
                  width: "40%",
                  backgroundColor: "#dc3545",
                }}
              >
                <Text style={[styles.white, styles.textCenter]}>SALIR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <SupervisorApprobalModal
        setModalVisible={setModalSupervisor}
        modalVisible={modalSupervisor}
        setSnackbar={setSnackbar}
        user={user}
        idDesired={idDesired}
        setSelectedId={setSelectedId}
        setConfig={setConfig}
        config={config}
        authType={authType}
        setAuthType={setAuthType}
        key={authType}
        newValue={idDesired}
      />
    </KeyboardAvoidingView>
  );
};

export default CaptureMenu;
