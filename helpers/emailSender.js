const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        // Configuración del transporte
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Cambiar según tu proveedor de correo
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Opciones del correo
        const mailOptions = {
            from: `"No-Reply [Holiday Inn Express]" <${process.env.EMAIL_USER}>`, // Nombre y correo de remitente
            to, // Destinatario
            subject, // Asunto
            text: `${text}\n\nPor favor, no respondas a este correo.`, // Contenido del correo
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error al enviar correo: ${error.message}`);
        throw new Error('No se pudo enviar el correo.');
    }
};

module.exports = sendEmail;
