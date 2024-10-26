const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const employeeRoutes = require('./modules/employees/routes/employeeRoutes'); // Rutas de empleados
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS
const corsOptions = {
    origin: ['http://localhost:4200'], // Orígenes permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true, // Permitir cookies (si es necesario)
};

app.use(cors(corsOptions));


// Middleware para registrar las solicitudes
app.use(morgan('combined'));

// Middleware para parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Employee API',
            version: '1.0.0',
            description: 'API para manejar empleados',
            contact: {
                name: 'Eduardo Flores',
                email: 'eduardoflores121298@gmail.com',
                url: 'https://github.com/EduardoFlores117/HIE.git',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./modules/employees/routes/*.js'], // Rutas a los archivos de Swagger
};

// Generación de la documentación Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de la API
app.use('/api/employees', employeeRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//prueba rama eduardo