// src/components/WeatherDisplay.ts - Componente de visualizaci�n del clima
// Tarea 8.5: Implementar componente UI para mostrar datos del clima
// Requisitos: 4.1, 4.2, 4.3, 4.4, 4.7

import { formatTemperature, formatHumidity, formatPrecipitation } from '../utils/formatters.js';
import { WeatherData } from '../types/index.js';

export class WeatherDisplay {
  private cityNameElement!: HTMLElement;
  private temperatureElement!: HTMLElement;
  private humidityElement!: HTMLElement;
  private precipitationElement!: HTMLElement;
  
  constructor(private container: HTMLElement) {
    this.initialize();
  }

  private initialize(): void {
    // Crear elementos DOM (requisito 4.1, 4.2, 4.3, 4.4)
    const weatherContainer = document.createElement('div');
    weatherContainer.className = 'weather-container';
    
    this.cityNameElement = document.createElement('h2');
    this.cityNameElement.id = 'cityName';
    this.cityNameElement.className = 'city-name';
    
    const weatherData = document.createElement('div');
    weatherData.className = 'weather-data';
    
    // Tarjeta de temperatura
    const tempCard = this.createWeatherCard('temperature', 'Temperatura', 'fas fa-temperature-high');
    this.temperatureElement = tempCard.valueElement;
    
    // Tarjeta de humedad
    const humidityCard = this.createWeatherCard('humidity', 'Humedad', 'fas fa-tint');
    this.humidityElement = humidityCard.valueElement;
    
    // Tarjeta de precipitaci�n
    const precipitationCard = this.createWeatherCard('precipitation', 'Precipitaci\u00F3n', 'fas fa-cloud-rain');
    this.precipitationElement = precipitationCard.valueElement;
    
    // Ensamblar elementos
    weatherData.appendChild(tempCard.element);
    weatherData.appendChild(humidityCard.element);
    weatherData.appendChild(precipitationCard.element);
    
    weatherContainer.appendChild(this.cityNameElement);
    weatherContainer.appendChild(weatherData);
    
    this.container.appendChild(weatherContainer);
  }

  private createWeatherCard(id: string, label: string, iconClass: string): { element: HTMLElement, valueElement: HTMLElement } {
    const card = document.createElement('div');
    card.className = 'weather-card';
    
    const icon = document.createElement('div');
    icon.className = 'weather-icon';
      icon.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
    
    const info = document.createElement('div');
    info.className = 'weather-info';
    
    const heading = document.createElement('h3');
    heading.textContent = label;
    
    const valueElement = document.createElement('p');
    valueElement.id = id;
    valueElement.className = 'weather-value';
    valueElement.textContent = '--';
    
    info.appendChild(heading);
    info.appendChild(valueElement);
    
    card.appendChild(icon);
    card.appendChild(info);
    
    return { element: card, valueElement };
  }

  update(cityName: string, weatherData: WeatherData, userInputCityName: string = ''): void {
    // Usar el nombre de la API o fallback al nombre del usuario (requisito 4.7)
    const displayCityName = cityName && cityName.trim() !== '' 
      ? cityName 
      : userInputCityName || 'Ciudad desconocida';
    
    this.cityNameElement.textContent = displayCityName;
    this.temperatureElement.textContent = formatTemperature(weatherData.temperature);
    this.humidityElement.textContent = formatHumidity(weatherData.humidity);
    this.precipitationElement.textContent = formatPrecipitation(weatherData.precipitation);
    
    // Mostrar la secci�n
    this.container.hidden = false;
  }

  clear(): void {
    this.cityNameElement.textContent = '';
    this.temperatureElement.textContent = '--';
    this.humidityElement.textContent = '--';
    this.precipitationElement.textContent = '--';
    this.container.hidden = true;
  }

  setVisible(visible: boolean): void {
    this.container.hidden = !visible;
  }
}
