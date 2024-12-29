const { openDatabase } = require('../../../config/database');
const moment = require('moment-timezone');

// Verificar si el empleado existe
const employeeExists = async (id_employee) => {
    const db = await openDatabase();
    try {
        const result = await db.get(`
            SELECT 1 
            FROM employees 
            WHERE id_employee = ?;
        `, [id_employee]);
        return !!result; // Devuelve true si existe, false si no
    } finally {
        await db.close();
    }
};

// Obtener un registro por empleado, acción y fecha
const getRecordByEmployeeActionAndDate = async (id_employee, action, date) => {
    const db = await openDatabase();
    const query = `
        SELECT *
        FROM checkin_checkout_records
        WHERE id_employee = ?
          AND action = ?
          AND record_date = ?
          AND action_type = 'canteen';
    `;
    try {
        const result = await db.get(query, [id_employee, action, date]);
        return result || null; // Si no hay resultados, devuelve null
    } finally {
        await db.close();
    }
};

// Obtener el empleado por ID
const getEmployeeById = async (id_employee) => {
    const db = await openDatabase();
    const query = `
        SELECT email, employeeName
        FROM employees
        WHERE id_employee = ?;
    `;
    try {
        const employee = await db.get(query, [id_employee]);
        return employee || null;
    } finally {
        await db.close();
    }
};

// Insertar un registro de acción (Check-in o Check-out) para el comedor
const addAction = async (id_employee, action) => {
    const db = await openDatabase();

    // Establecer la zona horaria y obtener la fecha y hora actuales
    const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD');
    const currentTime = moment().tz("America/Mexico_City").format('HH:mm:ss');

    // Validar si ya existe un registro igual para el mismo empleado y acción en el día
    const exists = await db.get(`
        SELECT 1 
        FROM checkin_checkout_records
        WHERE id_employee = ?
          AND action = ?
          AND record_date = ?
          AND action_type = 'canteen';  -- Aseguramos que sea de tipo 'canteen'
    `, [id_employee, action, currentDate]);
    
    if (exists) {
        console.log('El registro ya existe para ese empleado en esa fecha. Abortando.');
        await db.close();
        return; // No registrar duplicados
    }

    // Insertar el registro con la hora en formato 24 horas y tipo 'canteen'
    await db.run(`
        INSERT INTO checkin_checkout_records (id_employee, action, record_date, record_time, action_type) 
        VALUES (?, ?, ?, ?, ?);
    `, [id_employee, action, currentDate, currentTime, 'canteen']);

    console.log('Registro agregado exitosamente.');

    // Obtener el registro recién insertado
    const selectQuery = `
        SELECT record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ? 
          AND action = ? 
          AND record_date = ? 
          AND action_type = 'canteen'  -- Filtrar por acción 'canteen'
        ORDER BY rowid DESC 
        LIMIT 1;
    `;
    const record = await db.get(selectQuery, [id_employee, action, currentDate]);

    await db.close();
    return record;  // Devuelve el registro con la hora en formato 24 horas
};

// Validar si existe un Check-in sin Check-out en el comedor
const hasOpenCheckIn = async (id_employee) => {
    const db = await openDatabase();

    // Buscar el último registro de check-in del empleado para el comedor
    const lastRecord = await db.get(`
        SELECT action
        FROM checkin_checkout_records
        WHERE id_employee = ? 
          AND action_type = 'canteen'  -- Filtrar por 'canteen'
        ORDER BY record_date DESC, record_time DESC
        LIMIT 1;
    `, [id_employee]);

    await db.close();

    // Si el último registro es un 'checkin', hay un pendiente
    return lastRecord && lastRecord.action === 'checkin';
};

// Verificar si hay un check-out registrado en el comedor para el empleado hoy
const hasOpenCheckOut = async (id_employee) => {
    const db = await openDatabase();

    const currentDate = moment().tz("America/Mexico_City").format('YYYY-MM-DD'); // Fecha actual
    const query = `
        SELECT 1
        FROM checkin_checkout_records
        WHERE id_employee = ?
          AND action = 'checkout'
          AND record_date = ?
          AND action_type = 'canteen';  -- Filtrar por 'canteen'
    `;

    try {
        const result = await db.get(query, [id_employee, currentDate]);
        return !!result; // Devuelve true si hay un resultado, false si no
    } finally {
        await db.close();
    }
};


// Obtener registros con filtros para el comedor
const getRecords = async ({ id_employee, start_date, end_date }) => {
    const db = await openDatabase();
    try {
        let query = `
            SELECT id_employee, action, record_date, record_time 
            FROM checkin_checkout_records 
            WHERE action_type = 'canteen'  -- Filtrar por 'canteen'
        `;
        const params = [];

        if (id_employee) {
            query += ` AND id_employee = ?`;
            params.push(id_employee);
        }
        if (start_date && end_date) {
            query += ` AND record_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY record_date, record_time`;
        return await db.all(query, params);
    } finally {
        await db.close();
    }
};

// Obtener empleados actualmente en el comedor
const getEmployeesCurrentlyCheckedIn = async () => {
    const db = await openDatabase();
    try {
        const employees = await db.all(`
            SELECT e.id_employee, e.employeeName, r.record_date, r.record_time
            FROM employees e
            JOIN checkin_checkout_records r ON e.id_employee = r.id_employee
            WHERE r.action = 'checkin' 
              AND r.action_type = 'canteen'  -- Filtrar por 'canteen'
            AND NOT EXISTS (
                SELECT 1 
                FROM checkin_checkout_records
                WHERE action = 'checkout'
                  AND id_employee = r.id_employee 
                  AND record_date = r.record_date
                  AND action_type = 'canteen'  -- Filtrar por 'canteen'
            )
        `);
        return employees;
    } finally {
        await db.close();
    }
};

// Obtener historial de registros de un empleado para el comedor
const getRecordsByEmployee = async (id_employee) => {
    const db = await openDatabase();
    try {
        return await db.all(`
            SELECT action, record_date, record_time
            FROM checkin_checkout_records
            WHERE id_employee = ? 
              AND action_type = 'canteen'  -- Filtrar por 'canteen'
            ORDER BY record_date, record_time
        `, [id_employee]);
    } finally {
        await db.close();
    }
};

// Obtener el último movimiento (check-in/check-out) del empleado en el comedor
const getLastActionByEmployee = async (id_employee) => {
    const db = await openDatabase();
    const result = await db.get(`
        SELECT action, record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ? 
          AND action_type = 'canteen'  -- Filtrar por 'canteen'
        ORDER BY record_date DESC, record_time DESC
        LIMIT 1
    `, [id_employee]);
    await db.close();
    return result;
};

// Obtener registros por período (quincenas o meses) para el comedor
const getRecordsByPeriod = async (id_employee, period) => {
    const db = await openDatabase();
    const [startDate, endDate] = calculatePeriodRange(period); // Usar el helper
    const records = await db.all(`
        SELECT action, record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ? 
          AND record_date BETWEEN ? AND ?
          AND action_type = 'canteen'  -- Filtrar por 'canteen'
        ORDER BY record_date, record_time
    `, [id_employee, startDate, endDate]);
    await db.close();
    return records;
};

module.exports = {
    getEmployeeById,
    getRecordByEmployeeActionAndDate,
    getLastActionByEmployee,
    getRecordsByPeriod,
    addAction,
    hasOpenCheckIn,
    hasOpenCheckOut,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
};
