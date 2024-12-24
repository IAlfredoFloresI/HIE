const authService = require('./authService');
const { revokeToken } = require('./tokenRepository');
const bcrypt = require('bcrypt');
const { sendPasswordChangeConfirmation } = require('../../helpers/emailSender');

/**
 * Controlador para iniciar sesión.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Llama al servicio para autenticar al usuario y obtener el token
        const { token, forcePasswordReset } = await authService.login(email, password);

        // Responde con el token y el estado de `force_password_reset`
        res.status(200).json({ token, forcePasswordReset });
    } catch (error) {
        res.status(401).json({ message: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }
};

/**
 * Controlador para actualizar la contraseña del empleado.
 */
const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        // Validar que la nueva contraseña cumpla con los requisitos mínimos
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        }

        // Recuperar el empleado actual para comparar la contraseña
        const employee = await employeeRepository.getEmployeeById(req.user.id);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        // Validar que la nueva contraseña no sea igual a la anterior
        const isSamePassword = await bcrypt.compare(newPassword, employee.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior.' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y desactivar `force_password_reset`
        const result = await employeeRepository.updatePassword(req.user.id, hashedPassword);

        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        // Enviar correo de confirmación
        await sendPasswordChangeConfirmation(employee.email, employee.employeeName);

        res.status(200).json({ message: 'Contraseña actualizada correctamente y correo de confirmación enviado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña: ' + error.message });
    }
};

/**
 * Controlador para solicitar recuperación de contraseña.
 */
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Servicio que maneja la lógica de generación de token y envío de correo
        await authService.requestPasswordReset(email);

        res.status(200).json({ message: 'Se ha enviado un enlace de recuperación al correo electrónico.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar recuperación de contraseña: ' + error.message });
    }
};

/**
 * Controlador para restablecer la contraseña.
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Servicio que valida el token y restablece la contraseña
        await authService.resetPassword(token, newPassword);

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        res.status(400).json({ message: 'Error al restablecer la contraseña: ' + error.message });
    }
};

/**
 * Cerrar sesión y revocar el token del usuario.
 */
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'No se proporcionó un token válido.' });
        }

        const token = authHeader.split(' ')[1]; // Extraer el token del encabezado

        // Revocar el token
        await revokeToken(token);

        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión: ' + error.message });
    }
};


module.exports = { login, updatePassword, requestPasswordReset, resetPassword, logout };
