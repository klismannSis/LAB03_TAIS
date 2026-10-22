// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import fc from 'fast-check';
import { CitySearchForm } from '../components/CitySearchForm.js';
import { WeatherDisplay } from '../components/WeatherDisplay.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { LoadingIndicator } from '../components/LoadingIndicator.js';
import type { ForecastResult, GeocodingResult } from '../types/index.js';

const serviceMocks = vi.hoisted(() => ({ geocode: vi.fn(), getForecast: vi.fn() }));

vi.mock('../services/GeocodingService.js', () => ({
  GeocodingService: class { geocode = serviceMocks.geocode; }
}));
vi.mock('../services/ForecastService.js', () => ({
  ForecastService: class { getForecast = serviceMocks.getForecast; }
}));

const weather = { temperature: 8.44, humidity: 71.6, precipitation: 0 };

function setInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function submit(form: HTMLFormElement): void {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

afterEach(() => {
  document.body.replaceChildren();
  vi.clearAllMocks();
});

describe('CitySearchForm', () => {
  it('renderiza maxlength 100 y envía con submit/clic y Enter', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const onSearch = vi.fn();
    const form = new CitySearchForm(container, onSearch);
    const input = container.querySelector<HTMLInputElement>('#cityInput')!;
    const button = container.querySelector<HTMLButtonElement>('#searchButton')!;

    expect(input.maxLength).toBe(100);
    setInputValue(input, ' Quito ');
    button.click();
    expect(onSearch).toHaveBeenLastCalledWith('Quito');

    setInputValue(input, 'Lima');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSearch).toHaveBeenLastCalledWith('Lima');
    form.setEnabled(true);
    expect(input.disabled).toBe(false);
  });

  it('rechaza cualquier valor vacío o compuesto por whitespace', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { maxLength: 24 }).map((parts) => parts.join('')),
      async (value) => {
        const container = document.createElement('div');
        const onSearch = vi.fn();
        new CitySearchForm(container, onSearch);
        const input = container.querySelector<HTMLInputElement>('#cityInput')!;
        setInputValue(input, value);
        submit(container.querySelector<HTMLFormElement>('form')!);
        expect(onSearch).not.toHaveBeenCalled();
        expect(container.querySelector('#validationMessage')?.textContent).toBe('El nombre de la ciudad es obligatorio.');
        container.remove();
      }
    ));
  });

  it('recorta espacios periféricos antes de emitir la búsqueda', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1 }).filter((value) => value.trim().length > 0),
      fc.array(fc.constantFrom(' ', '\t', '\n'), { maxLength: 8 }),
      fc.array(fc.constantFrom(' ', '\t', '\n'), { maxLength: 8 }),
      async (name, prefix, suffix) => {
        const container = document.createElement('div');
        const onSearch = vi.fn();
        new CitySearchForm(container, onSearch);
        const input = container.querySelector<HTMLInputElement>('#cityInput')!;
        const value = `${prefix.join('')}${name}${suffix.join('')}`.slice(0, 100);
        setInputValue(input, value);
        submit(container.querySelector<HTMLFormElement>('form')!);
        expect(onSearch).toHaveBeenCalledWith(value.trim());
        container.remove();
      }
    ));
  });
});

describe('WeatherDisplay and status components', () => {
  it('muestra ciudad, métricas formateadas y unidades; clear limpia el display', () => {
    const container = document.createElement('section');
    const display = new WeatherDisplay(container);
    display.update('Lima', weather, 'Lima');
    expect(container.textContent).toContain('Lima');
    expect(container.textContent).toContain('8.4 °C');
    expect(container.textContent).toContain('72 %');
    expect(container.textContent).toContain('0.0 mm');
    expect(container.querySelector('.fa-temperature-high')).not.toBeNull();
    display.clear();
    expect(container.hidden).toBe(true);
  });

  it('usa el nombre buscado como fallback y controla carga y error', () => {
    const weatherContainer = document.createElement('section');
    const display = new WeatherDisplay(weatherContainer);
    display.update('', weather, 'Cusco');
    expect(weatherContainer.textContent).toContain('Cusco');

    const loadingContainer = document.createElement('section');
    const loading = new LoadingIndicator(loadingContainer);
    loading.show();
    expect(loadingContainer.hidden).toBe(false);
    loading.hide();
    expect(loadingContainer.hidden).toBe(true);

    const errorContainer = document.createElement('section');
    const errors = new ErrorMessage(errorContainer);
    errors.show('No disponible');
    expect(errorContainer.textContent).toContain('No disponible');
    errors.clear();
    expect(errorContainer.hidden).toBe(true);
  });

  it('muestra todos los campos formateados para objetos meteorológicos generados', async () => {
    await fc.assert(fc.property(
      fc.record({
        temperature: fc.float({ noNaN: true, noDefaultInfinity: true }),
        humidity: fc.float({ noNaN: true, noDefaultInfinity: true }),
        precipitation: fc.float({ noNaN: true, noDefaultInfinity: true })
      }).map((data) => JSON.parse(JSON.stringify(data)) as typeof data),
      (data) => {
        const container = document.createElement('section');
        const display = new WeatherDisplay(container);
        display.update('Ciudad de prueba', data, 'Ciudad de prueba');
        expect(container.textContent).toContain('Ciudad de prueba');
        expect(container.textContent).toContain(`${data.temperature.toFixed(1)} °C`);
        const roundedHumidity = Math.round(data.humidity);
        const expectedHumidity = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 0,
          useGrouping: false
        }).format(Object.is(roundedHumidity, -0) ? 0 : roundedHumidity);
        expect(container.textContent).toContain(`${expectedHumidity} %`);
        expect(container.textContent).toContain(`${data.precipitation.toFixed(1)} mm`);
      }
    ));
  });
});

