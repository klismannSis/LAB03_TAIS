export declare class WeatherController {
    private geocodingService;
    private forecastService;
    private citySearchForm;
    private weatherDisplay;
    private errorMessage;
    private loadingIndicator;
    private currentSearchCityName;
    private isLoading;
    constructor(options: {
        searchContainer: HTMLElement;
        loadingContainer: HTMLElement;
        errorContainer: HTMLElement;
        weatherContainer: HTMLElement;
    });
    private handleSearch;
    private handleGeocodingError;
    private handleForecastError;
    private handleSuccess;
    private getGeocodingErrorMessage;
    private getForecastErrorMessage;
    private resetState;
    initialize(): void;
}
//# sourceMappingURL=WeatherController.d.ts.map