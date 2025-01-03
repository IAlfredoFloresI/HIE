const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticate = require('../../../middlewares/authenticate');
const { authorize, authorizeDeleteEmployee } = require('../../../middlewares/authorize');
const forcePasswordReset = require('../../../middlewares/forcePasswordReset');
const autoLogoutMiddleware = require('../../../middlewares/autoLogoutMiddleware');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: API para manejar empleados
 */

// Aplica autenticación a todas las rutas de este archivo
router.use(authenticate);
router.use(forcePasswordReset);
router.use(autoLogoutMiddleware);


/**
 * @swagger
 * /api/employees/profile:
 *   get:
 *     summary: Obtener perfil del empleado (Admin and Employee)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Accesible para roles Admin y Employee.
 *     responses:
 *       200:
 *         description: Perfil del empleado obtenido
 *       401:
 *         description: No autorizado
 */
router.get('/profile', authorize(['Admin', 'Employee']), employeeController.getProfile);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Agregar un nuevo empleado (Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para el rol de Admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_employee:
 *                 type: integer
 *                 description: ID único del empleado
 *               employeeName:
 *                 type: string
 *                 description: Nombre completo del empleado
 *               email:
 *                 type: string
 *                 description: Correo electrónico del empleado
 *               department:
 *                 type: string
 *                 description: Departamento del empleado
 *               phoneNumber:
 *                 type: string
 *                 description: Número de teléfono (opcional)
 *               address:
 *                 type: string
 *                 description: Dirección (opcional)
 *     responses:
 *       201:
 *         description: Empleado creado
 *       400:
 *         description: Solicitud incorrecta
 */
router.post('/', authorize(['Admin']), employeeController.createEmployee);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Obtener empleados con paginación y filtros (Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para el rol de Admin.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_employee:
 *                         type: integer
 *                       employeeName:
 *                         type: string
 *                       department:
 *                         type: string
 *                       status:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authorize(['Admin']), employeeController.getEmployeesWithPaginationAndFilters);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   get:
 *     summary: Obtener detalles de un empleado por ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna los detalles del empleado por ID. Solo accesible por Admin.
 *     parameters:
 *       - name: id_employee
 *         in: path
 *         required: true
 *         description: ID del empleado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del empleado encontrados
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id_employee', authorize(['Admin']), employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   put:
 *     summary: Actualizar un empleado (Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para el rol de Admin.
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
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id_employee', authorize(['Admin']), employeeController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id_employee}:
 *   delete:
 *     summary: Eliminar un empleado (Admin only, no puede eliminar otros Admins)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Solo accesible para el rol de Admin.
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
router.delete('/:id_employee', authorize(['Admin']), authorizeDeleteEmployee(), employeeController.deleteEmployee);

/**
 * @swagger
 * /api/employees/{id}/qr:
 *   get:
 *     summary: Generar código QR para un empleado
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del empleado
 *     responses:
 *       200:
 *         description: QR generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrImage:
 *                   type: string
 *                   format: base64
 *                   description: Imagen del código QR en formato base64
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error al generar el código QR
 */
router.get('/:id/qr', employeeController.generateQR);

/**
 * @swagger
 * /api/employees/{id}/qr-state:
 *   patch:
 *     summary: Habilitar o deshabilitar el código QR de un empleado (Admin only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Permite a un administrador habilitar o deshabilitar el código QR de un empleado.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Estado del QR (true para habilitar, false para deshabilitar)
 *     responses:
 *       200:
 *         description: Estado del QR actualizado correctamente
 *       400:
 *         description: Error en los datos enviados
 *       404:
 *         description: Empleado no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/qr-state', authorize(['Admin']), employeeController.toggleQRState);

/**
 * @swagger
 * /api/employees/profile:
 *   get:
 *     summary: Obtener perfil del empleado
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Muestra el perfil del empleado o admin, incluyendo el último check-in/check-out y estatus.
 *     responses:
 *       200:
 *         description: Perfil del empleado obtenido
 *       401:
 *         description: No autorizado
 */
router.get('/profile', authorize(['Employee', 'Admin']), employeeController.getProfile);

/**
 * @swagger
 * /api/employees/profile/report:
 *   get:
 *     summary: Descargar reporte de asistencias en formato PDF
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     description: Genera y permite la descarga del reporte de asistencias quincenal o mensual.
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [quincena1, quincena2, mes]
 *         required: true
 *         description: Período para el reporte (quincena1, quincena2, mes)
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Solicitud incorrecta
 *       404:
 *         description: No se encontraron registros
 *       500:
 *         description: Error interno del servidor
 */
router.get('/profile/report', authorize(['Employee', 'Admin']), employeeController.generateReport);

module.exports = router;
