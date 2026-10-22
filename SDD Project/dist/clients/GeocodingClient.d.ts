/**
 * Cliente HTTP para la API de geocodificaci�n de Open-Meteo
 * Implementa timeout de 10 segundos con AbortController
 *
 * @param cityName - Nombre de la ciudad a geocodificar
 * @returns Respuesta HTTP cruda o error de red/timeout
 * @throws Error de red o timeout
 */
export declare function fetchGeocodingData(cityName: string): Promise<Response>;
//# sourceMappingURL=GeocodingClient.d.ts.map