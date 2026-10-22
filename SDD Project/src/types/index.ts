// src/types/index.ts - Definiciones de tipos TypeScript
// Tarea 2.1: Crear archivo con todas las interfaces y tipos del dominio
// Requisitos: 2.2, 3.2, 5.1, 5.2

/**
 * Coordenadas geográficas retornadas por la API de geocodificación
 * Requisito 2.2, 5.1
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  cityName: string; // nombre retornado por la Geocoding API
}

/**
 * Datos meteorológicos retornados por la API de pronóstico
 * Requisito 3.2, 5.2
 */
export interface WeatherData {
  temperature: number;    // temperature_2m en °C (valor crudo)
  humidity: number;       // relative_humidity_2m en % (valor crudo)
  precipitation: number;  // precipitation en mm (valor crudo)
}

/**
 * Tipos de error en geocodificación
 */
export type GeocodingErrorType = 
  | { type: 'CITY_NOT_FOUND' }
  | { type: 'NETWORK_ERROR' }
  | { type: 'TIMEOUT' }
  | { type: 'SERVICE_ERROR'; statusCode: number }
  | { type: 'INVALID_RESPONSE' };

/**
 * Resultado de la geocodificación (discriminado por éxito/error)
 */
export type GeocodingResult = 
  | { success: true; data: Coordinates }
  | { success: false; error: GeocodingErrorType };

/**
 * Tipos de error en pronóstico
 */
export type ForecastErrorType =
  | { type: 'NETWORK_ERROR' }
  | { type: 'TIMEOUT' }
  | { type: 'SERVICE_ERROR'; statusCode: number }
  | { type: 'INCOMPLETE_DATA' }
  | { type: 'INVALID_RESPONSE' };

/**
 * Resultado del pronóstico (discriminado por éxito/error)
 */
export type ForecastResult =
  | { success: true; data: WeatherData }
  | { success: false; error: ForecastErrorType };

/**
 * Estado de la aplicación
 */
export type AppState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; cityName: string; weather: WeatherData }
  | { status: 'error'; message: string };

/**
 * Resultado de la API de geocodificación
 */
export interface GeocodingApiResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
  }>;
}

/**
 * Resultado de la API de pronóstico
 */
export interface ForecastApiResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
}
