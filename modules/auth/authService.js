// auth/authService.js
const bcrypt = require('bcrypt');
const jwtHelper = require('./jwtHelper');
const employeeRepository = require('../employees/repositories/employeeRepository');

// Servicio de autenticación
const login = async (email, password) => {
    const employee = await employeeRepository.getEmployeeByEmail(email);

    if (!employee) {
        throw new Error('Credenciales inválidas: correo no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
        throw new Error('Credenciales inválidas: contraseña incorrecta');
    }

    // Generar JWT con el ID, email y rol del empleado
    const token = jwtHelper.generateToken({
        id: employee.id_employee,
        email: employee.email,
        role: employee.role,
    });

    // Retornar el token y el estado de `force_password_reset`
    return { token, forcePasswordReset: employee.force_password_reset };
};

module.exports = { login };