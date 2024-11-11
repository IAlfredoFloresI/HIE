// middlewares/authenticate.js
const jwt = require('jsonwebtoken');

// Middleware de autenticación
const authenticate = (req, res, next) => {
    // Obtener el token de los encabezados de la solicitud
    const token = req.headers.authorization?.split(' ')[1]; // Verifica si el encabezado Authorization existe y extrae el token después de 'Bearer'

    // Si no hay token en la solicitud, responder con un error de autenticación
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar el token usando la clave secreta (JWT_SECRET) almacenada en variables de entorno
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Si la verificación falla, devolver un error de autenticación
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        // Si el token es válido, almacenamos la información decodificada en `req.user`
        // Esto permite que otros middlewares o controladores accedan a los datos del usuario autenticado
        req.user = decoded;

        // Llamar a `next()` para continuar con el siguiente middleware o controlador
        next();
    });
};

module.exports = authenticate;
