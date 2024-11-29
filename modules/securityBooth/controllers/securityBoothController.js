const securityBoothService = require('../services/securityBoothService');

// Registrar una acción (Check-in o Check-out)
const registerAction = async (req, res) => {
    try {
        console.log('Datos recibidos en el controlador:', req.body);
        const { id_employee } = req.body;

        if (!id_employee) {
            console.log('Error: Faltan campos obligatorios.');
            return res.status(400).json({ message: 'Falta el campo obligatorio id_employee.' });
        }

        console.log('Llamando a securityBoothService.registerAction...');
        const record = await securityBoothService.registerAction({ id_employee });
        console.log('Acción registrada exitosamente:', record);
        res.status(201).json(record);
    } catch (error) {
        console.error('Error en el controlador:', error.message);
        res.status(400).json({ message: `Error al registrar acción: ${error.message}` });
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
    getRecords,
    getEmployeesCheckedIn,
    getEmployeeHistory,
};