describe('WeatherController integration', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('main');
    root.innerHTML = '<div class="search"></div><section id="loading"></section><section id="error" hidden></section><section id="weather" hidden></section>';
    document.body.append(root);
  });

  async function submitCity(cityName: string): Promise<void> {
    const input = root.querySelector<HTMLInputElement>('#cityInput')!;
    setInputValue(input, cityName);
    submit(root.querySelector<HTMLFormElement>('form')!);
  }

  async function createController() {
    const { WeatherController } = await import('../WeatherController.js');
    const controller = new WeatherController({
      searchContainer: root.querySelector<HTMLElement>('.search')!,
      loadingContainer: root.querySelector<HTMLElement>('#loading')!,
      errorContainer: root.querySelector<HTMLElement>('#error')!,
      weatherContainer: root.querySelector<HTMLElement>('#weather')!
    });
    controller.initialize();
    return controller;
  }

  it('completa búsqueda, muestra el clima y oculta carga', async () => {
    serviceMocks.geocode.mockResolvedValue({ success: true, data: { cityName: 'Quito', latitude: -0.18, longitude: -78.47 } } satisfies GeocodingResult);
    serviceMocks.getForecast.mockResolvedValue({ success: true, data: weather } satisfies ForecastResult);
    await createController();
    await submitCity('Quito');

    await waitFor(() => expect(root.querySelector('#weather')?.textContent).toContain('8.4 °C'));
    expect(serviceMocks.getForecast).toHaveBeenCalledWith(-0.18, -78.47);
    expect(root.querySelector<HTMLElement>('#loading')?.hidden).toBe(true);
    expect(root.querySelector<HTMLElement>('#error')?.hidden).toBe(true);
  });

  it('limpia resultados previos antes de solicitar el siguiente pronóstico', async () => {
    serviceMocks.geocode.mockResolvedValue({ success: true, data: { cityName: 'Lima', latitude: -12, longitude: -77 } });
    serviceMocks.getForecast.mockResolvedValueOnce({ success: true, data: weather });
    await createController();
    await submitCity('Lima');
    await waitFor(() => expect(root.querySelector<HTMLElement>('#weather')?.hidden).toBe(false));

    let displayWasClearedBeforeForecast = false;
    serviceMocks.getForecast.mockImplementationOnce(async () => {
      displayWasClearedBeforeForecast = root.querySelector<HTMLElement>('#weather')?.hidden === true;
      return new Promise(() => {});
    });
    await submitCity('Lima');
    await waitFor(() => expect(serviceMocks.getForecast).toHaveBeenCalledTimes(2));
    expect(displayWasClearedBeforeForecast).toBe(true);
    expect(root.querySelector<HTMLElement>('#loading')?.hidden).toBe(false);
  });

  it('mantiene el display limpio antes del pronóstico para nombres generados', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1 }).filter((name) => name.trim().length > 0),
      async (cityName) => {
        const submittedCity = cityName.trim().slice(0, 100);
        root.innerHTML = '<div class="search"></div><section id="loading"></section><section id="error" hidden></section><section id="weather" hidden></section>';
        serviceMocks.geocode.mockReset().mockResolvedValue({
          success: true,
          data: { cityName: submittedCity, latitude: 1, longitude: 2 }
        });
        let displayWasClear = false;
        serviceMocks.getForecast.mockReset()
          .mockResolvedValueOnce({ success: true, data: weather })
          .mockImplementationOnce(async () => {
            displayWasClear = root.querySelector<HTMLElement>('#weather')?.hidden === true;
            return { success: true, data: weather };
          });

        await createController();
        await submitCity(submittedCity);
        await waitFor(() => expect(root.querySelector<HTMLElement>('#weather')?.hidden).toBe(false));
        await submitCity(submittedCity);
        await waitFor(() => expect(serviceMocks.getForecast).toHaveBeenCalledTimes(2));
        expect(displayWasClear).toBe(true);
      }
    ));
  });

  it('muestra errores de geocodificación y conserva el campo accesible', async () => {
    serviceMocks.geocode.mockResolvedValue({ success: false, error: { type: 'CITY_NOT_FOUND' } } satisfies GeocodingResult);
    await createController();
    await submitCity('Atlantis');

    await waitFor(() => expect(root.querySelector<HTMLElement>('#error')?.textContent).toContain('No se encontró la ciudad'));
    expect(root.querySelector<HTMLInputElement>('#cityInput')?.disabled).toBe(false);
    expect(root.querySelector<HTMLElement>('#loading')?.hidden).toBe(true);
  });

  it('muestra errores de pronóstico y oculta el indicador de carga', async () => {
    serviceMocks.geocode.mockResolvedValue({ success: true, data: { cityName: 'Lima', latitude: -12, longitude: -77 } });
    serviceMocks.getForecast.mockResolvedValue({ success: false, error: { type: 'INCOMPLETE_DATA' } } satisfies ForecastResult);
    await createController();
    await submitCity('Lima');

    await waitFor(() => expect(root.querySelector<HTMLElement>('#error')?.textContent).toContain('incompletos'));
    expect(root.querySelector<HTMLElement>('#loading')?.hidden).toBe(true);
    expect(root.querySelector<HTMLInputElement>('#cityInput')?.disabled).toBe(false);
  });
});
