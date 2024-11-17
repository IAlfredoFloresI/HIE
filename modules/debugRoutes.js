const express = require('express');
const path = require('path');
const router = express.Router();

// Endpoint para descargar la base de datos
router.get('/download-db', (req, res) => {
    // Ajusta la ruta según la ubicación del archivo database.db
    const dbPath = path.resolve(__dirname, '../config/database.db');

    console.log('Ruta del archivo de base de datos:', dbPath); // Para diagnóstico

    res.download(dbPath, 'database.db', (err) => {
        if (err) {
            console.error('Error al descargar la base de datos:', err.message);

            if (err.code === 'ENOENT') {
                return res.status(404).send('Archivo de base de datos no encontrado.');
            }
            return res.status(500).send('Error al descargar la base de datos.');
        }
    });
});

module.exports = router;
