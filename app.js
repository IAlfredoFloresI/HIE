require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const morgan = require('morgan');

const employeeRoutes = require('./modules/employees/routes/employeeRoutes'); // Rutas de empleados
const authRouter = require('./modules/auth/authRouter'); // Rutas de autenticación

const app = express();
const PORT = process.env.PORT || 3000;

const debugRoutes = require('./modules/debugRoutes'); // Importa la ruta de depuración
app.use('/debug', debugRoutes); // Usa el prefijo "/debug" para acceder al endpoint

// Middleware para CORS
const corsOptions = {
    origin:'*',  //['http://localhost:3000', 'http://187.189.0.114', 'http://127.0.0.1:5501/'], // Orígenes permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: false, // Permitir cookies (si es necesario) true*
};
app.use(cors(corsOptions));

// Middleware para registrar las solicitudes
app.use(morgan('combined'));

// Middleware para parsear JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de autenticación
app.use('/auth', authRouter);

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
                url: 'https://hie-3f29.onrender.com',
                description: 'Servidor de producción'
            },
            {
                url: 'http://localhost:3000',
                description: 'Servidor local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./modules/employees/routes/*.js', './modules/auth/authRouter.js'], // Rutas a los archivos de Swagger
};

// Generación de la documentación Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de la API de empleados
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

// Prueba rama eduardo
