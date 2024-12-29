const securityBoothService = require('../services/securityBoothService');
const canteenService = require('../../canteen/services/canteenService');


// Registrar una acción (Check-in o Check-out)
const registerAction = async (req, res) => {
    try {
        const { id_employee } = req.body;
        const { action } = await securityBoothService.registerAction({ id_employee }); // Extraer la acción

        if (action === 'checkout') {
            console.log('Sincronizando checkout en canteen...');
            await canteenService.synchronizeCanteenCheckout(id_employee);
            res.status(200).json({
                success: true,
                message: `Acción '${action}' registrada correctamente en la caseta de seguridad y en el comedor.`,
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Acción '${action}' registrada correctamente en caseta de seguridad.`,
            });
        }
    } catch (error) {
        console.error('Error al registrar acción en securityBooth:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const registerSecurityCheckout = async (userId, timestamp) => {
    try {
        // Verificar si el usuario tiene un check-in activo en el comedor
        const canteenStatus = await canteenService.getRecordsByEmployee(userId);

        if (canteenStatus && canteenStatus.some(record => record.action === 'checkin')) {
            // Sincronizar el check-out en el comedor si tiene un check-in
            await canteenService.synchronizeCanteenCheckout(userId);
        }

        // Registrar el checkout de la caseta de seguridad
        await securityBoothService.registerAction(userId, "checkout", timestamp, "securityBooth");
    } catch (error) {
        console.error('Error al registrar el checkout:', error.message);
        throw new Error('Error al registrar el checkout en securityBooth.');
    }
};



// Endpoint para obtener los registros con filtros
const getRecords = async (req, res) => {
    try {
        const { id_employee, start_date, end_date, department } = req.query; // Parámetros de filtro
        const records = await securityBoothService.getRecords({ id_employee, start_date, end_date, department });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener registros: ${error.message}` });
    }
};

// Obtener empleados actualmente en el edificio
const getEmployeesCheckedIn = async (req, res) => {
    try {
        const employees = await securityBoothService.getEmployeesCurrentlyCheckedIn();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener empleados: ${error.message}` });
    }
};

// Obtener historial de registros de un empleado
const getEmployeeHistory = async (req, res) => {
    try {
        const { id_employee } = req.params;
        const records = await securityBoothService.getRecordsByEmployee(id_employee);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener historial: ${error.message}` });
    }
};

module.exports = {
    registerAction,
    registerSecurityCheckout,
    getRecords,
    getEmployeesCheckedIn,
    getEmployeeHistory,
};
