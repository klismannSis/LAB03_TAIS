import { afterEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { fetchGeocodingData } from '../clients/GeocodingClient.js';
import { fetchForecastData } from '../clients/ForecastClient.js';
import { GeocodingService } from '../services/GeocodingService.js';
import { ForecastService } from '../services/ForecastService.js';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  fetchMock.mockReset();
});

describe('HTTP clients', () => {
  it('construye la URL de geocodificación correctamente para cualquier ciudad', async () => {
    vi.stubGlobal('fetch', fetchMock.mockResolvedValue(new Response('{}')));

    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1 }).filter((name) => name.trim().length > 0),
      async (cityName) => {
        fetchMock.mockClear();
        await fetchGeocodingData(cityName);
        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.searchParams.get('name')).toBe(cityName.trim());
        expect(url.searchParams.get('count')).toBe('1');
      }
    ));
  });

  it('construye la URL de pronóstico con coordenadas y variables requeridas', async () => {
    vi.stubGlobal('fetch', fetchMock.mockResolvedValue(new Response('{}')));

    await fc.assert(fc.asyncProperty(
      fc.tuple(
        fc.float({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
        fc.float({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true })
      ),
      async ([latitude, longitude]) => {
        fetchMock.mockClear();
        await fetchForecastData(latitude, longitude);
        const url = new URL(fetchMock.mock.calls[0][0] as string);
        expect(url.searchParams.get('latitude')).toBe(String(latitude));
        expect(url.searchParams.get('longitude')).toBe(String(longitude));
        expect(url.searchParams.get('current')).toBe('temperature_2m,relative_humidity_2m,precipitation');
      }
    ));
  });

  it('rechaza ciudades vacías antes de llamar a la red', async () => {
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchGeocodingData(' \t\n ')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reporta timeout al superar diez segundos', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url: string | URL | Request, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));

    const assertion = expect(fetchGeocodingData('Quito')).rejects.toThrow('TIMEOUT');
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });
});

describe('GeocodingService', () => {
  const service = new GeocodingService();

  it('extrae sin modificar las coordenadas del primer resultado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      results: [
        { name: 'Ciudad A', latitude: 19.4326, longitude: -99.1332 },
        { name: 'Ciudad B', latitude: 1, longitude: 2 }
      ]
    })));

    const result = await service.geocode('Ciudad A');
    expect(result).toEqual({ success: true, data: { cityName: 'Ciudad A', latitude: 19.4326, longitude: -99.1332 } });
  });

  it('cumple el round-trip de coordenadas para respuestas generadas', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        latitude: fc.float({ noNaN: true, noDefaultInfinity: true }),
        longitude: fc.float({ noNaN: true, noDefaultInfinity: true }),
        name: fc.string({ minLength: 1 }).filter((name) => name.trim().length > 0)
      }).map((place) => JSON.parse(JSON.stringify(place)) as typeof place),
      async (place) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ results: [place] })));
        const result = await service.geocode(place.name);
        expect(result).toEqual({ success: true, data: { cityName: place.name, latitude: place.latitude, longitude: place.longitude } });
      }
    ));
  });

  it.each([
    [{ results: [] }, 'CITY_NOT_FOUND'],
    [{ results: [{ name: 'Missing', latitude: null, longitude: 2 }] }, 'CITY_NOT_FOUND'],
    [{ results: [{ name: 'Missing', latitude: 1 }] }, 'CITY_NOT_FOUND']
  ])('trata resultados ausentes o coordenadas incompletas como ciudad no encontrada', async (body, type) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
    expect(await service.geocode('Missing')).toEqual({ success: false, error: { type } });
  });

  it('rechaza coordenadas nulas, ausentes o indefinidas en cualquier campo', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        missingField: fc.constantFrom('latitude', 'longitude'),
        missingValue: fc.constantFrom(null, undefined),
        omitField: fc.boolean()
      }),
      async ({ missingField, missingValue, omitField }) => {
        const place: Record<string, unknown> = { id: 1, name: 'Somewhere', latitude: 1, longitude: 2 };
        if (omitField || missingValue === undefined) delete place[missingField];
        else place[missingField] = missingValue;
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ results: [place] })));
        expect(await service.geocode('Somewhere')).toEqual({ success: false, error: { type: 'CITY_NOT_FOUND' } });
      }
    ));
  });

  it('rechaza todos los estados HTTP no exitosos', async () => {
    await fc.assert(fc.asyncProperty(fc.integer({ min: 300, max: 599 }), async (statusCode) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(statusCode === 304 ? null : '{}', { status: statusCode })));
      expect(await service.geocode('Lima')).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode } });
    }));
  });

  it('clasifica errores de red, HTTP y JSON inválido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('NETWORK_ERROR')));
    expect(await service.geocode('Lima')).toEqual({ success: false, error: { type: 'NETWORK_ERROR' } });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    expect(await service.geocode('Lima')).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode: 503 } });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid')));
    expect(await service.geocode('Lima')).toEqual({ success: false, error: { type: 'INVALID_RESPONSE' } });
  });

  it('clasifica timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
    expect(await service.geocode('Lima')).toEqual({ success: false, error: { type: 'TIMEOUT' } });
  });
});

