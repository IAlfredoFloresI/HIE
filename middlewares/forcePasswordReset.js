// **middlewares/forcePasswordReset.js**
const employeeRepository = require('../modules/employees/repositories/employeeRepository');

/**
 * Middleware para forzar el cambio de contraseña si el campo `force_password_reset` está activado.
 */
const forcePasswordReset = async (req, res, next) => {
    try {
        const employee = await employeeRepository.getEmployeeById(req.user.id);

        if (employee && employee.force_password_reset) {
            return res.status(403).json({
                message: 'Debes cambiar tu contraseña antes de acceder a otras funciones.',
            });
        }

        next(); // Permitir acceso si no requiere cambio de contraseña
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar el estado de la contraseña: ' + error.message });
    }
};

module.exports = forcePasswordReset;