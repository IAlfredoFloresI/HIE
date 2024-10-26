const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Función para abrir la conexión a la base de datos
async function openDatabase() {
    return open({
        filename: './database.db',
        driver: sqlite3.Database
    });
}

// Exportar la función para abrir la base de datos
module.exports = {
    openDatabase
};
