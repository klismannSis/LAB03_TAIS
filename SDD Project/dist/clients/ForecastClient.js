// src/clients/ForecastClient.ts - Cliente HTTP para la API de pron�stico
// Tarea 3.3: Implementar cliente HTTP con timeout de 10 segundos
// Requisitos: 3.1, 3.3
/**
 * Cliente HTTP para la API de pron�stico de Open-Meteo
 * Implementa timeout de 10 segundos con AbortController
 *
 * @param latitude - Latitud en grados decimales
 * @param longitude - Longitud en grados decimales
 * @returns Respuesta HTTP cruda o error de red/timeout
 * @throws Error de red o timeout
 */
export async function fetchForecastData(latitude, longitude) {
    // Validar coordenadas (seg�n requisito 3.1)
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('Latitud inv�lida. Debe estar entre -90 y 90');
    }
    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Longitud inv�lida. Debe estar entre -180 y 180');
    }
    // Construir URL seg�n requisito 3.1
    // Nota: El par�metro actual usa relative_humidity_2m (nombre actual de la API)
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m,relative_humidity_2m,precipitation'
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    // Crear AbortController para timeout de 10 segundos (requisito 3.3)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    try {
        // Realizar solicitud con timeout
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });
        // Limpiar timeout
        clearTimeout(timeoutId);
        return response;
    }
    catch (error) {
        // Limpiar timeout en caso de error
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('TIMEOUT', { cause: 'La solicitud a la API de pron�stico excedi� el tiempo l�mite de 10 segundos' });
        }
        // Error de red
        throw new Error('NETWORK_ERROR', { cause: 'Error de red al conectar con el servicio de pron�stico' });
    }
}
//# sourceMappingURL=ForecastClient.js.map