import * as SQLite from 'expo-sqlite';
import ExecuteQuery from './ExecuteQuery';

async function InitLocalDB() {
  const db = SQLite.openDatabase('AppData.db');
  await db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS CDProducts (id INTEGER PRIMARY KEY AUTOINCREMENT, operator TEXT, name TEXT, quantity INT, date TEXT, posicion TEXT, area TEXT, pallet TEXT, caja TEXT);',
      [],
      () => console.log('Tabla CDProducts creada'),
      (error) => console.error('Error al crear la tabla: ' + error)
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS INVENTARIO (_id INTEGER PRIMARY KEY AUTOINCREMENT, PRODUCTOS_CARGADOS TEXT, ID_AREA INTEGER)",
      [],
      () => console.log("Tabla INVENTARIO creada"),
      (error) => console.error("Error al crear la tabla: " + error)
    );
  });

  await ExecuteQuery(db, 'SELECT * FROM CDProducts', [], (results) => {
    console.log('CDProducts AppData: ', results);
  });

  console.log('Local DB lista!');
}

export default InitLocalDB;