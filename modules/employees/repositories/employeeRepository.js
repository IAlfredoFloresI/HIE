const path = require('path');
const db = require(path.join(__dirname, '../../../db')); // Importar la función para abrir la base de datos
const removeAccents = require('remove-accents'); // Asegúrate de tener esta librería

const getEmployeesWithPaginationAndFilters = async ({ page = 1, limit = 10 }) => {
    const database = await db.openDatabase();

    try {
        // Calculamos el offset para la paginación
        const offset = (page - 1) * limit;

        // Consulta con solo la paginación
        const employees = await database.all(`SELECT * FROM employees LIMIT ? OFFSET ?`, [limit, offset]);

        await database.close();
        return employees;
    } catch (error) {
        await database.close();
        console.error("Error en la consulta con paginación:", error.message);
        throw new Error(`Error en la consulta con paginación: ${error.message}`);
    }
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
