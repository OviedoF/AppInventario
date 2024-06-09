import React, { useContext, useEffect, useRef, useState } from "react";
import {
    Modal,
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import CustomPicker from "./CustomPicker";
import { dataContext } from "../context/dataContext";
import * as FileSystem from "expo-file-system";
import ReplaceWithLoading from "./ReplaceWithLoading";
import Constants from "expo-constants";
const { expoConfig } = Constants;
import AsyncStorage from "@react-native-async-storage/async-storage";
import env from "../env";
import ExecuteQuery from "../helpers/ExecuteQuery";
import * as SQLite from "expo-sqlite";

const SelectDBModal = ({ onEnd }) => {
    const { setSnackbar, setLoading, reset, setConfig, setInventario, config } = useContext(dataContext)
    const [invSeleccionado, setInvSeleccionado] = useState(0)
    const [inventariosDisponibles, setInventariosDisponibles] = useState([]);
    const [ip, setIp] = useState("");
    const [error, setError] = useState(false)

    const getInventarios = async () => {
        try {
            console.log(`http://${ip}/isam_inventoriesv2/api/inventarios_disponibles.php`)

            const response = await fetch(`http://${ip}/isam_inventoriesv2/api/inventarios_disponibles.php`, {
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((response) => response.json());

            if (response.status !== 'ok') {
                setError('No se pudo obtener los inventarios')
                return;
            }

            setError(false)
            setLoading(false)
            return setInventariosDisponibles(response.result);
        } catch (error) {
            console.log(error);
            setError('No se pudo obtener los inventarios')
            setLoading(false)
            setSnackbar({
                visible: true,
                text: "No se pudo conectar con el servidor",
                type: "error",
            });
        }
    };

    const getDB = async () => {
        try {
            const inventario = inventariosDisponibles.find((value) => value.id.toString() === invSeleccionado.toString())

            setLoading(true)

            await fetch(`http://${ip}/isam_inventoriesv2/api/descargar_maestroInv.php`, {
                headers: {
                    "id": invSeleccionado,
                },
            })
                .then((response) => response.blob())
                .then((blob) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result.split(",")[1]; //Obtener la parte de datos de la cadena Data URL
                        FileSystem.writeAsStringAsync(
                            `${FileSystem.documentDirectory}SQLite/Maestro.db`,
                            base64data,
                            { encoding: FileSystem.EncodingType.Base64 }
                        )
                            .then(async () => {
                                const openDb = SQLite.openDatabase(`Maestro.db`);
                                ExecuteQuery(
                                    openDb,
                                    'SELECT * FROM config',
                                    [],
                                    async (res) => {
                                        if (res.rows.length > 0) {
                                            console.log(res.rows)
                                            await AsyncStorage.setItem(env.asyncStorage.invSelected, `${inventario.id}. ${inventario.description}`)
                                            setInventario(`${inventario.id}. ${inventario.description}`)
                                            setConfig({ ...config, inv_activo: inventario.id })
                                            reset()
                                            setSnackbar({
                                                visible: true,
                                                text: "Base de datos descargada",
                                                type: "success",
                                            });
                                            setLoading(false)
                                            onEnd()
                                        } else {
                                            setLoading(false)
                                            setError(`La base "Maestro_${inventario.id}.db" no existe.`)
                                        }
                                    },
                                    (err) => {
                                        setLoading(false)
                                        setError(`La base "Maestro_${inventario.id}.db" no existe.`)
                                    }
                                );
                            })
                            .catch((error) => {
                                console.log(error);
                                setLoading(false)
                                setError('No se pudo descargar la base de datos')
                                setSnackbar({
                                    visible: true,
                                    text: "No se pudo descargar la base de datos",
                                    type: "error",
                                });
                            });
                    };
                    reader.readAsDataURL(blob);

                    const openDb = SQLite.openDatabase(`Maestro.db`);

                    ExecuteQuery(
                        openDb,
                        'DELETE FROM COMBINACIONES_CD',
                        [],
                        (res) => {
                            if (res.rows.length > 0) {
                                console.log(`COMBINACIONES_CD eliminado.`)
                            } else {
                                console.log(`COMBINACIONES_CD.`)
                            }
                        },
                        (err) => {
                            setLoading(false)
                            console.log(`COMBINACIONES_CD.`)
                        }
                    );
                })
                .catch((error) => {
                    console.log(error);
                    setLoading(false)
                    setError(`La base "Maestro_${inventario.id}.db" no existe.`)
                    setSnackbar({
                        visible: true,
                        text: `La base "Maestro_${inventario.id}.db" no existe.`,
                        type: "error",
                    });
                });
        } catch (error) {
            console.log(error);
            setLoading(false)
            setError('La bdd del inventario no existe')
            setSnackbar({
                visible: true,
                text: "No se pudo conectar con el servidor",
                type: "error",
            });
        }
    };

    const getIP = async () => {
        console.log(expoConfig.hostUri.split(":")[0])
        setIp(expoConfig.hostUri.split(":")[0])
    }
    
    useEffect(() => {
        getIP()
    }, [])

    return (
        <View style={stylesModal.centeredView}>
            <Modal
                animationType="fade"
                transparent={true}
            >
                <View
                    style={[
                        stylesModal.centeredView,
                        { backgroundColor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%" }, ,
                    ]}
                >
                    <ReplaceWithLoading>
                        <View style={[
                            stylesModal.modalView,
                            { backgroundColor: "#fefefe" }
                        ]}>
                            <TouchableOpacity
                                style={{ position: "absolute", top: 10, right: 10 }}
                                onPress={() => onEnd()}
                            >
                                <Text style={{ fontSize: 20, fontWeight: "bold" }}>X</Text>
                            </TouchableOpacity>

                            <Text
                                style={[
                                    stylesModal.modalText,
                                    {
                                        fontWeight: "bold", fontSize: 25,
                                        color: "#191919"
                                    },
                                ]}
                            >
                                Elije la base de datos para este dispositivo
                            </Text>

                            {
                                !inventariosDisponibles.length && <>

                                    <Text
                                        style={[
                                            stylesModal.modalText,
                                            {
                                                fontWeight: "bold", fontSize: 16,
                                            },
                                        ]}
                                    >
                                        Por favor, introduce tu ip y puerto para obtener los inventarios.
                                    </Text>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <View style={{ width: "100%" }}>
                                            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>IP</Text>
                                            <TextInput
                                                style={{
                                                    height: 40,
                                                    borderColor: "gray",
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                    paddingLeft: 10,
                                                }}
                                                onChangeText={(text) => setIp(text)}
                                                value={ip}
                                                onEndEditing={() => getInventarios()}
                                                autoFocus
                                            />

                                        </View>
                                    </View>

                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <TouchableOpacity
                                            style={[stylesModal.button, { marginTop: 20 }]}
                                            onPress={() => getInventarios()}
                                        >
                                            <Text style={stylesModal.textStyle}>Aceptar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            }

                            {
                                inventariosDisponibles.length > 0 && <>
                                    <CustomPicker options={inventariosDisponibles.map((value) => {
                                        return { label: `${value.id}. ${value.description}`, value: value.id };
                                    })} placeHolder={
                                        invSeleccionado ? `Inventario ${invSeleccionado}` : "Selecciona un inventario"
                                    } onValueChange={
                                        (value) => setInvSeleccionado(value)
                                    } />

                                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                                        <TouchableOpacity
                                            style={[stylesModal.button, { marginTop: 20 }]}
                                            onPress={() => getDB()}
                                        >
                                            <Text style={stylesModal.textStyle}>Aceptar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            }

                            {
                                error && <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>
                            }
                        </View>
                    </ReplaceWithLoading>
                </View>
            </Modal>
        </View>
    );
};
export default SelectDBModal;

const stylesModal = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#ffc107",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "95%",
        height: "95%",
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: 35,
        borderColor: "blue",
        justifyContent: "center",
        backgroundColor: "#4960F9",
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    textStyle: {
        color: "#fefefe",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});