describe('ForecastService', () => {
  const service = new ForecastService();

  it('mapea sin transformar los valores meteorológicos actuales', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      current: { temperature_2m: 18.25, relative_humidity_2m: 67, precipitation: 0.35 }
    })));

    expect(await service.getForecast(-12.04, -77.03)).toEqual({
      success: true,
      data: { temperature: 18.25, humidity: 67, precipitation: 0.35 }
    });
  });

  it('cumple el round-trip de los valores para respuestas generadas', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        temperature_2m: fc.float({ noNaN: true, noDefaultInfinity: true }),
        relative_humidity_2m: fc.float({ noNaN: true, noDefaultInfinity: true }),
        precipitation: fc.float({ noNaN: true, noDefaultInfinity: true })
      })
        .map((values) => JSON.parse(JSON.stringify(values)) as typeof values),
      async (current) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ current })));
        expect(await service.getForecast(0, 0)).toEqual({
          success: true,
          data: { temperature: current.temperature_2m, humidity: current.relative_humidity_2m, precipitation: current.precipitation }
        });
      }
    ));
  });

  it.each([
    [{ current: { temperature_2m: null, relative_humidity_2m: 60, precipitation: 0 } }],
    [{ current: { temperature_2m: 10, relative_humidity_2m: 60 } }],
    [{}]
  ])('rechaza datos actuales incompletos', async (body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
    expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'INCOMPLETE_DATA' } });
  });

  it('rechaza propiedades meteorológicas nulas, ausentes o indefinidas', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        missingField: fc.constantFrom('temperature_2m', 'relative_humidity_2m', 'precipitation'),
        missingValue: fc.constantFrom(null, undefined),
        omitField: fc.boolean()
      }),
      async ({ missingField, missingValue, omitField }) => {
        const current: Record<string, unknown> = { temperature_2m: 8, relative_humidity_2m: 70, precipitation: 0 };
        if (omitField || missingValue === undefined) delete current[missingField];
        else current[missingField] = missingValue;
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ current })));
        expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'INCOMPLETE_DATA' } });
      }
    ));
  });

  it('rechaza todos los estados HTTP no exitosos', async () => {
    await fc.assert(fc.asyncProperty(fc.integer({ min: 300, max: 599 }), async (statusCode) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(statusCode === 304 ? null : '{}', { status: statusCode })));
      expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode } });
    }));
  });

  it('clasifica cualquier cuerpo no parseable como respuesta inválida', async () => {
    await fc.assert(fc.asyncProperty(fc.string(), async (invalidBody) => {
      const guaranteedInvalidJson = `not-json:${invalidBody}`;
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(guaranteedInvalidJson, { status: 200 })));
      expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'INVALID_RESPONSE' } });
    }));
  });

  it('clasifica errores de red, HTTP, JSON inválido y timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('NETWORK_ERROR')));
    expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'NETWORK_ERROR' } });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 502 })));
    expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'SERVICE_ERROR', statusCode: 502 } });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid')));
    expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'INVALID_RESPONSE' } });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));
    expect(await service.getForecast(0, 0)).toEqual({ success: false, error: { type: 'TIMEOUT' } });
  });
});