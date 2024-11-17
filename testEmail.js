require('dotenv').config(); // Asegúrate de cargar las variables de entorno
const nodemailer = require('nodemailer');

async function testSMTP() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Desde .env
                pass: process.env.EMAIL_PASS, // Desde .env
            },
        });

        // Verifica la conexión SMTP
        await transporter.verify();
        console.log('La conexión SMTP está funcionando correctamente.');
    } catch (error) {
        console.error('Error al verificar SMTP:', error.message);
    }
}

testSMTP();
//eliminar archivo