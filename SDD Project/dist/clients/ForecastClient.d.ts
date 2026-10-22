/**
 * Cliente HTTP para la API de pron�stico de Open-Meteo
 * Implementa timeout de 10 segundos con AbortController
 *
 * @param latitude - Latitud en grados decimales
 * @param longitude - Longitud en grados decimales
 * @returns Respuesta HTTP cruda o error de red/timeout
 * @throws Error de red o timeout
 */
export declare function fetchForecastData(latitude: number, longitude: number): Promise<Response>;
//# sourceMappingURL=ForecastClient.d.ts.map