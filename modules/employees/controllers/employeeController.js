const employeeService = require('../services/employeeService');

// Obtener todos los empleados
const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener empleados: ' + error.message });
    }
};

// Crear un nuevo empleado
const createEmployee = async (req, res) => {
    try {
        const newEmployee = await employeeService.addEmployee(req.body);
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear empleado: ' + error.message });
    }
};

// Obtener un empleado por ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(req.params.id_employee);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener empleado: ' + error.message });
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
        res.status(400).json({ message: 'Error al actualizar empleado: ' + error.message });
    }
};

// Eliminar un empleado
const deleteEmployee = async (req, res) => {
    try {
        const result = await employeeService.deleteEmployee(req.params.id_employee);
        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar empleado: ' + error.message });
    }
};

const searchEmployeesByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: 'El parámetro "name" es requerido' });
        }

        const employees = await employeeService.searchByName(name);
        res.status(200).json(employees);
    } catch (error) {
        res.status(404).json({ message: 'Empleado no encontrado: ' + error.message });
    }
};

module.exports = {
    getAllEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    searchEmployeesByName
};
