import ExecuteQuery from "./ExecuteQuery";
import * as SQLite from "expo-sqlite";

const sendArea = () => {
  //* PASO 1: CHEQUEAR AREA
  //* PASO 2: TRAER SCANEOS
  //* PASO 3: ENVIAR DATA
  //* EXTRA: HAY UN BTN DE REENVIAR AREA, EL SISTEMA LO DETECTA AUTOMATICO O SE ENVÍA A UN ENDPOINT DIFERENTE? TENEMOS QUE EVITAR QUE SE CLONE LA INFO
};

const sendAllAreas = () => {
  //* PASO 1: CHEQUEAR AREAS CERRADAS
  //* PASO 2: TRAER ESCANEOS POR AREA
  //* PASO 3: REALIZAR MULTIPLES ENVÍOS A API (DEBERÍAMOS MOSTRAR UN CONTADOR DE AREAS ENVIADAS, POR EJ 1/10 AREAS ENVIADAS)
  //* Y EN CASO DE ERROR GUARDAR EL NOMBRE DEL AREA QUE FALLO PARA MOSTRAR EN MENSAJE DE ERROR
  //* PASO 4: MARCAR EN NUESTRA MAESTRO DB CUALES FUERON LAS AREAS ENVIADAS (LAS QUE DIERON ERROR QUEDARÍAN SIN MARCAR)
};

const checkId = async () => {
  const db = SQLite.openDatabase("Maestro.db");

  try {
    return new Promise((resolve, reject) => {
      ExecuteQuery(
        db,
        "SELECT * FROM CONFIG WHERE ID_CAMPO = ?",
        [8],
        ({ rows }) => {
          const configuracion = rows._array[0];
          if (configuracion) {
            resolve(configuracion.LARGO_CAMPO);
          } else {
            resolve(null);
          }
        },
        (error) => {
          console.log("Error", error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error("Error al ejecutar checkIfExist:", error);
    return null;
  }
};

const createOrUpdateId = async (largoCampo) => {
  const db = SQLite.openDatabase("Maestro.db");
  const _id = 8;
  // Función para verificar si el registro con _id 8 existe en la tabla CONFIG
  const checkIfExist = async () => {
    try {
      return new Promise((resolve, reject) => {
        ExecuteQuery(
          db,
          "SELECT * FROM CONFIG WHERE ID_CAMPO = ?",
          [_id],
          ({ rows }) => {
            const configuracion = rows._array[0];
            if (configuracion) {
              resolve(configuracion.LARGO_CAMPO);
            } else {
              resolve(null);
            }
          },
          (error) => {
            console.log("Error", error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Error al ejecutar checkIfExist:", error);
      return null;
    }
  };

  // Función para crear o actualizar el registro de CONFIG con _id igual a 8
  const createOrUpdate = async () => {
    let existe = await checkIfExist();
    if (existe) {
      // Actualizar el registro si ya existe
      ExecuteQuery(
        db,
        "UPDATE CONFIG SET LARGO_CAMPO = ? WHERE ID_CAMPO = ?",
        [largoCampo.toString(), _id],
        ({ rows }) =>
          console.log(
            "Registro de CONFIG actualizado",
            rows._array[0] && rows._array[0]
          ),
        (error) =>
          console.error("Error al actualizar registro en CONFIG: " + error)
      );
    } else {
      // Crear el registro si no existe
      ExecuteQuery(
        db,
        "INSERT INTO CONFIG ( ID_CAMPO, LARGO_CAMPO) VALUES (?, ?)",
        [_id, largoCampo],
        () => console.log("Registro de CONFIG creado"),
        (error) => console.error("Error al crear registro en CONFIG: " + error)
      );
    }
  };
  await createOrUpdate();
};

export { createOrUpdateId, checkId };

/* FORMATO 
{
    "Datos": {
      "TotalLectura": ...,
      "CodEmpresa": ...,
      "CodInv": ...,
      "CodCapturador": ...,
      "Area": ...,
      "id": ...,
      "token": ...
    },
    "Lecturas": [...]
  } */
