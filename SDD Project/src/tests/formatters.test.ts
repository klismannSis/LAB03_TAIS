import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { formatHumidity, formatPrecipitation, formatTemperature } from '../utils/formatters.js';

const finiteFloat = fc.float({ noNaN: true, noDefaultInfinity: true });

describe('formatters', () => {
  it('formatea temperatura y precipitación con un decimal y humedad como entero', () => {
    fc.assert(fc.property(finiteFloat, (value) => {
      expect(formatTemperature(value)).toBe(`${value.toFixed(1)} °C`);
      expect(formatPrecipitation(value)).toBe(`${value.toFixed(1)} mm`);
      const roundedValue = Math.round(value);
      const expectedHumidity = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        useGrouping: false
      }).format(Object.is(roundedValue, -0) ? 0 : roundedValue);
      expect(formatHumidity(value)).toBe(`${expectedHumidity} %`);
      expect(formatTemperature(value).match(/\.(\d+)(?= °C$)/)?.[1].length ?? 0).toBeLessThanOrEqual(1);
      expect(formatPrecipitation(value).match(/\.(\d+)(?= mm$)/)?.[1].length ?? 0).toBeLessThanOrEqual(1);
      expect(formatHumidity(value)).not.toMatch(/\d+\.\d/);
    }));
  });
});