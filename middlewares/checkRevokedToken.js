//Middleware para verificar tokens revocados
const jwt = require('jsonwebtoken');
const { openDatabase } = require('../config/database');

const checkRevokedToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token inválido o no autorizado(R).' });
        }

        const token = authHeader.split(' ')[1];

        // Verificar si el token está revocado 
        const database = await openDatabase();
        const revokedToken = await database.get(
            `SELECT * FROM revoked_tokens WHERE token = ?`,
            [token]
        );
        await database.close();

        if (revokedToken) {
            return res.status(401).json({ message: 'Token inválido o no autorizado(R).' });
        }

        next(); // Si no está revocado, continúa
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el token: ' + error.message });
    }
};

module.exports = checkRevokedToken;
