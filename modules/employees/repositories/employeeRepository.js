const path = require('path');
const db = require(path.join(__dirname, '../../../db')); // Importar la función para abrir la base de datos

// Obtener todos los empleados
const getAllEmployees = async () => {
    const database = await db.openDatabase();
    const employees = await database.all('SELECT * FROM employees');
    await database.close();
    return employees;
};

// Obtener un empleado por ID
const getEmployeeById = async (id) => {
    const database = await db.openDatabase();
    const employee = await database.get('SELECT * FROM employees WHERE id_employee = ?', id);
    await database.close();
    return employee;
};

// Crear un nuevo empleado
const addEmployee = async (employee) => {
    const { employeeName, email, department, phoneNumber, address, status } = employee;
    const database = await db.openDatabase();
    const result = await database.run(
        `INSERT INTO employees (employeeName, email, department, phoneNumber, address, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [employeeName, email, department, phoneNumber, address, status]
    );
    await database.close();
    return { id_employee: result.lastID, ...employee };
};

// Actualizar un empleado
const updateEmployee = async (id, employee) => {
    const { employeeName, email, department, phoneNumber, address, status } = employee;
    const database = await db.openDatabase();
    const result = await database.run(
        `UPDATE employees SET employeeName = ?, email = ?, department = ?, phoneNumber = ?, address = ?, status = ? WHERE id_employee = ?`,
        [employeeName, email, department, phoneNumber, address, status, id]
    );
    await database.close();
    return result.changes > 0 ? { id_employee: id, ...employee } : null;
};

// Eliminar (desactivar) un empleado
const deleteEmployee = async (id) => {
    const database = await db.openDatabase();
    const deletedAt = new Date().toISOString(); // Fecha y hora actual en formato ISO

    const result = await database.run(
        `UPDATE employees SET status = 'baja', deleted_at = ? WHERE id_employee = ?`,
        [deletedAt, id]
    );

    await database.close();
    return result.changes > 0; // Devuelve true si se actualizó un registro
};

// Buscar empleados por nombre en la base de datos
const searchEmployeesByName = async (name) => {
    const normalizedSearch = `%${name.toLowerCase()}%`; // Coincidencia parcial en cualquier parte
    const database = await db.openDatabase();

    const employees = await database.all(
        `SELECT * FROM employees WHERE LOWER(employeeName) LIKE ?`,
        [normalizedSearch]
    );

    await database.close();
    return employees;
};

const checkEmployeeIdExists = async (id_employee) => {
    const database = await db.openDatabase();
    const employee = await database.get(
        'SELECT * FROM employees WHERE id_employee = ?',
        id_employee
    );
    await database.close();
    return employee !== undefined;
};
// Obtener empleados con paginación y filtros
const getEmployeesWithPaginationAndFilters = async ({ page = 1, limit = 10, status, department, searchTerm }) => {
    const database = await db.openDatabase();

    // Calculamos el offset para la paginación
    const offset = (page - 1) * limit;

    // Construimos la consulta con filtros dinámicos
    let query = `SELECT * FROM employees WHERE 1=1`;
    const params = [];

    // Agregar filtro de estado si se proporciona
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    // Agregar filtro de departamento si se proporciona
    if (department) {
        query += ` AND department = ?`;
        params.push(department);
    }

    // Agregar filtro de búsqueda si se proporciona
    if (searchTerm) {
        query += ` AND LOWER(employeeName) LIKE ?`;
        params.push(`%${searchTerm.toLowerCase()}%`);
    }

    // Agregar paginación
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Ejecutamos la consulta
    const employees = await database.all(query, params);

    await database.close();
    return employees;
};

module.exports = {
    getEmployeesWithPaginationAndFilters,
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployeesByName,
};
