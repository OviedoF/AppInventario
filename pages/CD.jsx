import { View, Text, Switch, TextInput, TouchableOpacity, Image } from "react-native";
import { Link, useNavigate } from "react-router-native";
import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import styles from "../styles/styles";
import SectionBar from "../components/SectionBar";
import routes from "../router/routes";
import RadioGroup from "react-native-radio-buttons-group";
import TopBar from "../components/TopBar";
import { dataContext } from "../context/dataContext";
import { ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native";
import edit_icon from "../assets/edit.png";

const CD = () => {
  const navigate = useNavigate();
  const { config, setConfig, cdInfo, setCdInfo, setSnackbar } = useContext(dataContext);
  const [modal, setModal] = useState(false);
  const [selectedId, setSelectedId] = useState(parseInt(config.buttons_config));
  const [dataToShow, setDataToShow] = useState({})

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

  useEffect(() => {
    const keys = Object.keys(dataToShow);
    // * Si todas las llaves están vacías en cdInfo, entonces se abre el modal
    keys.forEach((key) => {
      console.log(cdInfo[key]);
      if (!cdInfo[key]) {
        return setModal(true);
      }
    });
  }, [dataToShow]);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <TopBar text={"ID:"} />
        <SectionBar section={"Menu Captura CD"} backTo={routes.home} />

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

        <View style={styles.container}>
          {selectedId === 1 || selectedId === 3 ? (
            <Link to={routes.cdSingleProductEntry} style={styles.primaryBtn}>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO 1 A 1</Text>
              </View>
            </Link>
          ) : null}

          {selectedId === 2 || selectedId === 3 ? (
            <Link to={routes.cdMultipleProductEntry} style={styles.primaryBtn}>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Text style={styles.white}>INGRESO POR CANTIDAD</Text>
              </View>
            </Link>
          ) : null}

          <Link to={routes.sentWifi} style={styles.primaryBtn}>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text style={styles.white}>ENVIAR CONTEO WIFI</Text>
            </View>
          </Link>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text>No Catalogados</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              onValueChange={() => setConfig({ ...config, catalog_products: !config.catalog_products })}
              value={config.catalog_products}
            />
          </View>

          <RadioGroup
            radioButtons={optionsRadio}
            onPress={(value) => {
              setSelectedId(value);
              setConfig({ ...config, buttons_config: value });
            }}
            selectedId={selectedId}
            containerStyle={{ alignItems: "baseline" }}
          />
        </View>

        {modal && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>

              {dataToShow.posicion && (
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                  <Text style={{ fontSize: 12 }}>Posición</Text>
                  <TextInput
                    style={[styles.input, {width: '60%', height: 30}]}
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
                    style={[styles.input, {width: '60%', height: 30}]}
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
                    style={[styles.input, {width: '60%', height: 30}]}
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
                    style={[styles.input, {width: '60%', height: 30}]}
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
                      console.log(!cdInfo[key]);
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
                    INGRESAR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    navigate(routes.home);
                  }}
                  style={{
                    ...styles.logBtn,
                    width: "40%",
                    backgroundColor: "#ccc",
                  }}
                >
                  <Text style={[styles.white, styles.textCenter]}>VOLVER</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CD;
