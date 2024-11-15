const path = require('path');
const db = require(path.join(__dirname, '../../../db')); // Importar la función para abrir la base de datos
const removeAccents = require('remove-accents');
const bcrypt = require('bcrypt');

// **Obtener empleados con paginación y filtros**
const getEmployeesWithPaginationAndFilters = async ({ page = 1, limit = 10, status, department, searchTerm }) => {
    const database = await db.openDatabase();

    // Convertimos `page` y `limit` a enteros para evitar valores inválidos
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Consulta base
    let query = `SELECT id_employee, employeeName, department, status FROM employees WHERE 1=1`;
    const params = [];

    // Filtro por estado
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    // Filtro por departamento
    if (department) {
        query += ` AND department = ?`;
        params.push(department);
    }

    // Agregar límites de paginación
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Ejecutar consulta
    const employees = await database.all(query, params);
    await database.close();

    // Filtro de búsqueda por nombre (aplicado en JS, no en SQL)
    if (searchTerm) {
        const normalizedSearchTerm = removeAccents(searchTerm.toLowerCase());
        return employees.filter(employee =>
            removeAccents(employee.employeeName.toLowerCase()).includes(normalizedSearchTerm)
        );
    }

    return employees;
};

// **Obtener un empleado por ID**
const getEmployeeById = async (id_employee) => {
    const database = await db.openDatabase();
    const query = `
        SELECT id_employee, employeeName, department, email, phoneNumber, address, status
        FROM employees
        WHERE id_employee = ?;
    `;
    const employee = await database.get(query, [id_employee]);
    await database.close();

    return employee; // Devuelve `undefined` si no encuentra al empleado
};

// **Crear un nuevo empleado**
const addEmployee = async (employee) => {
    const { employeeName, email, department, phoneNumber, address, password, role, status } = employee;

    const database = await db.openDatabase();
    const result = await database.run(
        `INSERT INTO employees 
         (employeeName, email, department, phoneNumber, address, password, role, status, force_password_reset) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            employeeName,
            email,
            department,
            phoneNumber,
            address,
            password,
            role,
            status,
            true, // `force_password_reset` siempre es `true` al crear empleados
        ]
    );

    await database.close();

    // Retorna el ID del nuevo empleado junto con los datos relevantes
    return { id_employee: result.lastID, ...employee };
};

// **Actualizar contraseña**
const updatePassword = async (id_employee, hashedPassword) => {
    const database = await db.openDatabase();

    // Actualiza la contraseña y desactiva el campo `force_password_reset`
    const result = await database.run(
        `UPDATE employees 
         SET password = ?, force_password_reset = ? 
         WHERE id_employee = ?`,
        [hashedPassword, false, id_employee]
    );

    await database.close();

    return result.changes > 0; // Devuelve `true` si se actualizó correctamente
};

// **Actualizar un empleado**
const updateEmployee = async (id_employee, employee) => {
    const { employeeName, email, department, phoneNumber, address, status } = employee;

    const database = await db.openDatabase();
    const result = await database.run(
        `UPDATE employees 
         SET employeeName = ?, email = ?, department = ?, phoneNumber = ?, address = ?, status = ? 
         WHERE id_employee = ?`,
        [employeeName, email, department, phoneNumber, address, status, id_employee]
    );

    await database.close();

    return result.changes > 0 ? { id_employee, ...employee } : null; // Devuelve `null` si no se actualizó
};

// **Eliminar un empleado (marcar como "baja")**
const deleteEmployee = async (id_employee) => {
    const database = await db.openDatabase();
    const deletedAt = new Date().toISOString(); // Fecha y hora actuales en formato ISO

    const result = await database.run(
        `UPDATE employees 
         SET status = 'baja', deleted_at = ? 
         WHERE id_employee = ?`,
        [deletedAt, id_employee]
    );

    await database.close();

    return result.changes > 0; // Devuelve `true` si se actualizó el registro
};

// **Verificar si un ID de empleado existe**
const checkEmployeeIdExists = async (id_employee) => {
    const database = await db.openDatabase();
    const employee = await database.get(
        'SELECT id_employee FROM employees WHERE id_employee = ?',
        [id_employee]
    );
    await database.close();

    return !!employee; // Devuelve `true` si el empleado existe
};

// **Obtener un empleado por email**
const getEmployeeByEmail = async (email) => {
    const database = await db.openDatabase();
    const employee = await database.get(
        'SELECT * FROM employees WHERE email = ?',
        [email]
    );
    await database.close();

    return employee; // Devuelve `undefined` si no encuentra al empleado
};

// Exportar funciones del repositorio
module.exports = {
    getEmployeesWithPaginationAndFilters,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updatePassword,
    checkEmployeeIdExists,
    getEmployeeByEmail,
};