const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gmail como proveedor
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Contraseña de aplicación
            },
        });

        const mailOptions = {
            from: `"Holiday Inn Express" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error al enviar correo: ${error.message}`);
        throw new Error('No se pudo enviar el correo. Intente nuevamente más tarde.');
    }
};

module.exports = sendEmail;
