const moment = require('moment');

// Calcular el rango de fechas basado en el período
const calculatePeriodRange = (period) => {
    const now = moment();

    if (period === 'quincena1') {
        return [now.startOf('month').format('YYYY-MM-DD'), now.date(13).format('YYYY-MM-DD')];
    } else if (period === 'quincena2') {
        return [now.date(14).format('YYYY-MM-DD'), now.endOf('month').format('YYYY-MM-DD')];
    } else if (period === 'mes') {
        return [now.startOf('month').format('YYYY-MM-DD'), now.endOf('month').format('YYYY-MM-DD')];
    }

    throw new Error('Período inválido.');
};

module.exports = calculatePeriodRange;
