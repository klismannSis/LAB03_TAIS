// src/services/ForecastService.ts - Servicio de lógica de pronóstico
// Tarea 5.1: Implementar servicio de pronóstico
// Requisitos: 3.2, 3.3, 3.4, 3.5, 5.2, 5.4, 5.5
import { fetchForecastData } from '../clients/ForecastClient.js';
/**
 * Servicio de pronóstico del clima
 * Maneja la lógica de negocio para obtener datos meteorológicos
 */
export class ForecastService {
    /**
     * Obtiene el pronóstico del clima para coordenadas específicas
     * @param latitude - Latitud
     * @param longitude - Longitud
     * @returns Resultado del pronóstico
     */
    async getForecast(latitude, longitude) {
        try {
            // 1. Obtener respuesta de la API
            const response = await fetchForecastData(latitude, longitude);
            // 2. Verificar código HTTP (requisito 3.4, 5.4)
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
            let data;
            try {
                data = await response.json();
            }
            catch (parseError) {
                return {
                    success: false,
                    error: { type: 'INVALID_RESPONSE' }
                };
            }
            // 4. Validar campos requeridos (requisito 3.5)
            if (!data.current) {
                return {
                    success: false,
                    error: { type: 'INCOMPLETE_DATA' }
                };
            }
            const current = data.current;
            // Verificar cada campo individualmente
            if (current.temperature_2m == null ||
                current.relative_humidity_2m == null ||
                current.precipitation == null) {
                return {
                    success: false,
                    error: { type: 'INCOMPLETE_DATA' }
                };
            }
            // 5. Extraer datos del clima (requisito 3.2, 5.2)
            const weatherData = {
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                precipitation: current.precipitation
            };
            return {
                success: true,
                data: weatherData
            };
        }
        catch (error) {
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
                        // Errores de validación del cliente
                        if (error.message.includes('inválida')) {
                            return {
                                success: false,
                                error: { type: 'INVALID_RESPONSE' }
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
//# sourceMappingURL=ForecastService.js.map