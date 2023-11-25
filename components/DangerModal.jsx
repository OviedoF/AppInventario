import React, { useContext, useEffect } from "react";
import {
    Alert,
    Modal,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { dataContext } from "../context/dataContext";

const DangerModal = () => {
    const { dangerModal, setDangerModal } = useContext(dataContext);

    if(
        dangerModal.visible && dangerModal.buttons.length > 0  
    ) return (
        <>
            <View style={stylesModal.centeredView}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={dangerModal.visible}
                >
                    <View
                        style={[
                            stylesModal.centeredView,
                            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                            width = "100%",
                        ]}
                    >
                        <View style={stylesModal.modalView}>
                            <Text
                                style={[
                                    stylesModal.modalText,
                                    { fontWeight: "bold", fontSize: 25 },
                                ]}
                            >
                                {dangerModal.title ? dangerModal.title : "¡PELIGRO!"}
                            </Text>

                            <Text
                                style={[
                                    stylesModal.modalText,
                                    { fontWeight: "bold", fontSize: 16 },
                                ]}
                            >
                                {dangerModal.text ? dangerModal.text : ""}
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                {dangerModal.buttons.map((button) => (
                                    <TouchableOpacity
                                        key={button.text}
                                        style={[stylesModal.button, stylesModal.buttonSave, {
                                            width: `47%`,
                                            margin: 2,
                                        }]}
                                        onPress={() => {
                                            button.onPress();
                                            setDangerModal({
                                                visible: false,
                                                title: "",
                                                text: "",
                                                buttons: [],
                                            });
                                        }}
                                    >
                                        <Text style={stylesModal.textStyle}>{button.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
};
export default DangerModal;

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
