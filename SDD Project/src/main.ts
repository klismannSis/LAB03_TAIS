// src/main.ts - Punto de entrada principal
// Tarea 11.1: Conectar todo en main.ts
// Requisitos: 1.1, 1.2, 4.5

import { WeatherController } from './WeatherController.js';

function initializeApp(): void {
  try {
    const searchContainer = document.querySelector('.search-container');
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const weatherSection = document.getElementById('weatherSection');

    if (!searchContainer || !loadingSection || !errorSection || !weatherSection) {
      throw new Error('Missing required DOM elements');
    }

    const weatherController = new WeatherController({
      searchContainer: searchContainer as HTMLElement,
      loadingContainer: loadingSection,
      errorContainer: errorSection,
      weatherContainer: weatherSection
    });

    weatherController.initialize();
    console.log('Weather forecast app initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    const errorSection = document.getElementById('errorSection');
    if (errorSection) {
      errorSection.innerHTML = `<div class=\"error-container\"><i class=\"fas fa-exclamation-triangle\\"></i><div class=\"error-message\"><h3>Critical Error</h3><p></p></div></div>`;
      errorSection.hidden = false;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
