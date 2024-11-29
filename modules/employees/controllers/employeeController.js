const employeeService = require('../services/employeeService');
const QRCode = require('qrcode'); // Para generar QR
const employeeRepository = require('../repositories/employeeRepository');
const securityBoothRepository = require('../../securityBooth/repositories/securityBoothRepository');

// Obtener empleados con paginación y filtros
const getEmployeesWithPaginationAndFilters = async (req, res) => {
    try {
        const { page, limit, status, department, searchTerm } = req.query;

        const employees = await employeeService.getEmployeesWithPaginationAndFilters({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            department,
            searchTerm,
        });

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener empleados: ${error.message}` });
    }
};

// Crear empleado
const createEmployee = async (req, res) => {
    try {
        const newEmployee = await employeeService.addEmployee(req.body);

        res.status(201).json({
            success: true,
            message: newEmployee.message,
            id_employee: newEmployee.id_employee,
        });
    } catch (error) {
        res.status(400).json({ message: `Error al crear empleado: ${error.message}` });
    }
};

// Obtener detalles de un empleado por ID
const getEmployeeById = async (req, res) => {
    try {
        const { id_employee } = req.params;
        const employee = await employeeService.getEmployeeById(id_employee);

        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener los detalles del empleado: ${error.message}` });
    }
};

// Actualizar un empleado
const updateEmployee = async (req, res) => {
    try {
        const { status, ...updateFields } = req.body;

        // Advertir si el cliente intenta actualizar `status`
        if (status) {
            return res.status(400).json({ message: 'El campo "status" no se puede actualizar manualmente.' });
        }

        const updatedEmployee = await employeeService.updateEmployee(req.params.id_employee, updateFields);

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ message: `Error al actualizar empleado: ${error.message}` });
    }
};


// Eliminar un empleado (cambiar su estado a baja)
const deleteEmployee = async (req, res) => {
    try {
        const result = await employeeService.deleteEmployee(req.params.id_employee);

        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: `Error al eliminar empleado: ${error.message}` });
    }
};

// Actualizar la contraseña del empleado
const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        // Validar que la nueva contraseña cumpla los requisitos
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y desactivar `force_password_reset`
        const result = await employeeService.updatePassword(req.user.id, hashedPassword);

        if (!result) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: `Error al actualizar la contraseña: ${error.message}` });
    }
};

/**
 * Generar un QR dinámico para un empleado.
 */
const generateQR = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el empleado existe
        const employee = await employeeRepository.getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        // Generar el contenido del QR
        const qrContent = `empleado-id:${id}`;
        const qrImage = await QRCode.toDataURL(qrContent);

        res.status(200).json({ qrImage });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el código QR: ' + error.message });
    }
};

/**
 * Habilitar o deshabilitar el QR.
 */
const toggleQRState = async (req, res) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body;

        // Validar el estado enviado
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ message: 'El estado debe ser un valor booleano.' });
        }

        // Actualizar el estado del QR en la base de datos
        const updated = await employeeRepository.updateQREnabledState(id, enabled);
        if (!updated) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        res.status(200).json({ message: `Código QR ${enabled ? 'habilitado' : 'deshabilitado'} correctamente.` });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del código QR: ' + error.message });
    }
};

// Obtener perfil del empleado basado en su ID en el token JWT
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario desde el token
        const userRole = req.user.role; // Rol del usuario

        // Obtener información del empleado
        const employee = await employeeRepository.getEmployeeById(userId);
        if (!employee) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        // Obtener el último movimiento de check-in o check-out
        const lastAction = await securityBoothRepository.getLastActionByEmployee(userId);

        // Generar el contenido del QR
        const qrContent = `empleado-id:${userId}`;
        
        // Generar QR como imagen Base64
        const qrImage = await QRCode.toDataURL(qrContent);

        // Generar respuesta
        const profile = {
            name: employee.employeeName,
            role: userRole,
            qr: qrImage, // Imagen QR en formato Base64
            status: lastAction
                ? `${lastAction.action} - ${lastAction.record_date} ${lastAction.record_time}`
                : 'Sin movimientos',
        };

        res.status(200).json(profile);
    } catch (error) {
        console.error(`Error al obtener el perfil: ${error.message}`);
        res.status(500).json({ message: `Error al obtener el perfil: ${error.message}` });
    }
};

// Generar y descargar reportes en formato PDF
const generateReport = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario desde el token
        const { period } = req.query; // Período (quincena, mes, etc.)

        // Validar período
        if (!period) {
            return res.status(400).json({ message: 'Período es obligatorio (quincena, mes).' });
        }

        // Obtener registros del período
        const records = await securityBoothRepository.getRecordsByPeriod(userId, period);
        if (!records.length) {
            return res.status(404).json({ message: 'No hay registros para este período.' });
        }

        // Generar PDF
        const pdf = await pdfGenerator.generateAttendanceReport(employee.employeeName, records);

        // Enviar PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${period}.pdf`);
        res.send(pdf);
    } catch (error) {
        res.status(500).json({ message: `Error al generar el reporte: ${error.message}` });
    }
};

module.exports = {
    getEmployeesWithPaginationAndFilters,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getProfile,
    updatePassword, // Nueva función exportada
    generateQR, 
    toggleQRState,
    getProfile,
    generateReport,
};
