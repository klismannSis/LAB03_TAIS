// src/WeatherController.ts - Controlador principal de la aplicación
// Tarea 9.1: Implementar controlador que orquesta el flujo completo
// Requisitos: 1.5, 1.6, 2.1-2.6, 3.1-3.5, 4.1-4.6
import { GeocodingService } from './services/GeocodingService.js';
import { ForecastService } from './services/ForecastService.js';
import { CitySearchForm } from './components/CitySearchForm.js';
import { WeatherDisplay } from './components/WeatherDisplay.js';
import { ErrorMessage } from './components/ErrorMessage.js';
import { LoadingIndicator } from './components/LoadingIndicator.js';
export class WeatherController {
    geocodingService;
    forecastService;
    citySearchForm;
    weatherDisplay;
    errorMessage;
    loadingIndicator;
    currentSearchCityName = '';
    isLoading = false;
    constructor(options) {
        this.geocodingService = new GeocodingService();
        this.forecastService = new ForecastService();
        this.citySearchForm = new CitySearchForm(options.searchContainer, (cityName) => this.handleSearch(cityName));
        this.weatherDisplay = new WeatherDisplay(options.weatherContainer);
        this.errorMessage = new ErrorMessage(options.errorContainer);
        this.loadingIndicator = new LoadingIndicator(options.loadingContainer);
        this.resetState();
    }
    async handleSearch(cityName) {
        if (this.isLoading)
            return;
        this.currentSearchCityName = cityName;
        this.resetState();
        this.isLoading = true;
        this.loadingIndicator.show();
        this.citySearchForm.setEnabled(false);
        try {
            // 1. Geocodificar ciudad (requisito 2.1)
            const geocodingResult = await this.geocodingService.geocode(cityName);
            if (!geocodingResult.success) {
                this.handleGeocodingError(geocodingResult.error, cityName);
                return;
            }
            const coordinates = geocodingResult.data;
            // 2. Obtener pronóstico (requisito 3.1)
            const forecastResult = await this.forecastService.getForecast(coordinates.latitude, coordinates.longitude);
            if (!forecastResult.success) {
                this.handleForecastError(forecastResult.error, cityName);
                return;
            }
            const weatherData = forecastResult.data;
            // 3. Mostrar resultados (requisito 4.1-4.4)
            this.handleSuccess(coordinates.cityName, weatherData, cityName);
        }
        catch (error) {
            console.error('Unexpected error:', error);
            this.errorMessage.show('Ocurrió un error inesperado. Intenta nuevamente.');
        }
        finally {
            this.isLoading = false;
            this.loadingIndicator.hide();
            this.citySearchForm.setEnabled(true);
            this.citySearchForm.focus();
        }
    }
    handleGeocodingError(error, cityName) {
        console.error('Geocoding error:', error);
        this.errorMessage.show(this.getGeocodingErrorMessage(error));
    }
    handleForecastError(error, cityName) {
        console.error('Forecast error:', error);
        this.errorMessage.show(this.getForecastErrorMessage(error));
    }
    handleSuccess(apiCityName, weatherData, userCityName) {
        this.weatherDisplay.update(apiCityName, weatherData, userCityName);
    }
    getGeocodingErrorMessage(error) {
        switch (error.type) {
            case 'CITY_NOT_FOUND':
                return 'No se encontró la ciudad ingresada. Verifica el nombre e intenta de nuevo.';
            case 'NETWORK_ERROR':
                return 'El servicio de geocodificación no está disponible. Verifica tu conexión.';
            case 'TIMEOUT':
                return 'El servicio de geocodificación no respondió a tiempo.';
            case 'SERVICE_ERROR':
                return `El servicio de geocodificación retornó un error (código ${error.statusCode}).`;
            case 'INVALID_RESPONSE':
                return 'Los datos recibidos del servicio de geocodificación no son válidos.';
        }
    }
    getForecastErrorMessage(error) {
        switch (error.type) {
            case 'NETWORK_ERROR':
                return 'El servicio de pronóstico no está disponible. Verifica tu conexión.';
            case 'TIMEOUT':
                return 'El servicio de pronóstico no respondió a tiempo.';
            case 'SERVICE_ERROR':
                return `El servicio de pronóstico retornó un error (código ${error.statusCode}).`;
            case 'INCOMPLETE_DATA':
                return 'Los datos meteorológicos recibidos están incompletos.';
            case 'INVALID_RESPONSE':
                return 'Los datos recibidos del servicio de pronóstico no son válidos.';
        }
    }
    resetState() {
        this.weatherDisplay.clear();
        this.errorMessage.clear();
        this.loadingIndicator.hide();
    }
    initialize() {
        this.citySearchForm.focus();
        console.log('WeatherController initialized');
    }
}
//# sourceMappingURL=WeatherController.js.map