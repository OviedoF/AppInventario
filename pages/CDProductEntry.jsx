import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import React, { useContext, useRef, useState, useEffect } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import { StyleSheet, Image } from "react-native";
import ConfirmCloseAreaModal from "../components/ConfirmCloseAreaModal";
import Calculator from "../components/Calculator";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/dataContext";
import { Link } from "react-router-native";
import edit_icon from "../assets/edit_icon.png";

const ProductEntry = ({ type }) => {
    const { cdInfo, setCdInfo, config, setSnackbar, } = useContext(dataContext);
    const [modal, setModal] = useState(false);
    const [calculatorModal, setCalculatorModal] = useState(false);
    const [code, setCode] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [dataToShow, setDataToShow] = useState({})
    const [confirmingClose, setConfirmingClose] = useState(false);

    const refs = {
        posicion: useRef(null),
        pallet: useRef(null),
        caja: useRef(null),
        area: useRef(null),
    };

    const openModal = (ref) => {
        setModal(true);
        setTimeout(() => {
            ref.current.focus();
        }, 100);
    };

    const passToNextInput = (inputName) => {
        const keys = Object.keys(dataToShow);
        const index = keys.findIndex((key) => key === inputName);
        if (!index && (index !== 0)) return setModal(false);

        const nextInput = keys[index + 1];
        if (!nextInput) {
            let missingData = false;

            keys.forEach((key) => {
                if (!cdInfo[key]) {
                    setSnackbar({
                        visible: true,
                        text: `Ingrese ${key}`,
                        type: "error",
                    });
                    missingData = key;
                    return;
                }
            });

            if (missingData) return refs[missingData].current.focus();
            setModal(false);
        };

        if (nextInput) refs[nextInput].current.focus();
    };

    useEffect(() => {
        switch (config.index_capt) {
            case 1:
                setDataToShow({
                    posicion: true,
                })
                break;
            case 2:
                setDataToShow({
                    posicion: true,
                    area: true,
                })
                break;
            case 3:
                setDataToShow({
                    posicion: true,
                    pallet: true,
                    caja: true,
                })
                break;
            case 4:
                setDataToShow({
                    posicion: true,
                    pallet: true,
                    area: true,
                })
                break;
            case 5:
                setDataToShow({
                    posicion: true,
                    caja: true,
                })
                break;
            default:
                break;
        }
    }, [config]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView>
                <TopBar text={"ID:"} />
                <SectionBar
                    section={type === "single" ? "CD - Ingreso 1x1" : "CD - Ingreso por cantidad"}
                    backTo={routes.cD}
                />

                <View
                    style={{
                        ...styles.container,
                        marginTop: 0,
                    }}
                >
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
                                flexWrap: "wrap",
                                justifyContent: "center",
                                width: "80%",
                                marginTop: 10,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12 }}>Posición: {cdInfo.posicion}</Text>

                                <TouchableOpacity onPress={() => openModal(refs.posicion)} style={{ backgroundColor: "transparent", width: 30, padding: 5, margin: 5 }} >
                                    <Image
                                        style={{ width: 12, height: 12, }}
                                        source={edit_icon}
                                    />
                                </TouchableOpacity>
                            </View>

                            {dataToShow.pallet && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text tyle={{ fontSize: 12 }}>Pallet: {cdInfo.pallet}</Text>
                                    <TouchableOpacity onPress={() => openModal(refs.pallet)} style={{ backgroundColor: "transparent", width: 30, padding: 5, margin: 5 }} >
                                        <Image
                                            style={{ width: 12, height: 12, }}
                                            source={edit_icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {dataToShow.caja && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12 }}>Caja: {cdInfo.caja}</Text>
                                    <TouchableOpacity onPress={() => openModal(refs.caja)} style={{ backgroundColor: "transparent", width: 30, padding: 5, margin: 5 }} >
                                        <Image
                                            style={{ width: 12, height: 12, }}
                                            source={edit_icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {dataToShow.area && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12 }}>Área: {cdInfo.area}</Text>
                                    <TouchableOpacity onPress={() => openModal(refs.area)} style={{ backgroundColor: "transparent", width: 30, padding: 5, margin: 5 }} >
                                        <Image
                                            style={{ width: 12, height: 12, }}
                                            source={edit_icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={{ width: "80%", justifyContent: "center" }}>
                        <View style={styles.flex_row}>
                            <TouchableOpacity
                                style={{
                                    ...styles.logBtn,
                                    width: 40,
                                    height: 40,
                                    borderRadius: 5,
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        ...styles.white,
                                        textAlign: "center",
                                        fontWeight: "bold",
                                    }}
                                >
                                    B
                                </Text>
                            </TouchableOpacity>

                            <TextInput
                                keyboardType="numeric"
                                style={{
                                    ...styles.input,
                                    width: "70%",
                                }}
                                onChangeText={setCode}
                                value={code}
                                ref={refs.code}
                                placeholder="Código"
                                onSubmitEditing={() => {
                                    if (type === "single") {
                                        alert("Grabar producto");
                                        refs.code.current.clear();
                                        refs.code.current.focus();
                                    } else {
                                        refs.quantity.current.focus();
                                    }
                                }}
                            />
                        </View>

                        <Text
                            style={{
                                marginTop: 5,
                                marginBottom: 5,
                                textAlign: "center",
                            }}
                        >
                            CIGARRO PREMIER SELECT X 20 UN
                        </Text>

                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            {type === "multi" && (
                                <TouchableOpacity
                                    style={{
                                        ...styles.logBtn,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 5,
                                        alignItems: "center",
                                    }}
                                    onPress={() => {
                                        if (quantity === 1) return;
                                        setQuantity(quantity - 1);
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...styles.white,
                                            textAlign: "center",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        -
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {type === "multi" ? (
                                <TextInput
                                    onChange={(e) => {
                                        setQuantity(parseInt(e.nativeEvent.text));
                                    }}
                                    keyboardType="numeric"
                                    ref={refs.quantity}
                                    style={{
                                        ...styles.input,
                                        fontWeight: "bold",
                                        fontSize: 38,
                                        width: 70,
                                        textAlign: "center",
                                        color: "#000",
                                    }}
                                    onEndEditing={() => setConfirmingClose(true)}
                                >
                                    {quantity}
                                </TextInput>
                            ) : (
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 38,
                                        width: 70,
                                        textAlign: "center",
                                        color: "#000",
                                    }}
                                >
                                    + {quantity}
                                </Text>
                            )}

                            {type === "multi" && (
                                <TouchableOpacity
                                    style={{
                                        ...styles.logBtn,
                                        width: 40,
                                        height: 40,
                                        borderRadius: 5,
                                        alignItems: "center",
                                    }}
                                    onPress={() => {
                                        setQuantity(quantity + 1);
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...styles.white,
                                            textAlign: "center",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        +
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {type === "multi" && (
                                <TouchableOpacity
                                    style={{
                                        ...styles.logBtn,
                                        width: 70,
                                        borderRadius: 5,
                                        alignItems: "center",
                                    }}
                                    onPress={() => {
                                        setCalculatorModal(true);
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...styles.white,
                                            textAlign: "center",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        CALC
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View
                        style={{
                            width: "80%",
                            justifyContent: "center",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "row",
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                ...styles.logBtn,
                                width: "30%",
                                borderRadius: 5,
                            }}
                        >
                            <Link
                                to={type === "single" ? "/review/single" : "/review/multiple"}
                            >
                                <Text
                                    style={{
                                        ...styles.white,
                                        textAlign: "center",
                                        fontWeight: "bold",
                                    }}
                                >
                                    REVISAR
                                </Text>
                            </Link>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                ...styles.logBtn,
                                width: "30%",
                                borderRadius: 5,
                                alignItems: "center",
                            }}
                            onPress={() => setConfirmingClose(true)}
                        >
                            <Text
                                style={{
                                    ...styles.white,
                                    textAlign: "center",
                                    fontWeight: "bold",
                                }}
                            >
                                GRABAR
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                ...styles.logBtn,
                                width: "30%",
                                borderRadius: 5,
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    ...styles.white,
                                    textAlign: "center",
                                    fontWeight: "bold",
                                }}
                            >
                                VOLVER
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: "80%" }}>
                        <Text style={{ fontSize: 16, marginTop: 5 }}>
                            Cantidad Prod Grabados: 2.0
                        </Text>
                        <Text style={{ fontSize: 16, marginTop: 5 }}>
                            Cantidad de Scan Realizados: 2
                        </Text>
                    </View>
                </View>

                <Calculator
                    setModalCalculatorVisible={setCalculatorModal}
                    modalCalculatorVisible={calculatorModal}
                    setQuantity={setQuantity}
                />
            </ScrollView>

            {modal && (
                <View style={styles.modal}>
                    <View style={styles.modalContent}>

                        {dataToShow.posicion && (
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <Text style={{ fontSize: 12 }}>Posición</Text>
                                <TextInput
                                    style={[styles.input, { width: '60%', height: 30 }]}
                                    onChangeText={(text) => setCdInfo({ ...cdInfo, posicion: text })}
                                    value={cdInfo.posicion}
                                    ref={refs.posicion}
                                    placeholder="Posición"
                                    onSubmitEditing={() => passToNextInput('posicion')}
                                />
                            </View>
                        )}

                        {dataToShow.pallet && (
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <Text style={{ fontSize: 12 }}>Pallet</Text>
                                <TextInput
                                    style={[styles.input, { width: '60%', height: 30 }]}
                                    onChangeText={(text) => setCdInfo({ ...cdInfo, pallet: text })}
                                    value={cdInfo.pallet}
                                    placeholder="Pallet"
                                    ref={refs.pallet}
                                    onSubmitEditing={() => passToNextInput('pallet')}
                                />
                            </View>
                        )}

                        {dataToShow.caja && (
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <Text style={{ fontSize: 12 }}>Caja</Text>
                                <TextInput
                                    style={[styles.input, { width: '60%', height: 30 }]}
                                    onChangeText={(text) => setCdInfo({ ...cdInfo, caja: text })}
                                    value={cdInfo.caja}
                                    placeholder="Caja"
                                    ref={refs.caja}
                                    onSubmitEditing={() => passToNextInput('caja')}
                                />
                            </View>
                        )}

                        {dataToShow.area && (
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <Text style={{ fontSize: 12 }}>Área</Text>
                                <TextInput
                                    style={[styles.input, { width: '60%', height: 30 }]}
                                    onChangeText={(text) => setCdInfo({ ...cdInfo, area: text })}
                                    value={cdInfo.area}
                                    placeholder="Área"
                                    ref={refs.area}
                                    onSubmitEditing={() => passToNextInput('area')}
                                />
                            </View>
                        )}

                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    const keys = Object.keys(dataToShow);
                                    let missingData = false;

                                    keys.forEach((key) => {
                                        if (!cdInfo[key]) {
                                            setSnackbar({
                                                visible: true,
                                                text: `Ingrese ${key}`,
                                                type: "error",
                                            });
                                            missingData = key;
                                            return;
                                        }
                                    });

                                    if (missingData) return refs[missingData].current.focus();
                                    setModal(false);
                                }}
                                style={{
                                    ...styles.logBtn,
                                    width: "40%",
                                }}
                            >
                                <Text style={[styles.white, styles.textCenter]}>
                                    GUARDAR
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const stylesLocal = StyleSheet.create({});

export default ProductEntry;  