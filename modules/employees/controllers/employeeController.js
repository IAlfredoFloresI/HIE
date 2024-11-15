const employeeService = require('../services/employeeService');

// Obtener empleados con paginación y filtros
const getEmployeesWithPaginationAndFilters = async (req, res) => {
    try {
        const { page, limit, status, department, searchTerm } = req.query;

        const employees = await employeeService.getEmployeesWithPaginationAndFilters({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            department,
            searchTerm,
        });

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener empleados: ${error.message}` });
    }
};

// Crear empleado
const createEmployee = async (req, res) => {
    try {
        const newEmployee = await employeeService.addEmployee(req.body);

        res.status(201).json({
            success: true,
            message: newEmployee.message,
            id_employee: newEmployee.id_employee,
        });
    } catch (error) {
        res.status(400).json({ message: `Error al crear empleado: ${error.message}` });
    }
};

// Obtener detalles de un empleado por ID
const getEmployeeById = async (req, res) => {
    try {
        const { id_employee } = req.params;
        const employee = await employeeService.getEmployeeById(id_employee);

        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener los detalles del empleado: ${error.message}` });
    }
};

// Actualizar un empleado
const updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await employeeService.updateEmployee(req.params.id_employee, req.body);

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: `Error al actualizar empleado: ${error.message}` });
    }
};

// Eliminar un empleado (cambiar su estado a baja)
const deleteEmployee = async (req, res) => {
    try {
        const result = await employeeService.deleteEmployee(req.params.id_employee);

        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: `Error al eliminar empleado: ${error.message}` });
    }
};

// Obtener perfil del empleado basado en su ID en el token JWT
const getProfile = async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(req.user.id);

        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener el perfil: ${error.message}` });
    }
};

module.exports = {
    getEmployeesWithPaginationAndFilters,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getProfile,
};
