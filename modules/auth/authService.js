// auth/authService.js
const bcrypt = require('bcrypt');
const jwtHelper = require('./jwtHelper');
const employeeRepository = require('../employees/repositories/employeeRepository');

// Servicio de autenticación
const login = async (email, password) => {
    const employee = await employeeRepository.getEmployeeByEmail(email);

    if (!employee || !(await bcrypt.compare(password, employee.password))) {
        throw new Error('Credenciales inválidas');
    }
    
    // Generar JWT incluyendo el rol del empleado
    const token = jwtHelper.generateToken({ id: employee.id_employee, role: employee.role });
    return token;
};

module.exports = { login };
