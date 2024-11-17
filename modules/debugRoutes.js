const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/download-db', (req, res) => {
    const dbPath = path.resolve(__dirname, '../../database.db'); // Ajusta la ruta si la base de datos no está en el mismo nivel
    res.download(dbPath, 'database.db', (err) => {
        if (err) {
            console.error('Error al descargar la base de datos:', err.message);
            res.status(500).send('Error al descargar la base de datos');
        }
    });
});

module.exports = router;
