// src/clients/GeocodingClient.ts - Cliente HTTP para la API de geocodificaci�n
// Tarea 3.1: Implementar cliente HTTP con timeout de 10 segundos
// Requisitos: 2.1, 2.4

/**
 * Cliente HTTP para la API de geocodificaci�n de Open-Meteo
 * Implementa timeout de 10 segundos con AbortController
 * 
 * @param cityName - Nombre de la ciudad a geocodificar
 * @returns Respuesta HTTP cruda o error de red/timeout
 * @throws Error de red o timeout
 */
export async function fetchGeocodingData(cityName: string): Promise<Response> {
  // Validar entrada (seg�n requisito 2.5)
  if (!cityName || cityName.trim().length === 0) {
    throw new Error('El nombre de la ciudad no puede estar vac�o');
  }

  // Codificar el nombre de la ciudad para URL
  const params = new URLSearchParams({ name: cityName.trim(), count: '1' });
  const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
  
  // Crear AbortController para timeout de 10 segundos (requisito 2.4)
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
  } catch (error) {
    // Limpiar timeout en caso de error
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT', { cause: 'La solicitud a la API de geocodificaci�n excedi� el tiempo l�mite de 10 segundos' });
    }

    // Error de red
    throw new Error('NETWORK_ERROR', { cause: 'Error de red al conectar con el servicio de geocodificaci�n' });
  }
}
