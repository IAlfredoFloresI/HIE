const crypto = require('crypto');

/**
 * Genera una contraseña aleatoria.
 * @param {number} length - Longitud de la contraseña (por defecto: 10).
 * @returns {string} Contraseña generada aleatoriamente.
 */
const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";

    // Generar la contraseña con aleatoriedad criptográficamente segura
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length); // Índice seguro
        password += charset[randomIndex];
    }

    return password;
};

module.exports = generateRandomPassword;
