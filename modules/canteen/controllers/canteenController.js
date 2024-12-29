const canteenService = require('../services/canteenService');

// Registrar una acción (Check-in o Check-out) en el comedor
const registerAction = async (req, res) => {
    try {
        console.log('Datos recibidos en el controlador:', req.body);
        const { id_employee } = req.body;

        if (!id_employee) {
            console.log('Error: Faltan campos obligatorios.');
            return res.status(400).json({ message: 'Falta el campo obligatorio id_employee.' });
        }

        console.log('Llamando a canteenService.registerAction...');
        const record = await canteenService.registerAction({ id_employee });
        console.log('Acción registrada exitosamente:', record);
        res.status(201).json(record);
    } catch (error) {
        console.error('Error en el controlador:', error.message);
        res.status(400).json({ message: `Error al registrar acción: ${error.message}` });
    }
};

const registerCanteenCheckin = async (userId, timestamp) => {
    try {
        const { id_employee } = req.body;

        if (!id_employee) {
            return res.status(400).json({ message: 'Falta el campo obligatorio id_employee.' });
        }

        console.log('Llamando a canteenService.registerCanteenCheckin...');
        const result = await canteenService.registerCanteenCheckin({ id_employee });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al registrar el check-in en el comedor:', error.message);
        res.status(400).json({ message: `Error al registrar acción: ${error.message}` });
    }
};


// Endpoint para obtener los registros con filtros del comedor
const getRecords = async (req, res) => {
    try {
        const { id_employee, start_date, end_date, department } = req.query; // Parámetros de filtro
        const records = await canteenService.getRecords({ id_employee, start_date, end_date, department });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener registros: ${error.message}` });
    }
};

// Obtener empleados actualmente en el comedor
const getEmployeesCheckedIn = async (req, res) => {
    try {
        const employees = await canteenService.getEmployeesCurrentlyCheckedIn();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener empleados: ${error.message}` });
    }
};

// Obtener historial de registros de un empleado en el comedor
const getEmployeeHistory = async (req, res) => {
    try {
        const { id_employee } = req.params;
        const records = await canteenService.getRecordsByEmployee(id_employee);
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: `Error al obtener historial: ${error.message}` });
    }
};

module.exports = {
    registerAction,
    registerCanteenCheckin,
    getRecords,
    getEmployeesCheckedIn,
    getEmployeeHistory,
};
