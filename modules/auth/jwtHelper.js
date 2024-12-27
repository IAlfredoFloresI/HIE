const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Ajusta el tiempo de expiración si es necesario
};
//Mandesote que paso?? AUUUUUUuuuuUUUUuu
module.exports = { generateToken };
