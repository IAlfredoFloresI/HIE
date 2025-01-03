const securityBoothRepository = require('../repositories/securityBoothRepository');
const moment = require('moment');

// Registrar una acción (Check-in o Check-out)
const registerAction = async ({ id_employee }) => {
    console.log(`Procesando acción para empleado: ${id_employee}`);

    // Verificar si el empleado existe
    const employeeExists = await securityBoothRepository.employeeExists(id_employee);
    if (!employeeExists) {
        throw new Error(`El empleado con ID ${id_employee} no existe.`);
    }

    const currentDate = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    // Determinar automáticamente la acción
    console.log('Determinando acción automáticamente...');
    const hasOpenCheckIn = await securityBoothRepository.hasOpenCheckIn(id_employee);
    const action = hasOpenCheckIn ? 'checkout' : 'checkin';

    console.log(`Acción determinada automáticamente: ${action}`);

    // Registrar la acción en la base de datos
    console.log('Llamando a securityBoothRepository.addAction...');
    await securityBoothRepository.addAction(id_employee, action, currentDate, currentTime);
    console.log('Acción registrada exitosamente.');

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
