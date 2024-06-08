import { View, Text, Alert } from "react-native";
import React, { useContext, useState, useEffect, useRef } from "react";
import TopBar from "../../components/TopBar";
import SectionBar from "../../components/SectionBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { dataContext } from "../../context/dataContext";
import routes from "../../router/routes";
import { useNavigate, useParams } from "react-router-native";
import { TouchableOpacity } from "react-native";
import styles from "../../styles/styles";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../../helpers/ExecuteQuery";
import EditEntryModal from "../../components/EditEntryModal";

const CDReview = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalEdit, setEditModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState(null);
  const { type } = useParams();
  const { setSnackbar, config, setDangerModal, cdInfo } = useContext(dataContext);
  const navigate = useNavigate();
  console.log("config", config);

  const deleteEntryFromInventario = async (db_id, corr) => {
    setDangerModal({
      visible: true,
      title: "Eliminar entrada de producto",
      text: `¿Estás seguro de que deseas eliminar la entrada de producto ${parseInt(corr)}?`,
      buttons: [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: async () => {
            const db = SQLite.openDatabase("Maestro.db");
            await ExecuteQuery(
              db,
              "DELETE FROM INVENTARIO_APP WHERE id = ?",
              [db_id],
              (results) => {
                setSnackbar({
                  visible: true,
                  text: "Entrada de producto eliminada correctamente",
                  type: "success",
                });
                getCDProducts();
              },
              (error) => {
                console.log("Error", error);
                setSnackbar({
                  visible: true,
                  text: "Error al eliminar entrada de producto",
                  type: "error",
                });
              }
            );
          },
        },
      ],
    });
  };

  const editEntryFromInventario = async (cant, db_id) => {
    const db = SQLite.openDatabase("Maestro.db");
    await ExecuteQuery(
      db,
      "UPDATE INVENTARIO_APP SET quantity = ? WHERE id = ?",
      [cant, db_id],
      (results) => {
        setSnackbar({
          visible: true,
          text: "Entrada de producto editada correctamente",
          type: "success",
        });
        getCDProducts();
      },
      (error) => {
        console.log("Error", error);
        setSnackbar({
          visible: true,
          text: "Error al editar entrada de producto",
          type: "error",
        });
      }
    );
  };

  const clearActualArea = async () => {
    try {
      const posicion = cdInfo.posicion || "";
      const area = cdInfo.area || "";
      const caja = cdInfo.caja || "";
      const pallet = cdInfo.pallet || "";

      setDangerModal({
        visible: true,
        title: "Limpiar área actual",
        text: `¿Estás seguro de que deseas limpiar el ${
          config.index_capt == 2 ? "posicion" : config.index_capt == 3 || config.index_capt == 5 ? "área" : "caja"
        } ${
          config.index_capt == 2 ? cdInfo.posicion : config.index_capt == 3 || config.index_capt == 5 ? cdInfo.area : cdInfo.caja
        }?`,
        buttons: [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Aceptar",
            onPress: async () => {
              const db = SQLite.openDatabase("Maestro.db");
              let query = `DELETE FROM INVENTARIO_APP WHERE posicion = "${posicion}" AND area = "${area}" AND caja = "${caja}" AND pallet = "${pallet}"`;
              if(config.index_capt == 3 || config.index_capt == 5) query = `DELETE FROM INVENTARIO_APP WHERE area = "${cdInfo.area}"`;
              if(config.index_capt == 4 || config.index_capt == 6) query = `DELETE FROM INVENTARIO_APP WHERE caja = "${cdInfo.caja}"`;

              await ExecuteQuery(
                db,
                query,
                [],
                (results) => {
                  setSnackbar({
                    visible: true,
                    text: "Área actual limpiada correctamente",
                    type: "success",
                  });
                  getCDProducts();
                },
                (error) => {
                  console.log("Error", error);
                  setSnackbar({
                    visible: true,
                    text: "Error al limpiar área actual",
                    type: "error",
                  });
                }
              );

              navigate(
                type === "single"
                  ? routes.cdSingleProductEntry
                  : routes.cdMultipleProductEntry
              );
            },
          },
        ],
      });
    } catch (error) {
      console.log(error)
      return setSnackbar({
        visible: true,
        text: "Error al limpiar área actual",
        type: "error",
      });
    }
  }

  const getCDProducts = async () => {
    const db = SQLite.openDatabase("Maestro.db");
    const posicion = cdInfo.posicion || '';
    const pallet = cdInfo.pallet || '';
    const caja = cdInfo.caja || '';
    const area = cdInfo.area || '';
    let query = `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND posicion = "${posicion}" AND pallet = "${pallet}" AND caja = "${caja}" AND area = "${area}"`;

    await ExecuteQuery(
      db,
      query,
      [],
      (results) => {
        /* console.log("Query completed");
        console.log(results.rows._array); */
        console.log(results.rows._array);
        return setProducts(results.rows._array);
      },
      (error) => {
        console.log("Error");
        console.log(error);
        return false;
      }
    );
  };

  useEffect(() => {
    getCDProducts();
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <TopBar />
        <SectionBar
          section={`Revisión - CD`}
          backTo={
            type === "single"
              ? routes.cdSingleProductEntry
              : routes.cdMultipleProductEntry
          }
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {config.buttons_config !== 1 &&
            <TouchableOpacity
              style={[styles.primaryBtn, { width: "30%", justifyContent: 'center' }]}
              onPress={() => {
                setEditModal(true);
              }}
            >
              <Text style={[styles.white, { textAlign: "center", alignItems: 'center' }]}>
                Modificar
              </Text>
            </TouchableOpacity>
          }

          <TouchableOpacity
            style={[styles.primaryBtn, { width: "30%", justifyContent: 'center' }]}
            onPress={() => {
              deleteEntryFromInventario(selectedId, products.find((item) => item.id === selectedId).CorrPT);
            }}
          >
            <Text style={[styles.white, { textAlign: "center", alignItems: 'center' }]}>
              Eliminar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { width: "30%", justifyContent: 'center' }]}
            onPress={() => {
              clearActualArea();
            }}
          >
            <Text style={[styles.white, { textAlign: "center", alignItems: 'center' }]}>
              Limpiar {config.index_capt == 2 && 'pos'} {(config.index_capt == 3 ||config.index_capt == 5) && 'área'} {(config.index_capt == 4 ||config.index_capt == 6) && 'caja'} actual
            </Text>
          </TouchableOpacity>
        </View>

        {products && products.length === 0 && (
          <Text style={{ textAlign: "center" }}>
            No hay productos en {config.index_capt == 2 && 'esta posición'} {(config.index_capt == 3 ||config.index_capt == 5) && 'este área'} {(config.index_capt == 4 ||config.index_capt == 6) && 'esta caja'}
          </Text>
        )}

        {products &&
          products[0] &&
          products.map((item, id) => (
            <TouchableOpacity
              key={id}
              onPress={() => {
                setSelectedId(item.id ? item.id : null);
                setQuantity(item.quantity);
              }}
              style={[
                {
                  flexDirection: "row",
                  padding: 10,
                  alignItems: "center",
                },
                selectedId === item.id && { backgroundColor: "orange" },
              ]}
            >
              <Text
                style={{ width: "10%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {parseInt(item.CorrPT)}
              </Text>
              <Text
                style={{ width: "55%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.name} - {item.descripcion}
              </Text>
              <Text
                style={{ width: "10%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {item.quantity < 0 ? item.quantity : `+${item.quantity}`}
              </Text>
              <Text
                style={{ width: "25%", fontSize: 12, paddingHorizontal: 5 }}
              >
                {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <EditEntryModal
        editEntryFromInventario={editEntryFromInventario}
        quantity={quantity}
        setQuantity={setQuantity}
        modalVisible={modalEdit}
        setModalVisible={setEditModal}
        selectedId={selectedId}
      />
    </KeyboardAvoidingView>
  );
};

export default CDReview;