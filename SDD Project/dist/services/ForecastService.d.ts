import { ForecastResult } from '../types/index.js';
/**
 * Servicio de pronóstico del clima
 * Maneja la lógica de negocio para obtener datos meteorológicos
 */
export declare class ForecastService {
    /**
     * Obtiene el pronóstico del clima para coordenadas específicas
     * @param latitude - Latitud
     * @param longitude - Longitud
     * @returns Resultado del pronóstico
     */
    getForecast(latitude: number, longitude: number): Promise<ForecastResult>;
}
//# sourceMappingURL=ForecastService.d.ts.map