//? Armar Crud de db local y funcion para exportar a db externa
const crearInventario = (db) => {
  // Insertar un nuevo registro en la tabla INVENTARIO
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO INVENTARIO (PRODUCTOS_CARGADOS, ID_AREA) VALUES (?, ?)",
      [JSON.stringify(productosCargados), idArea],
      () => {
        cargarInventario();
        setProductosCargados([]);
        setIdArea(0);
      },
      (error) => console.error("Error al crear inventario: " + error)
    );
  });
};

const cargarInventario = (db) => {
  // Leer registros de la tabla INVENTARIO
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM INVENTARIO",
      [],
      (_, { rows }) => setInventario(rows._array),
      (error) => console.error("Error al leer el inventario: " + error)
    );
  });
};

const actualizarInventario = (
  db,
  _id,
  nuevosProductosCargados,
  nuevoIdArea
) => {
  // Actualizar un registro en la tabla INVENTARIO
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE INVENTARIO SET PRODUCTOS_CARGADOS = ?, ID_AREA = ? WHERE _id = ?",
      [JSON.stringify(nuevosProductosCargados), nuevoIdArea, _id],
      () => {
        cargarInventario();
      },
      (error) => console.error("Error al actualizar inventario: " + error)
    );
  });
};

export { crearInventario, cargarInventario, actualizarInventario };
