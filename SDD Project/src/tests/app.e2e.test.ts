// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { WeatherController } from '../WeatherController.js';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

function mountApp(): HTMLElement {
  const root = document.createElement('main');
  root.innerHTML = '<div class="search"></div><section id="loading" hidden></section><section id="error" hidden></section><section id="weather" hidden></section>';
  document.body.append(root);
  return root;
}

function search(root: HTMLElement, city: string): void {
  const input = root.querySelector<HTMLInputElement>('#cityInput')!;
  input.value = city;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

describe('integración de extremo a extremo con APIs simuladas', () => {
  it('busca una ciudad, consulta el pronóstico y renderiza datos', async () => {
    const root = mountApp();
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        results: [{ id: 1, name: 'Arequipa', latitude: -16.4, longitude: -71.5 }]
      })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        current: { temperature_2m: 14.26, relative_humidity_2m: 58, precipitation: 0.1 }
      })));
    vi.stubGlobal('fetch', fetchMock);

    const controller = new WeatherController({
      searchContainer: root.querySelector('.search')!,
      loadingContainer: root.querySelector('#loading')!,
      errorContainer: root.querySelector('#error')!,
      weatherContainer: root.querySelector('#weather')!
    });
    controller.initialize();
    search(root, ' Arequipa ');

    await waitFor(() => expect(root.querySelector('#weather')?.textContent).toContain('14.3 °C'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const geocodingUrl = new URL(fetchMock.mock.calls[0][0] as string);
    const forecastUrl = new URL(fetchMock.mock.calls[1][0] as string);
    expect(geocodingUrl.searchParams.get('name')).toBe('Arequipa');
    expect(forecastUrl.searchParams.get('latitude')).toBe('-16.4');
    expect(forecastUrl.searchParams.get('longitude')).toBe('-71.5');
    expect(root.querySelector('#weather')?.textContent).toContain('58 %');
    expect(root.querySelector('#weather')?.textContent).toContain('0.1 mm');
  });

  it('muestra error de ciudad no encontrada y deja accesible el campo', async () => {
    const root = mountApp();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] }))));
    const controller = new WeatherController({
      searchContainer: root.querySelector('.search')!,
      loadingContainer: root.querySelector('#loading')!,
      errorContainer: root.querySelector('#error')!,
      weatherContainer: root.querySelector('#weather')!
    });
    controller.initialize();
    search(root, 'Atlantis');

    await waitFor(() => expect(root.querySelector('#error')?.textContent).toContain('No se encontró la ciudad'));
    expect(root.querySelector<HTMLInputElement>('#cityInput')?.disabled).toBe(false);
    expect(root.querySelector('#loading')?.hidden).toBe(true);
  });
});