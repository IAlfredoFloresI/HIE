// auth/authService.js
const bcrypt = require('bcrypt');
const jwtHelper = require('./jwtHelper');
const employeeRepository = require('../employees/repositories/employeeRepository');
const { sendEmail } = require('../../helpers/emailSender');
const crypto = require('crypto');

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

const requestPasswordReset = async (email) => {
    const employee = await employeeRepository.getEmployeeByEmail(email);
    if (!employee) {
        throw new Error('No existe un usuario con ese correo electrónico.');
    }

    // Generar un token único y establecer su expiración
    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar el token en la base de datos
    await employeeRepository.savePasswordResetToken(employee.id_employee, token, expiration);

    // Enviar el enlace al correo electrónico
    const resetLink = `https://atomicum.com/Holliday/Holiday/contraseña_nueva.html?token=${token}`;
    const subject = 'Restablecimiento de contraseña';
    const text = `
Hola ${employee.employeeName},

Has solicitado restablecer tu contraseña. Por favor, usa el siguiente enlace para configurarla nuevamente. Este enlace es válido por 15 minutos:

${resetLink}

Si no solicitaste este cambio, ignora este mensaje.

Gracias,
El equipo de Holiday Inn Express
    `;

    await sendEmail(employee.email, subject, text);
};

const resetPassword = async (token, newPassword) => {
    const tokenData = await employeeRepository.getPasswordResetToken(token);
    if (!tokenData || tokenData.expiration < new Date()) {
        throw new Error('El token es inválido o ha expirado.');
    }

    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 8) {
        throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y eliminar token
    await employeeRepository.updatePassword(tokenData.id_employee, hashedPassword);
    await employeeRepository.deletePasswordResetToken(tokenData.token);

    // Enviar correo de confirmación
    const employee = await employeeRepository.getEmployeeById(tokenData.id_employee);
    const subject = 'Tu contraseña ha sido actualizada';
    const text = `
Hola ${employee.employeeName},

Tu contraseña ha sido actualizada correctamente. Si no realizaste este cambio, por favor contacta a soporte de inmediato.

Gracias,
El equipo de Holiday Inn Express
    `;

    await sendEmail(employee.email, subject, text);
};


module.exports = { login, requestPasswordReset, resetPassword };