import * as SQLite from 'expo-sqlite';
import ExecuteQuery from './ExecuteQuery';

async function InitLocalDB() {
  const db = SQLite.openDatabase('AppData.db');
  await db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS CDProducts (id INTEGER PRIMARY KEY AUTOINCREMENT, operator TEXT, name TEXT, quantity INT, date TEXT, posicion TEXT, area TEXT, pallet TEXT, caja TEXT);'
    );
  });
        
  await ExecuteQuery(db, 'SELECT * FROM CDProducts', [], (results) => {
    console.log('CDProducts AppData: ', results);
  });

  console.log('Local DB lista!');
}

export default InitLocalDB;