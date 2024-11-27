const db = require('../../../config/database');

// Insertar un registro de acción (Check-in o Check-out)
const addAction = async (id_employee, action, record_date, record_time) => {
    const database = await db.openDatabase();
    await database.run(
        `INSERT INTO checkin_checkout_records (id_employee, action, record_date, record_time) 
         VALUES (?, ?, ?, ?)`,
        [id_employee, action, record_date, record_time]
    );
    await database.close();
};

// Validar si existe un Check-in sin Check-out
const hasOpenCheckIn = async (id_employee) => {
    const database = await db.openDatabase();
    const result = await database.get(`
        SELECT * FROM checkin_checkout_records
        WHERE id_employee = ? AND action = 'checkin'
        AND NOT EXISTS (
            SELECT 1 FROM checkin_checkout_records
            WHERE id_employee = ? AND action = 'checkout'
            AND record_date = checkin_checkout_records.record_date
        )
    `, [id_employee, id_employee]);
    await database.close();
    return !!result; // Devuelve true si hay un Check-in sin Check-out
};

// Obtener registros con filtros
const getRecords = async ({ id_employee, start_date, end_date }) => {
    const database = await db.openDatabase();
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
    const records = await database.all(query, params);
    await database.close();
    return records;
};

// Obtener empleados actualmente en el edificio
const getEmployeesCurrentlyCheckedIn = async () => {
    const database = await db.openDatabase();
    const employees = await database.all(`
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
    await database.close();
    return employees;
};

// Obtener historial de registros de un empleado
const getRecordsByEmployee = async (id_employee) => {
    const database = await db.openDatabase();
    const records = await database.all(`
        SELECT action, record_date, record_time
        FROM checkin_checkout_records
        WHERE id_employee = ?
        ORDER BY record_date, record_time
    `, [id_employee]);
    await database.close();
    return records;
};

// Obtener registros de Check-in y Check-out con el estado "Pendiente"
const getRecordsWithPendingCheckouts = async ({ start_date, end_date, department, id_employee }) => {
    const database = await db.openDatabase();
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
    const records = await database.all(query);
    await database.close();
    return records;
};

module.exports = {
    addAction,
    hasOpenCheckIn,
    getRecords,
    getEmployeesCurrentlyCheckedIn,
    getRecordsByEmployee,
    getRecordsWithPendingCheckouts,
};
