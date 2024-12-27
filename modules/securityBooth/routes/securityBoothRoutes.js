const express = require('express');
const securityBoothController = require('../controllers/securityBoothController');
const authenticate = require('../../../middlewares/authenticate');
const { authorize } = require('../../../middlewares/authorize');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Security Booth
 *   description: Endpoints para Check-in y Check-out
 */

/**
 * @swagger
  * /api/securityBooth/register:
 *   post:
 *     summary: Registrar Check-in o Check-out vía QR
 *     tags: [Security Booth]
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
 *         description: Faltan campos obligatorios
 *       500:
 *         description: Error interno
 */
router.post('/register', securityBoothController.registerAction);

/**
 * @swagger
 * /api/securityBooth/records:
 *   get:
 *     summary: Obtener registros de Check-in/Check-out con filtros (Admin Only)
 *     tags: [Security Booth]
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
router.get('/records', authenticate, authorize(['Admin']), securityBoothController.getRecords);

/**
 * @swagger
 * /api/securityBooth/employees-checked-in:
 *   get:
 *     summary: Obtener empleados actualmente en el edificio (Admin Only)
 *     tags: [Security Booth]
 *     responses:
 *       200:
 *         description: Lista de empleados obtenida exitosamente
 *       500:
 *         description: Error interno
 */
router.get('/employees-checked-in', authenticate, authorize(['Admin']), securityBoothController.getEmployeesCheckedIn);

/**
 * @swagger
 * /api/securityBooth/history/{id_employee}:
 *   get:
 *     summary: Obtener historial de un empleado
 *     tags: [Security Booth]
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
router.get('/history/:id_employee', authenticate, authorize(['Employee', 'Admin']), securityBoothController.getEmployeeHistory);

module.exports = router;
