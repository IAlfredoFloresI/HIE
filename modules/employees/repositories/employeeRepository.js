const path = require('path');
const db = require(path.join(__dirname, '../../../db')); // Importar la función para abrir la base de datos
const removeAccents = require('remove-accents'); // Asegúrate de tener esta librería

// Obtener empleados con paginación y filtros
const getEmployeesWithPaginationAndFilters = async ({ page = 1, limit = 10, status, department, searchTerm }) => {
    const database = await db.openDatabase();

    // Convertimos page y limit a enteros para asegurarnos de que tienen un valor
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const offset = (page - 1) * limit;
    
    // Construimos la consulta base
    let query = `SELECT * FROM employees WHERE 1=1`;
    const params = [];

    // Filtro de estado
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    // Filtro de departamento
    if (department) {
        query += ` AND department = ?`;
        params.push(department);
    }

    // Paginación
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Ejecutar la consulta
    const employees = await database.all(query, params);
    await database.close();

    // Aplicar filtro de búsqueda en JavaScript
    if (searchTerm) {
        const normalizedSearchTerm = removeAccents(searchTerm.toLowerCase());
        return employees.filter(employee =>
            removeAccents(employee.employeeName.toLowerCase()).includes(normalizedSearchTerm)
        );
    }

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

const checkEmployeeIdExists = async (id_employee) => {
    const database = await db.openDatabase();
    const employee = await database.get(
        'SELECT * FROM employees WHERE id_employee = ?',
        id_employee
    );
    await database.close();
    return employee !== undefined;
};

module.exports = {
    getEmployeesWithPaginationAndFilters,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    checkEmployeeIdExists,
};
