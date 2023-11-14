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

const checkId = () => {
  const db = SQLite.openDatabase("Maestro.db");

  ExecuteQuery(
    db,
    "SELECT * FROM CONFIG WHERE _id = ?",
    [8],
    ({ rows }) => {
      const configuracion = rows._array[0];
      if (configuracion) {
        console.log("Registro de CONFIG con _id 8:", configuracion.LARGO_CAMPO);
        return configuracion.LARGO_CAMPO;
      } else {
        return null;
      }
    },
    (error) => {
      console.log("Error", error);
    }
  );
};

const createOrUpdateId = ({ largoCampo }) => {
  const db = SQLite.openDatabase("Maestro.db");
  const _id = 8;
  // Función para verificar si el registro con _id 8 existe en la tabla CONFIG
  const checkIfExist = (callback) => {
    ExecuteQuery(
      db,
      "SELECT * FROM CONFIG WHERE _id = ?",
      [8],
      ({ rows }) => {
        const existe = rows.length > 0;
        callback(existe);
      },
      (error) =>
        console.error("Error al verificar existencia en CONFIG: " + error)
    );
  };

  // Función para crear o actualizar el registro de CONFIG con _id igual a 8
  const createOrUpdate = (largoCampo) => {
    checkIfExist((existe) => {
      if (existe) {
        // Actualizar el registro si ya existe
        ExecuteQuery(
          db,
          "UPDATE CONFIG SET LARGO_CAMPO = ? WHERE ID_CAMPO = ?",
          [largoCampo, _id],
          (res) => console.log("Registro de CONFIG actualizado", res),
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
          (error) =>
            console.error("Error al crear registro en CONFIG: " + error)
        );
      }
    });
  };
  createOrUpdate();
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
