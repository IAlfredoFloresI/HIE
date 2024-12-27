const express = require('express');
const router = express.Router();
const AdvertisementsController = require('../controllers/advertisementController');

/**
 * @swagger
 * tags:
 *   name: Advertisements
 *   description: API for managing advertisements
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Advertisement:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         id_advertisements:
 *           type: integer
 *           description: The auto-generated ID of the advertisement
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         status:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: The status of the advertisement (default is 'activo')
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement (must be today or in the future)
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement (must be after the issue date)
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         id_advertisements: 1
 *         title: "Summer Sale"
 *         description: "50% off on all items!"
 *         status: "activo"
 *         issue_date: "2024-01-01"
 *         expiration_date: "2024-01-31"
 *         departments: "Cocina"
 *     AdvertisementCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement (must be today or in the future)
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement (must be after the issue date)
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         title: "Winter Sale"
 *         description: "Up to 70% off!"
 *         issue_date: "2024-02-01"
 *         expiration_date: "2024-02-15"
 *         departments: "All"
 *     AdvertisementUpdate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         title: "Spring Sale"
 *         description: "Exclusive deals!"
 *         issue_date: "2024-03-01"
 *         expiration_date: "2024-03-15"
 *         departments: "Cocina"
 */

/**
 * @swagger
 * /api/advertisements:
 *   get:
 *     summary: Retrieve a list of advertisements with pagination
 *     tags: [Advertisements]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of advertisements per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: activo
 *         description: Filter by advertisement status
 *       - in: query
 *         name: departamento
 *         schema:
 *           type: string
 *           example: Cocina
 *         description: Filter by department
 *     responses:
 *       200:
 *         description: List of advertisements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Advertisement'
 */
router.get('/advertisements', AdvertisementsController.getAdvertisements);

/**
 * @swagger
 * /api/advertisements/{id}:
 *   get:
 *     summary: Get a single advertisement by ID
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advertisement ID
 *     responses:
 *       200:
 *         description: Advertisement details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Advertisement'
 *       404:
 *         description: Advertisement not found
 */
router.get('/advertisements/:id', AdvertisementsController.getAdvertisementById);

/**
 * @swagger
 * /api/advertisements:
 *   post:
 *     summary: Create a new advertisement
 *     tags: [Advertisements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvertisementCreate'
 *     responses:
 *       201:
 *         description: Advertisement created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/advertisements', AdvertisementsController.createAdvertisement);

/**
 * @swagger
 * /api/advertisements/{id}:
 *   put:
 *     summary: Update an advertisement by ID
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advertisement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdvertisementUpdate'
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 *       404:
 *         description: Advertisement not found
 *       400:
 *         description: Invalid input
 */
router.put('/advertisements/:id', AdvertisementsController.updateAdvertisement);

/**
 * @swagger
 * /api/advertisements/{id}:
 *   delete:
 *     summary: Delete an advertisement by ID
 *     tags: [Advertisements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The advertisement ID
 *     responses:
 *       204:
 *         description: Advertisement deleted successfully
 *       404:
 *         description: Advertisement not found
 */
router.delete('/advertisements/:id', AdvertisementsController.deleteAdvertisement);

/**
 * @swagger
 * components:
 *   schemas:
 *     Advertisement:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         id_advertisements:
 *           type: integer
 *           description: The auto-generated ID of the advertisement
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         status:
 *           type: string
 *           enum: [activo, inactivo]
 *           description: The status of the advertisement (default is 'activo')
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement (must be today or in the future)
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement (must be after the issue date)
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         id_advertisements: 1
 *         title: "Summer Sale"
 *         description: "50% off on all items!"
 *         status: "activo"
 *         issue_date: "2024-01-01"
 *         expiration_date: "2024-01-31"
 *         departments: "Cocina"
 *     AdvertisementCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement (must be today or in the future)
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement (must be after the issue date)
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         title: "Winter Sale"
 *         description: "Up to 70% off!"
 *         issue_date: "2024-02-01"
 *         expiration_date: "2024-02-15"
 *         departments: "All"
 *     AdvertisementUpdate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - issue_date
 *         - expiration_date
 *         - departments
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the advertisement
 *         description:
 *           type: string
 *           description: The description of the advertisement
 *         issue_date:
 *           type: string
 *           format: date
 *           description: The issue date of the advertisement
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The expiration date of the advertisement
 *         departments:
 *           type: string
 *           enum: [All, Cocina, Mantenimiento, Seguridad, Almacen]
 *           description: The department the advertisement is targeted to
 *       example:
 *         title: "Spring Sale"
 *         description: "Exclusive deals!"
 *         issue_date: "2024-03-01"
 *         expiration_date: "2024-03-15"
 *         departments: "Cocina"
 */

module.exports = router;
