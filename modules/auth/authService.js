const bcrypt = require('bcrypt');
const jwtHelper = require('./jwtHelper');
const { savePasswordResetToken, getPasswordResetToken, deletePasswordResetToken, revokeToken } = require('./tokenRepository');
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
    const token = crypto.randomBytes(32).toString('hex'); // Token único
    const hashedToken = await bcrypt.hash(token, 10); // Hash del token
    const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar el token en la base de datos usando tokenRepository
    await savePasswordResetToken(employee.id_employee, hashedToken, expiration);

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
    const tokenData = await getPasswordResetToken(token);  // Obtén el token hasheado
    if (!tokenData || tokenData.expiration < new Date()) {
        throw new Error('El token es inválido o ha expirado.');
    }

    // Comparar el token enviado con el hash almacenado
    const isTokenValid = await bcrypt.compare(token, tokenData.token);
    if (!isTokenValid) {
        throw new Error('El token es inválido.');
    }

    // Validar que la nueva contraseña cumpla con los requisitos
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new Error(
            'La nueva contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una letra minúscula y un número.'
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await employeeRepository.updatePassword(tokenData.id_employee, hashedPassword);

    // Eliminar el token de restablecimiento
    await deletePasswordResetToken(tokenData.token);

    // Revocar cualquier token activo asociado al usuario
    const activeToken = jwtHelper.generateToken({ id: tokenData.id_employee }); // Si tienes tokens activos específicos
    await revokeToken(activeToken);

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
