const employeeRepository = require('../repositories/employeeRepository');
const removeAccents = require('remove-accents'); // Asegúrate de instalar este paquete

const getEmployeesWithPaginationAndFilters = async (query) => {
    return await employeeRepository.getEmployeesWithPaginationAndFilters(query);
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

// Crear un nuevo empleado con validación de id_employee
const addEmployee = async (employee) => {
    try {
        // Verificar que todos los campos requeridos tengan valores válidos
        if (!employee.id_employee || !employee.employeeName || !employee.email || !employee.department) {
            throw new Error("Error de validación: Faltan campos obligatorios (id_employee, employeeName, email o department).");
        }

        // Verificar si el ID ya existe, incluyendo empleados con status "baja"
        const existingEmployee = await employeeRepository.getEmployeeById(employee.id_employee);
        if (existingEmployee) {
            throw new Error(`Error: El ID de empleado ${employee.id_employee} ya ha sido utilizado y no se puede reutilizar.`);
        }

        // Si no existe, procedemos a agregar el empleado
        await employeeRepository.addEmployee(employee);
        return { success: true, message: "Empleado agregado exitosamente." };

    } catch (error) {
        // Diferenciar el mensaje de error en función del tipo de fallo
        if (error.message.includes("Error de validación")) {
            return { success: false, error: error.message };  // Error de validación
        }
        if (error.message.includes("El ID de empleado")) {
            return { success: false, error: error.message };  // Error por ID duplicado
        }
        // Si es otro error, probablemente es un problema de la base de datos
        return { success: false, error: "Error de base de datos: " + error.message };
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


module.exports = {
    getEmployeesWithPaginationAndFilters,
    addEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
};

