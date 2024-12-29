const securityBoothRepository = require('../repositories/securityBoothRepository');
const { sendCheckInOutNotification } = require('../../../helpers/emailSender');
const moment = require('moment-timezone');



// Registrar una acción (Check-in o Check-out)
const registerAction = async ({ id_employee }) => {
    console.log(`Procesando acción para empleado: ${id_employee}`);

    // Verificar si el empleado existe y obtener sus datos
    const employee = await securityBoothRepository.getEmployeeById(id_employee);
    if (!employee) {
        throw new Error(`El empleado con ID ${id_employee} no existe.`);
    }

    const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD'); // Obtener la fecha en zona horaria local
    const currentTime = moment().tz("America/Mexico_City").format('HH:mm:ss'); // Obtener la hora en zona horaria local (24h)

    // Determinar automáticamente la acción (check-in o check-out)
    console.log('Determinando acción automáticamente...');
    const hasOpenCheckIn = await securityBoothRepository.hasOpenCheckIn(id_employee);

    // Definir la acción (check-in o check-out)
    const action = hasOpenCheckIn ? 'checkout' : 'checkin';
    console.log(`Acción determinada automáticamente: ${action}`);

    // Validar si ya existe un registro para el mismo día, acción y empleado
    const existingRecord = await securityBoothRepository.getRecordByEmployeeActionAndDate(
        id_employee,
        action,
        currentDate
    );

    if (existingRecord) {
        const errorMessage =
            action === 'checkin'
                ? 'Ya has hecho tu check-in hoy.'
                : 'Ya has hecho tu check-out hoy.';
        throw new Error(errorMessage);
    }

    // Registrar la acción en la base de datos
    console.log('Llamando a securityBoothRepository.addAction...');
    const record = await securityBoothRepository.addAction(id_employee, action);
    console.log('Acción registrada exitosamente.');

    // Formatear la hora en formato AM/PM solo para el correo
    const formattedTime = moment(record.record_time, 'HH:mm:ss').tz("America/Mexico_City").locale('es').format('hh:mm A'); // Ejemplo: "11:51 p. m."
    const location = "security";

    // Enviar notificación por correo
    await sendCheckInOutNotification(
        employee.email,
        employee.employeeName,
        action,
        record.record_date,
        formattedTime, // Enviar la hora en formato 12h (AM/PM) en el correo
        location
    );
    console.log('Correo enviado al empleado.');

    return { 
        id_employee, 
        action, 
        recordDate: record.record_date, 
        recordTime: formattedTime // Devolver la hora en formato 12h
    };
};

const synchronizeCanteenCheckout = async (id_employee) => {
    console.log(`Sincronizando check-out en canteen para el empleado: ${id_employee}`);
    const hasOpenCheckIn = await canteenRepository.hasOpenCheckIn(id_employee);

    if (hasOpenCheckIn) {
        const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
        await canteenRepository.addAction(id_employee, 'checkout');
        console.log('Check-out sincronizado en canteen.');
    } else {
        console.log('No se encontró check-in abierto en canteen para sincronizar.');
    }   
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
    synchronizeCanteenCheckout,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
};
