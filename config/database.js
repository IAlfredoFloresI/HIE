const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Definimos los empleados iniciales
const employees = [
    { "id_employee": 1, "employeeName": "Juan Pérez", "email": "juan.perez@example.com", "department": "Recepción", "phoneNumber": "555-1234", "address": "Calle Falsa 123", "status": "activo" },
    { "id_employee": 2, "employeeName": "María López", "email": "maria.lopez@example.com", "department": "Cocina", "phoneNumber": "555-5678", "address": "Avenida Siempre Viva 742", "status": "baja" },
    { "id_employee": 3, "employeeName": "Pedro Ramírez", "email": "pedro.ramirez@example.com", "department": "Mantenimiento", "phoneNumber": "555-9012", "address": "Calle Luna 456", "status": "activo" },
    { "id_employee": 4, "employeeName": "Lucía Fernández", "email": "lucia.fernandez@example.com", "department": "Administración", "phoneNumber": "555-3456", "address": "Calle Sol 789", "status": "baja" },
    { "id_employee": 5, "employeeName": "Carlos González", "email": "carlos.gonzalez@example.com", "department": "Seguridad", "phoneNumber": "555-7890", "address": "Calle Estrella 321", "status": "activo" },
    { "id_employee": 6, "employeeName": "Ana Torres", "email": "ana.torres@example.com", "department": "Recepción", "phoneNumber": "555-2345", "address": "Calle Primavera 111", "status": "baja" },
    { "id_employee": 7, "employeeName": "Roberto Gómez", "email": "roberto.gomez@example.com", "department": "Cocina", "phoneNumber": "555-6789", "address": "Avenida Otoño 222", "status": "activo" },
    { "id_employee": 8, "employeeName": "Laura Sánchez", "email": "laura.sanchez@example.com", "department": "Ventas", "phoneNumber": "555-5678", "address": "Calle Invierno 333", "status": "baja" },
    { "id_employee": 9, "employeeName": "Luis Morales", "email": "luis.morales@example.com", "department": "Almacén", "phoneNumber": "555-9012", "address": "Avenida Verano 444", "status": "activo" },
    { "id_employee": 10, "employeeName": "Elena Castillo", "email": "elena.castillo@example.com", "department": "Administración", "phoneNumber": "555-3456", "address": "Calle Amanecer 555", "status": "baja" },
    { "id_employee": 11, "employeeName": "David Herrera", "email": "david.herrera@example.com", "department": "Mantenimiento", "phoneNumber": "555-7890", "address": "Calle Anochecer 666", "status": "activo" },
    { "id_employee": 12, "employeeName": "Carmen Ríos", "email": "carmen.rios@example.com", "department": "Recepción", "phoneNumber": "555-2345", "address": "Calle Cielo 777", "status": "baja" },
    { "id_employee": 13, "employeeName": "José Ramírez", "email": "jose.ramirez@example.com", "department": "Cocina", "phoneNumber": "555-6789", "address": "Avenida Mar 888", "status": "activo" },
    { "id_employee": 14, "employeeName": "Sara Gutiérrez", "email": "sara.gutierrez@example.com", "department": "Ventas", "phoneNumber": "555-5678", "address": "Calle Tierra 999", "status": "baja" },
    { "id_employee": 15, "employeeName": "Daniela Vargas", "email": "daniela.vargas@example.com", "department": "Almacén", "phoneNumber": "555-9012", "address": "Calle Río 101", "status": "activo" },
    { "id_employee": 16, "employeeName": "Mario Díaz", "email": "mario.diaz@example.com", "department": "Seguridad", "phoneNumber": "555-3456", "address": "Avenida Montaña 202", "status": "baja" },
    { "id_employee": 17, "employeeName": "Patricia Romero", "email": "patricia.romero@example.com", "department": "Recepción", "phoneNumber": "555-7890", "address": "Calle Bosque 303", "status": "activo" },
    { "id_employee": 18, "employeeName": "Antonio Navarro", "email": "antonio.navarro@example.com", "department": "Mantenimiento", "phoneNumber": "555-2345", "address": "Calle Pradera 404", "status": "baja" },
    { "id_employee": 19, "employeeName": "Paula Carrillo", "email": "paula.carrillo@example.com", "department": "Administración", "phoneNumber": "555-6789", "address": "Calle Lago 505", "status": "activo" },
    { "id_employee": 20, "employeeName": "Jorge Ruiz", "email": "jorge.ruiz@example.com", "department": "Seguridad", "phoneNumber": "555-5678", "address": "Avenida Bosque 606", "status": "baja" },
    { "id_employee": 21, "employeeName": "Sofía Pérez", "email": "sofia.perez@example.com", "department": "Cocina", "phoneNumber": "555-9012", "address": "Calle Lluvia 707", "status": "activo" },
    { "id_employee": 22, "employeeName": "Ricardo Soto", "email": "ricardo.soto@example.com", "department": "Ventas", "phoneNumber": "555-3456", "address": "Avenida Brisa 808", "status": "baja" },
    { "id_employee": 23, "employeeName": "Julia Ortega", "email": "julia.ortega@example.com", "department": "Almacén", "phoneNumber": "555-7890", "address": "Calle Tormenta 909", "status": "activo" },
    { "id_employee": 24, "employeeName": "Carlos Méndez", "email": "carlos.mendez@example.com", "department": "Administración", "phoneNumber": "555-2345", "address": "Calle Mar 111", "status": "baja" },
    { "id_employee": 25, "employeeName": "Gabriela Moreno", "email": "gabriela.moreno@example.com", "department": "Mantenimiento", "phoneNumber": "555-6789", "address": "Avenida Loma 222", "status": "activo" },
    { "id_employee": 26, "employeeName": "Fernando Gil", "email": "fernando.gil@example.com", "department": "Seguridad", "phoneNumber": "555-5678", "address": "Calle Nube 333", "status": "baja" },
    { "id_employee": 27, "employeeName": "Laura Flores", "email": "laura.flores@example.com", "department": "Recepción", "phoneNumber": "555-9012", "address": "Avenida Rayo 444", "status": "activo" },
    { "id_employee": 28, "employeeName": "Francisco Vega", "email": "francisco.vega@example.com", "department": "Cocina", "phoneNumber": "555-3456", "address": "Calle Viento 555", "status": "baja" },
    { "id_employee": 29, "employeeName": "Isabel Cortés", "email": "isabel.cortes@example.com", "department": "Ventas", "phoneNumber": "555-7890", "address": "Avenida Trueno 666", "status": "activo" },
    { "id_employee": 30, "employeeName": "Esteban Espinoza", "email": "esteban.espinoza@example.com", "department": "Almacén", "phoneNumber": "555-2345", "address": "Calle Relámpago 777", "status": "baja" },
    { "id_employee": 31, "employeeName": "Marta Aguilar", "email": "marta.aguilar@example.com", "department": "Administración", "phoneNumber": "555-6789", "address": "Avenida Luz 888", "status": "activo" },
    { "id_employee": 32, "employeeName": "Diego Salas", "email": "diego.salas@example.com", "department": "Mantenimiento", "phoneNumber": "555-5678", "address": "Calle Aurora 999", "status": "baja" },
    { "id_employee": 33, "employeeName": "Valeria Campos", "email": "valeria.campos@example.com", "department": "Seguridad", "phoneNumber": "555-9012", "address": "Avenida Horizonte 101", "status": "activo" },
    { "id_employee": 34, "employeeName": "Héctor Serrano", "email": "hector.serrano@example.com", "department": "Recepción", "phoneNumber": "555-3456", "address": "Calle Atardecer 202", "status": "baja" },
    { "id_employee": 35, "employeeName": "Alicia Blanco", "email": "alicia.blanco@example.com", "department": "Cocina", "phoneNumber": "555-7890", "address": "Avenida Amanecer 303", "status": "activo" },
    { "id_employee": 36, "employeeName": "Javier Paredes", "email": "javier.paredes@example.com", "department": "Ventas", "phoneNumber": "555-2345", "address": "Calle Estrella 404", "status": "baja" },
    { "id_employee": 37, "employeeName": "Eva Gálvez", "email": "eva.galvez@example.com", "department": "Almacén", "phoneNumber": "555-6789", "address": "Avenida Cometa 505", "status": "activo" },
    { "id_employee": 38, "employeeName": "Pablo Rivas", "email": "pablo.rivas@example.com", "department": "Administración", "phoneNumber": "555-5678", "address": "Calle Lluvia 606", "status": "baja" },
    { "id_employee": 39, "employeeName": "Mónica Medina", "email": "monica.medina@example.com", "department": "Mantenimiento", "phoneNumber": "", "address": "", "status": "activo" }
];


