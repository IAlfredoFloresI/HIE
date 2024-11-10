const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: API para manejar empleados
 */

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Agregar un nuevo empleado
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_employee:
 *                 type: integer
 *               employeeName:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [activo, baja]
 *     responses:
 *       201:
 *         description: Empleado creado
 *       400:
 *         description: Solicitud incorrecta
 */
router.post('/', employeeController.createEmployee);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   get:
 *     summary: Obtener un empleado por ID
 *     tags: [Employees]
 *     parameters:
 *       - name: id_employee
 *         in: path
 *         required: true
 *         description: ID del empleado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/:id_employee', employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   put:
 *     summary: Actualizar un empleado
 *     tags: [Employees]
 *     parameters:
 *       - name: id_employee
 *         in: path
 *         required: true
 *         description: ID del empleado a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeName:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [activo, baja]
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id_employee', employeeController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   delete:
 *     summary: Eliminar un empleado
 *     tags: [Employees]
 *     parameters:
 *       - name: id_employee
 *         in: path
 *         required: true
 *         description: ID del empleado a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Empleado eliminado
 *       404:
 *         description: Empleado no encontrado
 */
router.delete('/:id_employee', employeeController.deleteEmployee);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Obtener empleados con paginación y filtros
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de empleados por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado del empleado (activo o baja)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Departamento del empleado
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
 *     responses:
 *       200:
 *         description: Lista de empleados filtrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', employeeController.getEmployeesWithPaginationAndFilters);


module.exports = router;
