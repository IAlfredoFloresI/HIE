const express = require('express');
const canteenController = require('../controllers/canteenController');
const authenticate = require('../../../middlewares/authenticate');
const { authorize } = require('../../../middlewares/authorize');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Canteen
 *   description: Endpoints para Check-in y Check-out en el comedor
 */

/**
 * @swagger
 * /api/canteen/register:
 *   post:
 *     summary: Registrar Check-in o Check-out en el comedor vía QR
 *     tags: [Canteen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_employee:
 *                 type: integer
 *                 description: ID del empleado escaneado del QR
 *             example:
 *               id_employee: 0
 *     responses:
 *       201:
 *         description: Registro creado exitosamente
 *       400:
 *         description: Error en la validación de los datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ya has hecho tu check-in hoy."
 *       500:
 *         description: Error interno
 */
router.post('/register', canteenController.registerAction);

/**
 * @swagger
 * /api/canteen/records:
 *   get:
 *     summary: Obtener registros de Check-in/Check-out en el comedor con filtros (Admin Only)
 *     tags: [Canteen]
 *     parameters:
 *       - in: query
 *         name: id_employee
 *         schema:
 *           type: integer
 *         description: ID del empleado (opcional)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD) (opcional)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD) (opcional)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Departamento (opcional)
 *     responses:
 *       200:
 *         description: Lista de registros de Check-in/Check-out
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   No. de empleado:
 *                     type: integer
 *                   Empleado:
 *                     type: string
 *                   Departamento:
 *                     type: string
 *                   Hora de entrada:
 *                     type: string
 *                   Hora de salida:
 *                     type: string
 *                   Fecha:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/records', authenticate, authorize(['Admin']), canteenController.getRecords);

/**
 * @swagger
 * /api/canteen/employees-checked-in:
 *   get:
 *     summary: Obtener empleados actualmente en el comedor (Admin Only)
 *     tags: [Canteen]
 *     responses:
 *       200:
 *         description: Lista de empleados obtenida exitosamente
 *       500:
 *         description: Error interno
 */
router.get('/employees-checked-in', authenticate, authorize(['Admin']), canteenController.getEmployeesCheckedIn);

/**
 * @swagger
 * /api/canteen/history/{id_employee}:
 *   get:
 *     summary: Obtener historial de un empleado en el comedor
 *     tags: [Canteen]
 *     parameters:
 *       - name: id_employee
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *       500:
 *         description: Error interno
 */
router.get('/history/:id_employee', authenticate, authorize(['Employee', 'Admin']), canteenController.getEmployeeHistory);

module.exports = router;
