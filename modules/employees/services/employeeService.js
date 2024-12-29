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
    const employee = await employeeRepository.getEmployeeById(id_employee);

    if (!employee) {
        return null; // Devuelve null si el empleado no existe
    }

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
            throw new Error("Error de validación: Faltan ligatorios (employeeName, email, department).");
        }

         // Generar una contraseña aleatoria
        const plainPassword = generateRandomPassword();
        const passwordHash = await bcrypt.hash(plainPassword, 10); // Cifrar la contraseña generada

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

        return {
            success: true,
            message: "Empleado creado exitosamente.",
            id_employee: newEmployee.id_employee,
        };
    } catch (error) {
        if (error.message.includes("Error de validación")) {
            return { success: false, error: error.message };
        }
        return { success: false, error: `Error al crear empleado: ${error.message}` };
    }
};

// Actualizar un empleado
const updateEmployee = async (id_employee, employee) => {
    try {
        // Eliminar `status` si está presente, para evitar cambios accidentales
        const { status, ...modifiableFields } = employee;

        const updatedEmployee = await employeeRepository.updateEmployee(id_employee, modifiableFields);
        if (!updatedEmployee) {
            throw new Error('Empleado no encontrado');
        }
        return updatedEmployee;
    } catch (error) {
        throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
};


// Actualizar la contraseña del empleado
const updatePassword = async (id_employee, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y desactivar el flag `force_password_reset`
        const result = await employeeRepository.updatePassword(id_employee, hashedPassword);
        if (!result) {
            throw new Error('Empleado no encontrado');
        }

        return { success: true, message: "Contraseña actualizada correctamente." };
    } catch (error) {
        throw new Error(`Error al actualizar contraseña: ${error.message}`);
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
    updatePassword, // Nueva función añadida
    deleteEmployee,
};
