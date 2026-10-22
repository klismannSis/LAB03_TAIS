// src/utils/formatters.ts - Utilidades de formateo de valores
// Tarea 7.1: Implementar funciones de formateo
// Requisito: 5.3
/**
 * Formatea temperatura en grados Celsius (requisito 5.3)
 * @param value - Temperatura en grados Celsius
 * @returns Temperatura formateada con máximo 1 decimal y unidad Celsius
 */
export function formatTemperature(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'N/A \u00B0C';
    }
    return `${value.toFixed(1)} \u00B0C`;
}
/**
 * Formatea humedad relativa (requisito 5.3)
 * @param value - Humedad en %
 * @returns Humedad formateada como entero + "%"
 */
export function formatHumidity(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'N/A %';
    }
    const roundedValue = Math.round(value);
    const normalizedValue = Object.is(roundedValue, -0) ? 0 : roundedValue;
    const integerValue = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        useGrouping: false
    }).format(normalizedValue);
    return `${integerValue} %`;
}
/**
 * Formatea precipitaci�n (requisito 5.3)
 * @param value - Precipitaci�n en mm
 * @returns Precipitación formateada con máximo 1 decimal y unidad mm
 */
export function formatPrecipitation(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return 'N/A mm';
    }
    return `${value.toFixed(1)} mm`;
}
/**
 * Valida si un string está vacío o contiene solo espacios en blanco (requisito 1.3, 1.4, 2.5)
 * @param input - Texto a validar
 * @returns true si está vacío o solo whitespace
 */
export function isEmptyOrWhitespace(input) {
    return !input || input.trim().length === 0;
}
/**
 * Obtiene un mensaje de error amigable seg�n el tipo de error
 * @param error - Error a formatear
 * @returns Mensaje de error legible para el usuario
 */
export function formatErrorMessage(error) {
    switch (error.type) {
        // Errores de geocodificaci�n
        case 'CITY_NOT_FOUND':
            return 'No se encontr� la ciudad ingresada. Verifica el nombre e intenta de nuevo.';
        case 'NETWORK_ERROR':
            return 'El servicio de geocodificaci�n no est� disponible. Verifica tu conexi�n a internet.';
        case 'TIMEOUT':
            return 'El servicio de geocodificaci�n no respondi� a tiempo. Intenta nuevamente.';
        case 'SERVICE_ERROR':
            return `El servicio de geocodificaci�n retorn� un error (c�digo ${error.statusCode}).`;
        case 'INVALID_RESPONSE':
            return 'Los datos recibidos del servicio de geocodificaci�n no son v�lidos.';
        // Errores de pron�stico
        case 'INCOMPLETE_DATA':
            return 'Los datos meteorol�gicos recibidos est�n incompletos.';
        // Errores gen�ricos
        default:
            return 'Ocurri� un error inesperado. Por favor, intenta nuevamente.';
    }
}
//# sourceMappingURL=formatters.js.map