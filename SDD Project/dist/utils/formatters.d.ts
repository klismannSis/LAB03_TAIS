/**
 * Formatea temperatura en grados Celsius (requisito 5.3)
 * @param value - Temperatura en grados Celsius
 * @returns Temperatura formateada con máximo 1 decimal y unidad Celsius
 */
export declare function formatTemperature(value: number): string;
/**
 * Formatea humedad relativa (requisito 5.3)
 * @param value - Humedad en %
 * @returns Humedad formateada como entero + "%"
 */
export declare function formatHumidity(value: number): string;
/**
 * Formatea precipitaci�n (requisito 5.3)
 * @param value - Precipitaci�n en mm
 * @returns Precipitación formateada con máximo 1 decimal y unidad mm
 */
export declare function formatPrecipitation(value: number): string;
/**
 * Valida si un string está vacío o contiene solo espacios en blanco (requisito 1.3, 1.4, 2.5)
 * @param input - Texto a validar
 * @returns true si está vacío o solo whitespace
 */
export declare function isEmptyOrWhitespace(input: string): boolean;
/**
 * Obtiene un mensaje de error amigable seg�n el tipo de error
 * @param error - Error a formatear
 * @returns Mensaje de error legible para el usuario
 */
export declare function formatErrorMessage(error: {
    type: string;
    statusCode?: number;
}): string;
//# sourceMappingURL=formatters.d.ts.map