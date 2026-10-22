// src/services/GeocodingService.ts - Servicio de lógica de geocodificación
// Tarea 4.1: Implementar servicio de geocodificación
// Requisitos: 2.2, 2.3, 2.4, 2.6, 5.1, 5.4, 5.5

import { fetchGeocodingData } from '../clients/GeocodingClient.js';
import { GeocodingResult, GeocodingApiResponse, Coordinates } from '../types/index.js';

/**
 * Servicio de geocodificación
 * Maneja la lógica de negocio para convertir nombres de ciudad en coordenadas
 */
export class GeocodingService {
  /**
   * Geocodifica un nombre de ciudad
   * @param cityName - Nombre de la ciudad
   * @returns Resultado de la geocodificación
   */
  async geocode(cityName: string): Promise<GeocodingResult> {
    try {
      // 1. Obtener respuesta de la API
      const response = await fetchGeocodingData(cityName);

      // 2. Verificar código HTTP (requisito 5.4)
      if (!response.ok) {
        return {
          success: false,
          error: {
            type: 'SERVICE_ERROR',
            statusCode: response.status
          }
        };
      }

      // 3. Parsear JSON (requisito 5.5)
      let data: GeocodingApiResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        return {
          success: false,
          error: { type: 'INVALID_RESPONSE' }
        };
      }

      // 4. Validar que haya resultados (requisito 2.3)
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        return {
          success: false,
          error: { type: 'CITY_NOT_FOUND' }
        };
      }

      const firstResult = data.results[0];

      // 5. Validar campos requeridos (requisito 2.6)
      if (firstResult.latitude == null || firstResult.longitude == null) {
        return {
          success: false,
          error: { type: 'CITY_NOT_FOUND' }
        };
      }

      // 6. Extraer coordenadas (requisito 2.2, 5.1)
      const coordinates: Coordinates = {
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
        cityName: firstResult.name || cityName.trim()
      };

      return {
        success: true,
        data: coordinates
      };

    } catch (error) {
      // Manejar errores de red y timeout
      if (error instanceof Error) {
        switch (error.message) {
          case 'NETWORK_ERROR':
            return {
              success: false,
              error: { type: 'NETWORK_ERROR' }
            };
          case 'TIMEOUT':
            return {
              success: false,
              error: { type: 'TIMEOUT' }
            };
          default:
            // Error de validación del cliente
            if (error.message === 'El nombre de la ciudad no puede estar vacío') {
              return {
                success: false,
                error: { type: 'CITY_NOT_FOUND' }
              };
            }
        }
      }
      
      // Error inesperado
      return {
        success: false,
        error: { type: 'INVALID_RESPONSE' }
      };
    }
  }
}
