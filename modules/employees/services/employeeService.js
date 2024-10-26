const employeeRepository = require('../repositories/employeeRepository');
const removeAccents = require('remove-accents'); // Asegúrate de instalar este paquete

// Obtener todos los empleados
const getAllEmployees = async () => {
    try {
        return await employeeRepository.getAllEmployees();
    } catch (error) {
        throw new Error(`Error al obtener empleados: ${error.message}`);
    }
};

// Obtener un empleado por ID
const getEmployeeById = async (id) => {
    try {
        const employee = await employeeRepository.getEmployeeById(id);
        if (!employee) {
            throw new Error('Empleado no encontrado');
        }
        return employee;
    } catch (error) {
        throw new Error(`Error al obtener empleado: ${error.message}`);
    }
};

// Crear un nuevo empleado
const addEmployee = async (employee) => {
    try {
        return await employeeRepository.addEmployee(employee);
    } catch (error) {
        throw new Error(`Error al crear empleado: ${error.message}`);
    }
};

// Actualizar un empleado
const updateEmployee = async (id, employee) => {
    try {
        const updatedEmployee = await employeeRepository.updateEmployee(id, employee);
        if (!updatedEmployee) {
            throw new Error('Empleado no encontrado');
        }
        return updatedEmployee;
    } catch (error) {
        throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
};

// Eliminar un empleado
const deleteEmployee = async (id) => {
    try {
        const result = await employeeRepository.deleteEmployee(id);
        if (!result) {
            throw new Error('Empleado no encontrado');
        }
        return result;
    } catch (error) {
        throw new Error(`Error al eliminar empleado: ${error.message}`);
    }
};


// Buscar empleados por nombre desde el repository
const searchByName = async (name) => {
    if (!name) {
        throw new Error('El nombre de búsqueda es obligatorio');
    }

    const employees = await employeeRepository.searchEmployeesByName(name);

    if (employees.length === 0) {
        throw new Error('Empleado no encontrado');
    }

    return employees;
};

module.exports = {
    getAllEmployees,
    addEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    searchByName
};

