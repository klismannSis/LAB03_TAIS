import { WeatherData } from '../types/index.js';
export declare class WeatherDisplay {
    private container;
    private cityNameElement;
    private temperatureElement;
    private humidityElement;
    private precipitationElement;
    constructor(container: HTMLElement);
    private initialize;
    private createWeatherCard;
    update(cityName: string, weatherData: WeatherData, userInputCityName?: string): void;
    clear(): void;
    setVisible(visible: boolean): void;
}
//# sourceMappingURL=WeatherDisplay.d.ts.map