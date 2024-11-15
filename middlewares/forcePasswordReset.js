// **middlewares/forcePasswordReset.js**
const employeeRepository = require('../modules/employees/repositories/employeeRepository');

/**
 * Middleware para forzar el cambio de contraseña si el campo `force_password_reset` está activado.
 */
const forcePasswordReset = async (req, res, next) => {
    try {
        // Validar la autenticación y la existencia del ID
        if (!req.user?.id) {
            return res.status(401).json({ message: 'No autorizado. Debes iniciar sesión.' });
        }

        // Obtener información del empleado
        const employee = await employeeRepository.getEmployeeById(req.user.id);

        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        // Validar si requiere cambiar contraseña
        if (employee.force_password_reset) {
            return res.status(403).json({
                message: 'Debes cambiar tu contraseña antes de acceder a otras funciones.',
            });
        }

        // Continuar si no requiere cambio de contraseña
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el estado de la contraseña: ' + error.message });
    }
};

module.exports = forcePasswordReset;
