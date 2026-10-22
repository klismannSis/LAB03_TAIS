import { GeocodingResult } from '../types/index.js';
/**
 * Servicio de geocodificación
 * Maneja la lógica de negocio para convertir nombres de ciudad en coordenadas
 */
export declare class GeocodingService {
    /**
     * Geocodifica un nombre de ciudad
     * @param cityName - Nombre de la ciudad
     * @returns Resultado de la geocodificación
     */
    geocode(cityName: string): Promise<GeocodingResult>;
}
//# sourceMappingURL=GeocodingService.d.ts.map