const employeeRepository = require('../repositories/employeeRepository');
const bcrypt = require('bcrypt');
const generateRandomPassword = require('../../../helpers/passwordGenerator');
const sendEmail = require('../../../helpers/emailSender');

// Obtener empleados con paginación y filtros
const getEmployeesWithPaginationAndFilters = async (query) => {
    const employees = await employeeRepository.getEmployeesWithPaginationAndFilters(query);

    // Filtrar y devolver solo los campos necesarios para el cliente
    return employees.map(employee => ({
        id_employee: employee.id_employee,
        employeeName: employee.employeeName,
        department: employee.department,
        status: employee.status,
    }));
};

// Obtener un empleado por ID
const getEmployeeById = async (id_employee) => {
    // Llama al repositorio para obtener los detalles del empleado
    const employee = await employeeRepository.getEmployeeById(id_employee);

    if (!employee) {
        return null; // Devuelve null si el empleado no existe
    }

    // Retorna solo los campos necesarios
    return {
        id_employee: employee.id_employee,
        employeeName: employee.employeeName,
        department: employee.department,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        address: employee.address,
        status: employee.status,
    };
};

// Crear un nuevo empleado con validación de datos y generación de contraseña
const addEmployee = async (employee) => {
    try {
        // Validar que los campos obligatorios estén presentes
        if (!employee.employeeName || !employee.email || !employee.department) {
            throw new Error("Error de validación: Faltan campos obligatorios (employeeName, email, department).");
        }

        // Generar una contraseña aleatoria
        const plainPassword = generateRandomPassword();

        // Cifrar la contraseña generada
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        // Asignar valores por defecto para estado y rol
        const newEmployeeData = {
            ...employee,
            password: passwordHash,
            role: 'Employee', // Rol por defecto
            status: 'activo', // Estado por defecto
        };

        // Guardar el nuevo empleado en la base de datos
        const newEmployee = await employeeRepository.addEmployee(newEmployeeData);

        // Enviar la contraseña generada al correo del empleado
        await sendEmail(
            newEmployee.email,
            "Bienvenido a la empresa",
            `Hola ${newEmployee.employeeName}, tu cuenta ha sido creada exitosamente. Tu contraseña inicial es: ${plainPassword}`
        );

        // Retornar éxito
        return {
            success: true,
            message: "Empleado creado exitosamente.",
            id_employee: newEmployee.id_employee, // ID del nuevo empleado
        };
    } catch (error) {
        // Manejo de errores de validación o base de datos
        if (error.message.includes("Error de validación")) {
            return { success: false, error: error.message };
        }
        return { success: false, error: `Error al crear empleado: ${error.message}` };
    }
};

// Actualizar un empleado
const updateEmployee = async (id_employee, employee) => {
    try {
        const updatedEmployee = await employeeRepository.updateEmployee(id_employee, employee);
        if (!updatedEmployee) {
            throw new Error('Empleado no encontrado');
        }
        return updatedEmployee;
    } catch (error) {
        throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
};

// Eliminar un empleado (marcar como "baja")
const deleteEmployee = async (id_employee) => {
    try {
        const result = await employeeRepository.deleteEmployee(id_employee);
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
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
};
