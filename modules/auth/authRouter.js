const express = require('express');
const authController = require('./authController');
const authenticate = require('../../middlewares/authenticate'); // Middleware para verificar el token JWT

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints para autenticación
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token de acceso JWT
 *                 forcePasswordReset:
 *                   type: boolean
 *                   description: Indica si el usuario debe cambiar su contraseña
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/update-password:
 *   post:
 *     summary: Actualizar la contraseña del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Error en la validación
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/update-password', authenticate, authController.updatePassword);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "usuario@example.com"
 *     responses:
 *       200:
 *         description: Enlace de restablecimiento enviado al correo.
 *       404:
 *         description: Usuario no encontrado.
 */
router.post('/request-password-reset', authController.requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña usando un token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: "nuevaContraseña123!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       400:
 *         description: Token inválido o contraseña no válida.
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: [] # Requiere autenticación con token
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente.
 *       400:
 *         description: No se proporcionó un token válido.
 *       500:
 *         description: Error del servidor.
 */
router.post('/logout', authenticate, authController.logout); // Usa el middleware authenticate


module.exports = router;
