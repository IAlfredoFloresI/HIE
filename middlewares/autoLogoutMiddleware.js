// autoLogoutMiddleware.js
let activeSessions = {};

const autoLogoutMiddleware = (req, res, next) => {
    const userId = req.user.id;

    // Verificar si la sesión está activa
    if (activeSessions[userId]) {
        const lastActivity = activeSessions[userId];
        const now = Date.now();

        // Calcular el tiempo de inactividad
        const idleTime = (now - lastActivity) / 1000; // Convertir a segundos

        if (idleTime > 300) { // 300 segundos = 5 minutos
            delete activeSessions[userId]; // Cerrar sesión automáticamente
            return res.status(401).json({ message: "Sesión cerrada automáticamente por inactividad." });
        }
    }

    // Actualizar la última actividad del usuario
    activeSessions[userId] = Date.now();

    next();
};

module.exports = autoLogoutMiddleware;
