const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateAttendanceReport = (employeeName, records) => {
    const doc = new PDFDocument();

    // Buffer para almacenar el PDF en memoria
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Encabezado del reporte
    doc.fontSize(16).text(`Reporte de Asistencias`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Empleado: ${employeeName}`);
    doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Tabla de registros
    records.forEach((record) => {
        doc.text(
            `Acción: ${record.action}, Fecha: ${record.record_date}, Hora: ${record.record_time}`
        );
    });

    doc.end();

    // Retornar el PDF como Buffer
    return new Promise((resolve, reject) => {
        doc.on('finish', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
    });
};

module.exports = {
    generateAttendanceReport,
};
