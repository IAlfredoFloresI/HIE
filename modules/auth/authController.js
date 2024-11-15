const authService = require('./authService');
const employeeRepository = require('../employees/repositories/employeeRepository');
const bcrypt = require('bcrypt');

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
        // Devuelve un error de autenticación si las credenciales son incorrectas
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

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la contraseña: ' + error.message });
    }
};

module.exports = { login, updatePassword };
