const bcrypt = require('bcrypt');
const jwtHelper = require('./jwtHelper'); // Exactamente como el nombre del archivo

const employeeRepository = require('../employees/repositories/employeeRepository');


// Servicio de autenticación
const login = async (email, password) => {
    const employee = await employeeRepository.getEmployeeByEmail(email);
    
    if (!employee || !(await bcrypt.compare(password, employee.password))) {
        throw new Error('Credenciales inválidas');
    }
    
    // Generar JWT
    const token = jwtHelper.generateToken({ id: employee.id_employee });
    return token;
};

module.exports = { login };
