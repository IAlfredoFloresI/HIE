const canteenRepository = require('../repositories/canteenRepository');
const { sendCheckInOutNotification } = require('../../../helpers/emailSender');
const securityBoothRepository = require('../../securityBooth/repositories/securityBoothRepository'); // Agregar el repositorio de securityBooth
const moment = require('moment-timezone');

// Registrar una acción (Check-in o Check-out en el comedor)
const registerAction = async ({ id_employee }) => {
    console.log(`Procesando acción para empleado en el comedor: ${id_employee}`);

    // Verificar si el empleado existe y obtener sus datos
    const employee = await canteenRepository.getEmployeeById(id_employee);
    if (!employee) {
        throw new Error(`El empleado con ID ${id_employee} no existe.`);
    }

    const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD'); // Obtener la fecha en zona horaria local
    const currentTime = moment().tz("America/Mexico_City").format('HH:mm:ss'); // Obtener la hora en zona horaria local (24h)

     // Verificar que el usuario tenga un check-in en securityBooth antes de permitir el check-in en canteen
    if (!(await securityBoothRepository.hasOpenCheckIn(id_employee)) && !await canteenRepository.hasOpenCheckIn(id_employee)) {
        throw new Error('Debe realizar check-in en el módulo de seguridad antes de registrar un check-in en el comedor.');
    }

    // Determinar automáticamente la acción (check-in o check-out)
    console.log('Determinando acción automáticamente...');
    const hasOpenCheckIn = await canteenRepository.hasOpenCheckIn(id_employee);

    // Definir la acción (check-in o check-out)
    const action = hasOpenCheckIn ? 'checkout' : 'checkin';
    console.log(`Acción determinada automáticamente: ${action}`);

    // Validar si ya existe un registro para el mismo día, acción y empleado
    const existingRecord = await canteenRepository.getRecordByEmployeeActionAndDate(
        id_employee,
        action,
        currentDate
    );

    if (existingRecord) {
        const errorMessage =
            action === 'checkin'
                ? 'Ya has hecho tu check-in hoy en el comedor.'
                : 'Ya has hecho tu check-out hoy en el comedor.';
        throw new Error(errorMessage);
    }

    // Registrar la acción en la base de datos
    console.log('Llamando a canteenRepository.addAction...');
    const record = await canteenRepository.addAction(id_employee, action);
    console.log('Acción registrada exitosamente.');

    // Formatear la hora en formato AM/PM solo para el correo
    const formattedTime = moment(record.record_time, 'HH:mm:ss').tz("America/Mexico_City").locale('es').format('hh:mm A'); // Ejemplo: "11:51 p. m."
    const location = "canteen";
    // Enviar notificación por correo
    try {
        await sendCheckInOutNotification(
            employee.email,
            employee.employeeName,
            action,
            record.record_date,
            formattedTime,
            location
        );
        console.log('Correo enviado al empleado.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo. Intente nuevamente más tarde.');
    }

    console.log('Correo enviado al empleado.');

    return { 
        id_employee, 
        action, 
        recordDate: record.record_date, 
        recordTime: formattedTime // Devolver la hora en formato 12h
    };
};

const synchronizeCanteenCheckout = async (id_employee) => {
    console.log(`Sincronizando check-out en el comedor para el empleado: ${id_employee}`);

    // Verificar si el empleado tiene un check-out registrado hoy
    const hasCheckout = await canteenRepository.hasOpenCheckOut(id_employee);

    if (!hasCheckout) {
        // Registrar el check-out en el comedor si no existe
        console.log('No se encontró un check-out, registrando uno nuevo.');
        await canteenRepository.addAction(id_employee, 'checkout');
        console.log('Check-out registrado exitosamente.');
    } else {
        console.log('Ya existe un check-out registrado para hoy.');
    }
};



// Obtener registros con Check-in, Check-out y "Pendiente"
const getRecords = async ({ start_date, end_date, department, id_employee }) => {
    try {
        const records = await canteenRepository.getRecordsWithPendingCheckouts({
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
        throw new Error(`Error al obtener registros del comedor: ${error.message}`);
    }
};

// Obtener empleados actualmente en el comedor
const getEmployeesCurrentlyCheckedIn = async () => {
    return await canteenRepository.getEmployeesCurrentlyCheckedIn();
};

// Obtener historial de registros de un empleado en el comedor
const getRecordsByEmployee = async (id_employee) => {
    return await canteenRepository.getRecordsByEmployee(id_employee);
};

module.exports = {
    registerAction,
    synchronizeCanteenCheckout,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
};
