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

// Eliminar un empleado
const deleteEmployee = async (id) => {
    const database = await db.openDatabase();
    const result = await database.run('DELETE FROM employees WHERE id_employee = ?', [id]);
    await database.close();
    return result.changes > 0;
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

module.exports = {
    getAllEmployees,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployeesByName,
};
