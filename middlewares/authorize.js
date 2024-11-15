const employeeRepository = require('../modules/employees/repositories/employeeRepository');

// Middleware de autorización general
const authorize = (roles) => (req, res, next) => {
    try {
        // Verificar si el usuario está autenticado y si su rol está permitido
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acceso denegado: no tienes los permisos necesarios.' });
        }
        next(); // Continuar si el usuario tiene el rol permitido
    } catch (error) {
        res.status(500).json({ message: 'Error en el middleware de autorización: ' + error.message });
    }
};

// Middleware para proteger la eliminación de Admins por otros Admins
const authorizeDeleteEmployee = () => async (req, res, next) => {
    try {
        const { role } = req.user; // Rol del usuario que realiza la acción
        const employeeIdToDelete = req.params.id_employee; // ID del empleado que se desea eliminar

        // Obtener el empleado a eliminar
        const employeeToDelete = await employeeRepository.getEmployeeById(employeeIdToDelete);

        // Verificar si el empleado a eliminar es un Admin y si la acción es realizada por otro Admin
        if (!employeeToDelete) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        if (employeeToDelete.role === 'Admin' && role === 'Admin') {
            return res.status(403).json({ message: 'No se permite que un Admin elimine a otro Admin.' });
        }

        next(); // Continuar si la acción está permitida
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar la autorización para eliminar: ' + error.message });
    }
};

module.exports = { authorize, authorizeDeleteEmployee };
