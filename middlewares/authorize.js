const employeeRepository = require('../modules/employees/repositories/employeeRepository');

// Middleware de autorización general
const authorize = (roles) => (req, res, next) => {
    console.log('Rol del usuario:', req.user?.role); // Debug: Verifica el rol en `req.user`
    
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    next();
};

// Middleware para proteger la eliminación de Admins por otros Admins
const authorizeDeleteEmployee = () => async (req, res, next) => {
    const { role } = req.user; // Rol del usuario que está realizando la acción
    const employeeIdToDelete = req.params.id_employee; // ID del empleado a eliminar

    // Verificar si el empleado a eliminar es un Admin
    const employeeToDelete = await employeeRepository.getEmployeeById(employeeIdToDelete);
    
    if (employeeToDelete?.role === 'Admin' && role === 'Admin') {
        return res.status(403).json({ message: 'No se permite que un Admin elimine a otro Admin.' });
    }

    next();
};

module.exports = { authorize, authorizeDeleteEmployee };
