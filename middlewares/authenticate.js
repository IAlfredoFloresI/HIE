const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación para verificar JWT en solicitudes protegidas.
 */
const authenticate = (req, res, next) => {
    try {
        // Obtener el token del encabezado Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No se proporcionó un token válido' });
        }

        // Extraer el token de Bearer
        const token = authHeader.split(' ')[1];

        // Verificar el token usando la clave secreta
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Si hay un error en la verificación del token
                return res.status(401).json({ message: 'Token inválido o no autorizado' });
            }

             // Validar que el token contiene un ID válido
             if (!decoded.id) {
                return res.status(401).json({ message: 'El token es inválido: falta el ID del usuario.' });
            }
            

            // Si el token es válido, almacenar datos del usuario decodificados en req.user
            req.user = decoded;
            next(); // Continuar al siguiente middleware/controlador
        });
    } catch (error) {
        // Manejo de errores generales
        res.status(500).json({ message: 'Error de autenticación: ' + error.message });
    }
};

module.exports = authenticate;
