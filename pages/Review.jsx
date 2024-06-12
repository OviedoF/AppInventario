import { View, Text, Alert } from "react-native";
import React, { useContext, useState, useEffect, useRef } from "react";
import TopBar from "../components/TopBar";
import SectionBar from "../components/SectionBar";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { dataContext } from "../context/dataContext";
import routes from "../router/routes";
import { useNavigate, useParams } from "react-router-native";
import { TouchableOpacity } from "react-native";
import styles from "../styles/styles";
import * as SQLite from "expo-sqlite";
import ExecuteQuery from "../helpers/ExecuteQuery";
import EditEntryModal from "../components/EditEntryModal";

const CDReview = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [modalEdit, setEditModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState(null);
  const { area } = useContext(dataContext);
  const { type } = useParams();
  const { setSnackbar, config, setDangerModal } = useContext(dataContext);
  const navigate = useNavigate();

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
      setDangerModal({
        visible: true,
        title: "Limpiar área actual",
        text: `¿Estás seguro de que deseas limpiar el área ${area}?`,
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
                "DELETE FROM INVENTARIO_APP WHERE area = ?",
                [area],
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
                  ? config.congelados ? routes.singleFreezedEntry : routes.singleProductEntry
                  : config.congelados ? routes.multipleFreezedEntry : routes.multipleProductEntry
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
    ExecuteQuery(
      db,
      "SELECT * FROM AREAS WHERE NUM_AREA = ?",
      [area],
      (res) => {
        if (!res.rows._array[0]) return setSnackbar({
          visible: true,
          text: "El área no existe",
          type: "error",
        });

        const query = `SELECT * FROM INVENTARIO_APP WHERE invtype = "INV" AND area = "${area}" AND CorrelativoApertura = "${res.rows._array[0]["ESTADOTAG"]}" ORDER BY id DESC`;
        console.log('area:', res.rows._array[0])
        ExecuteQuery(
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
      },
      (err) => {
        console.log(err)
      }
    )
  };

  useEffect(() => {
    getCDProducts();
  }, []);

  return (
    <KeyboardAvoidingView>
      <ScrollView>
        <TopBar />
        <SectionBar
          section={`Revisión`}
          backTo={
            type === "single"
              ? config.congelados ? routes.singleFreezedEntry : routes.singleProductEntry
              : config.congelados ? routes.multipleFreezedEntry : routes.multipleProductEntry
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
              deleteEntryFromInventario(selectedId, parseInt(products.find(item => item.id === selectedId).CorrPT));
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
              Limpiar área actual
            </Text>
          </TouchableOpacity>
        </View>

        {products && products.length === 0 && (
          <Text style={{ textAlign: "center" }}>
            No hay productos en este área
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
                {(id - products.length) * -1}
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
