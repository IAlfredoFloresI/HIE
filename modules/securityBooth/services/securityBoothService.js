const securityBoothRepository = require('../repositories/securityBoothRepository');
const moment = require('moment');

// Registrar una acción (Check-in o Check-out)
const registerAction = async ({ id_employee, action }) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    // Si no se especifica acción, determinar automáticamente
    if (!action) {
        const hasOpenCheckIn = await securityBoothRepository.hasOpenCheckIn(id_employee);
        action = hasOpenCheckIn ? 'checkout' : 'checkin';
    }

    await securityBoothRepository.addAction(id_employee, action, currentDate, currentTime);

    return { id_employee, action, record_date: currentDate, record_time: currentTime };
};

// Obtener registros con Check-in, Check-out y "Pendiente"
const getRecords = async ({ start_date, end_date, department, id_employee }) => {
    try {
        const records = await securityBoothRepository.getRecordsWithPendingCheckouts({
            start_date,
            end_date,
            department,
            id_employee,
        });
        return records.map(record => ({
            "No. de empleado": record.id_employee,
            "Empleado": record.employeeName,
            "Departamento": record.department,
            "Hora de entrada": record.checkin_time,
            "Hora de salida": record.checkout_time,
            "Fecha": record.record_date,
        }));
    } catch (error) {
        throw new Error(`Error al obtener registros: ${error.message}`);
    }
};

// Obtener empleados actualmente en el edificio
const getEmployeesCurrentlyCheckedIn = async () => {
    return await securityBoothRepository.getEmployeesCurrentlyCheckedIn();
};

// Obtener historial de registros de un empleado
const getRecordsByEmployee = async (id_employee) => {
    return await securityBoothRepository.getRecordsByEmployee(id_employee);
};

module.exports = {
    registerAction,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
};
