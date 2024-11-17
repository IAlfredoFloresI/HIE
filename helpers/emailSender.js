const nodemailer = require('nodemailer');

/**
 * Enviar un correo genérico.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} text - Contenido del correo en texto plano.
 */
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

/**
 * Enviar correo de confirmación de cambio de contraseña.
 * @param {string} email - Dirección de correo del empleado.
 * @param {string} name - Nombre del empleado.
 */
const sendPasswordChangeConfirmation = async (email, name) => {
    const subject = 'Confirmación de cambio de contraseña';
    const text = `
Hola ${name},

Te confirmamos que el cambio de contraseña de tu cuenta ha sido realizado con éxito. A continuación, te recordamos algunas recomendaciones importantes:

- No compartas tu contraseña con nadie.
- Asegúrate de que tu contraseña sea única y difícil de adivinar.
- Si no reconoces este cambio, contacta a nuestro equipo de soporte de inmediato.

Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.

Gracias,  
El equipo de soporte técnico  
Holiday Inn Express
    `;

    await sendEmail(email, subject, text);
};

module.exports = { sendEmail, sendPasswordChangeConfirmation };
