// src/components/CitySearchForm.ts - Componente del formulario de búsqueda
// Tarea 8.1: Implementar componente UI para entrada de ciudad
// Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5

import { isEmptyOrWhitespace } from '../utils/formatters.js';

export class CitySearchForm {
  private form!: HTMLFormElement;
  private input!: HTMLInputElement;
  private button!: HTMLButtonElement;
  private validationMessage!: HTMLDivElement;
  
  constructor(
    private container: HTMLElement,
    private onSearch: (cityName: string) => void
  ) {
    this.initialize();
    this.setupEventListeners();
  }

  private initialize(): void {
    // Crear elementos DOM (requisito 1.1, 1.2)
    this.form = document.createElement('form');
    this.form.className = 'search-form';
    this.form.setAttribute('novalidate', '');
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.id = 'cityInput';
    this.input.placeholder = 'Ingresa el nombre de una ciudad';
    this.input.maxLength = 100; // requisito 1.1
    this.input.setAttribute('aria-label', 'Nombre de la ciudad');
    
    this.button = document.createElement('button');
    this.button.type = 'submit';
    this.button.id = 'searchButton';
    this.button.innerHTML = '<i class=\"fas fa-search\"></i> Buscar';
    this.button.setAttribute('aria-label', 'Buscar clima');
    
    this.validationMessage = document.createElement('div');
    this.validationMessage.id = 'validationMessage';
    this.validationMessage.className = 'validation-message';
    this.validationMessage.setAttribute('aria-live', 'polite');
    
    // Ensamblar elementos
    inputGroup.appendChild(this.input);
    inputGroup.appendChild(this.button);
    this.form.appendChild(inputGroup);
    this.form.appendChild(this.validationMessage);
    this.container.appendChild(this.form);
  }

  private setupEventListeners(): void {
    // Manejar envío del formulario (requisito 1.2)
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });

    // Manejar tecla Enter en el input (requisito 1.2)
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.handleSubmit();
      }
    });

    // Limpiar mensajes de validación cuando el usuario empiece a escribir
    this.input.addEventListener('input', () => {
      this.clearValidation();
    });
  }

  private handleSubmit(): void {
    const cityName = this.input.value.trim();
    
    // Validar entrada (requisito 1.3, 1.4, 2.5)
    if (isEmptyOrWhitespace(cityName)) {
      this.showValidationMessage('El nombre de la ciudad es obligatorio.');
      return;
    }
    
    // Limpiar validación si pasa
    this.clearValidation();
    
    // Disparar callback con el valor recortado (requisito 1.5)
    this.onSearch(cityName);
  }

  private showValidationMessage(message: string): void {
    this.validationMessage.textContent = message;
    this.validationMessage.classList.add('show');
    this.input.focus();
  }

  private clearValidation(): void {
    this.validationMessage.textContent = '';
    this.validationMessage.classList.remove('show');
  }

  setEnabled(enabled: boolean): void {
    this.input.disabled = !enabled;
    this.button.disabled = !enabled;
  }

  clear(): void {
    this.input.value = '';
    this.clearValidation();
  }

  focus(): void {
    this.input.focus();
  }

  getValue(): string {
    return this.input.value.trim();
  }
}
