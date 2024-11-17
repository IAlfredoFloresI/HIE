const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' }); // Ajusta el tiempo de expiración si es necesario
};

module.exports = { generateToken };