// Función para inicializar la base de datos
async function initializeDatabase() {
    let db;
    try {
        // Intentamos abrir la base de datos
        db = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });

        console.log('Conexión establecida con la base de datos.');

        // Intentamos crear la tabla si no existe
        await db.exec(`CREATE TABLE IF NOT EXISTS employees (
            id_employee INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeName TEXT NOT NULL,
            email TEXT NOT NULL,
            department TEXT NOT NULL,
            phoneNumber TEXT,
            address TEXT,
            status TEXT CHECK(status IN ('activo', 'baja')) NOT NULL
        )`);
        console.log('Tabla "employees" verificada/existente.');

        // Verificar si la tabla ya tiene datos
        const { count } = await db.get('SELECT COUNT(*) AS count FROM employees');

        if (count === 0) {
            console.log('La tabla "employees" está vacía. Insertando datos iniciales...');
            await insertInitialEmployees(db);  // Insertar empleados iniciales
        } else {
            console.log(`La tabla "employees" ya contiene ${count} registros.`);
        }

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error.message);
        throw new Error('No se pudo inicializar la base de datos. Revisa la conexión y configuración.');
    } finally {
        // Asegurarse de cerrar la conexión a la base de datos si existe
        if (db) {
            await db.close();
            console.log('Conexión cerrada.');
        }
    }
}

// Función para insertar los empleados iniciales
async function insertInitialEmployees(db) {
    try {
        const stmt = await db.prepare(`INSERT INTO employees (employeeName, email, department, phoneNumber, address, status) 
                                       VALUES (?, ?, ?, ?, ?, ?)`);

        // Insertar cada empleado en la base de datos
        for (const emp of employees) {
            await stmt.run(emp.employeeName, emp.email, emp.department, emp.phoneNumber, emp.address, emp.status);
            console.log(`Empleado insertado: ${emp.employeeName}`);
        }

        await stmt.finalize();
        console.log('Datos iniciales insertados con éxito.');
    } catch (error) {
        console.error('Error al insertar los empleados iniciales:', error.message);
        throw new Error('Fallo al insertar los empleados en la base de datos.');
    }
}

// Exportar la función para inicializar la base de datos
module.exports = initializeDatabase;

// Llamada a la función para inicializar la base de datos
initializeDatabase().catch(err => {
    console.error(err.message);
});