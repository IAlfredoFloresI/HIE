const { openDatabase } = require('../../../config/database');

// Verificar si el empleado existe
const employeeExists = async (id_employee) => {
    const db = await openDatabase();
    try {
        const result = await db.get(`
            SELECT 1 
            FROM employees 
            WHERE id_employee = ?
        `, [id_employee]);
        return !!result; // Devuelve true si existe, false si no
    } finally {
        await db.close();
    }
};

// Insertar un registro de acción (Check-in o Check-out)
const addAction = async (id_employee, action, record_date, record_time) => {
    const db = await openDatabase();

    // Validar si ya existe un registro igual
    const exists = await db.get(`
        SELECT 1 
        FROM checkin_checkout_records
        WHERE id_employee = ? AND action = ? AND record_date = ? AND record_time = ?
    `, [id_employee, action, record_date, record_time]);

    if (exists) {
        console.log('El registro ya existe. Abortando.');
        await db.close();
        return; // No registrar duplicados
    }

    // Insertar el registro
    await db.run(`
        INSERT INTO checkin_checkout_records (id_employee, action, record_date, record_time) 
        VALUES (?, ?, ?, ?)
    `, [id_employee, action, record_date, record_time]);

    console.log('Registro agregado exitosamente.');
    await db.close();
};

// Validar si existe un Check-in sin Check-out
const hasOpenCheckIn = async (id_employee) => {
    const db = await openDatabase();

    // Buscar el último registro del empleado
    const lastRecord = await db.get(`
        SELECT action
        FROM checkin_checkout_records
        WHERE id_employee = ?
        ORDER BY record_date DESC, record_time DESC
        LIMIT 1
    `, [id_employee]);

    await db.close();

    // Si el último registro es un 'checkin', hay un pendiente
    return lastRecord && lastRecord.action === 'checkin';
};

// Obtener registros con filtros
const getRecords = async ({ id_employee, start_date, end_date }) => {
    const db = await openDatabase();
    try {
        let query = `
            SELECT id_employee, action, record_date, record_time 
            FROM checkin_checkout_records 
            WHERE 1=1
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

// Obtener empleados actualmente en el edificio
const getEmployeesCurrentlyCheckedIn = async () => {
    const db = await openDatabase();
    try {
        const employees = await db.all(`
            SELECT e.id_employee, e.employeeName, r.record_date, r.record_time
            FROM employees e
            JOIN checkin_checkout_records r ON e.id_employee = r.id_employee
            WHERE r.action = 'checkin'
            AND NOT EXISTS (
                SELECT 1 FROM checkin_checkout_records
                WHERE action = 'checkout'
                AND id_employee = r.id_employee
                AND record_date = r.record_date
            )
        `);
        return employees;
    } finally {
        await db.close();
    }
};

// Obtener historial de registros de un empleado
const getRecordsByEmployee = async (id_employee) => {
    const db = await openDatabase();
    try {
        return await db.all(`
            SELECT action, record_date, record_time
            FROM checkin_checkout_records
            WHERE id_employee = ?
            ORDER BY record_date, record_time
        `, [id_employee]);
    } finally {
        await db.close();
    }
};

// Obtener registros de Check-in y Check-out con el estado "Pendiente"
const getRecordsWithPendingCheckouts = async ({ start_date, end_date, department, id_employee }) => {
    const db = await openDatabase();
    try {
        const query = `
            SELECT 
                e.id_employee,
                e.employeeName,
                e.department,
                r_checkin.record_date AS record_date,
                r_checkin.record_time AS checkin_time,
                COALESCE(r_checkout.record_time, 'Pendiente') AS checkout_time
            FROM employees e
            JOIN checkin_checkout_records r_checkin 
                ON e.id_employee = r_checkin.id_employee
            LEFT JOIN checkin_checkout_records r_checkout 
                ON r_checkin.id_employee = r_checkout.id_employee 
                AND r_checkin.record_date = r_checkout.record_date 
                AND r_checkin.action = 'checkin' 
                AND r_checkout.action = 'checkout'
            WHERE 1=1
            ${start_date ? `AND r_checkin.record_date >= '${start_date}'` : ''}
            ${end_date ? `AND r_checkin.record_date <= '${end_date}'` : ''}
            ${department ? `AND e.department = '${department}'` : ''}
            ${id_employee ? `AND e.id_employee = ${id_employee}` : ''}
            ORDER BY r_checkin.record_date, r_checkin.record_time
        `;
        return await db.all(query);
    } finally {
        await db.close();
    }
};

// Obtener el último movimiento (check-in/check-out) del empleado
const getLastActionByEmployee = async (id_employee) => {
    const db = await openDatabase();
    const result = await db.get(`
        SELECT action, record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ?
        ORDER BY record_date DESC, record_time DESC
        LIMIT 1
    `, [id_employee]);
    await db.close();
    return result;
};

// Obtener registros por período (quincenas o meses)
const getRecordsByPeriod = async (id_employee, period) => {
    const db = await openDatabase();
    const [startDate, endDate] = calculatePeriodRange(period); // Usar el helper
    const records = await db.all(`
        SELECT action, record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ? AND record_date BETWEEN ? AND ?
        ORDER BY record_date, record_time
    `, [id_employee, startDate, endDate]);
    await db.close();
    return records;
};

module.exports = {
    getLastActionByEmployee,
    getRecordsByPeriod,
    addAction,
    hasOpenCheckIn,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
    getRecordsWithPendingCheckouts,
    employeeExists,
};