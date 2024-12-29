const nodemailer = require('nodemailer');

/**
 * Enviar correo de notificación de check-in o check-out.
 * @param {string} email - Dirección de correo del empleado.
 * @param {string} name - Nombre del empleado.
 * @param {string} action - Acción realizada (Check-in o Check-out).
 * @param {string} recordDate - Fecha del registro.
 * @param {string} recordTime - Hora del registro.
 * @param {string} location - Ubicación de la acción (securityBooth o canteen).
 */
const sendCheckInOutNotification = async (email, name, action, recordDate, recordTime, location) => {
    const subject = `Notificación de ${action} - Holiday Inn Express`;

    // Determinar el mensaje dependiendo de la ubicación de la acción
    let locationMessage = '';
    if (location === 'security') {
        locationMessage = `Te notificamos que tu ${action} en la caseta de seguridad ha sido registrado exitosamente en nuestro sistema.`;
    } else if (location === 'canteen') {
        locationMessage = `Te notificamos que tu ${action} en el comedor ha sido registrado exitosamente en nuestro sistema.`;
    }

    const text = `
        Estimado/a ${name},

            ${locationMessage}

            Detalles del registro:
                - Acción: ${action}
                - Fecha: ${recordDate}
                - Hora: ${recordTime}

            Por favor, no respondas a este correo, ya que es generado automáticamente.  
            Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos en nuestra recepción o a través de nuestro equipo de soporte.

            Gracias por tu dedicación y esfuerzo.

            Atentamente,  
            El equipo de Recursos Humanos  
            Holiday Inn Express
    `;

    await sendEmail(email, subject, text);
};


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

module.exports = { sendEmail, sendPasswordChangeConfirmation, sendCheckInOutNotification};
