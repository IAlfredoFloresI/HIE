const db = require('../../config/database'); // Importa la configuración de la base de datos

//const { savePasswordResetToken } = require('./tokenRepository');

/**
 * Guardar un token de restablecimiento de contraseña en la base de datos.
 * @param {number} id_employee - ID del empleado asociado al token.
 * @param {string} hashedToken - Token hasheado.
 * @param {Date} expiration - Fecha y hora de expiración del token.
 */
const savePasswordResetToken = async (id_employee, hashedToken, expiration) => {
    const database = await db.openDatabase();
    await database.run(
        `INSERT INTO password_reset_tokens (id_employee, token, expiration) VALUES (?, ?, ?)`,
        [id_employee, hashedToken, expiration.toISOString()]
    );
    await database.close();
};

/**
 * Obtener un token de restablecimiento de contraseña desde la base de datos.
 * @param {string} token - Token enviado por el usuario.
 * @returns {Object|null} - Datos del token o `null` si no existe.
 */
const getPasswordResetToken = async (token) => {
    const database = await db.openDatabase();
    const tokenData = await database.get(
        `SELECT * FROM password_reset_tokens WHERE token = ?`,
        [token]
    );
    await database.close();
    return tokenData;
};

/**
 * Eliminar un token de restablecimiento de contraseña de la base de datos.
 * @param {string} token - Token a eliminar.
 */
const deletePasswordResetToken = async (token) => {
    const database = await db.openDatabase();
    await database.run(`DELETE FROM password_reset_tokens WHERE token = ?`, [token]);
    await database.close();
};

/**
 * Revocar un token JWT y guardarlo en la lista negra de tokens.
 * @param {string} token - Token a revocar.
 */
const revokeToken = async (token) => {
    const database = await db.openDatabase();
    await database.run(
        `INSERT INTO revoked_tokens (token, revocation_date) VALUES (?, ?)`,
        [token, new Date().toISOString()]
    );
    await database.close();
};

/**
 * Verificar si un token JWT está revocado.
 * @param {string} token - Token a verificar.
 * @returns {boolean} - `true` si el token está revocado, `false` en caso contrario.
 */
const isTokenRevoked = async (token) => {
    const database = await db.openDatabase();
    const revokedToken = await database.get(
        `SELECT * FROM revoked_tokens WHERE token = ?`,
        [token]
    );
    await database.close();
    return !!revokedToken; // Devuelve `true` si se encuentra el token
};

module.exports = {
    savePasswordResetToken,
    getPasswordResetToken,
    deletePasswordResetToken,
    revokeToken,
    isTokenRevoked,
};
