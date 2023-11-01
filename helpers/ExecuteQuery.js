// Función para ejecutar una consulta SQL en la base de datos
export default executeQuery = (db, sql, params, successCallback, errorCallback) => {
    db.transaction(
        (tx) => {
            tx.executeSql(
                sql,
                params,
                (tx, result) => {
                    successCallback(result);
                },
                (tx, error) => {
                    errorCallback(error);
                }
            );
        },
        (error) => {
            console.error('Error en la transacción:', error);
        }
    );
};