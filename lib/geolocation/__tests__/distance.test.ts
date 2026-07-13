import { describe, it, expect } from 'vitest';
import { distanceInMeters } from '../distance';

describe('distanceInMeters', () => {
  it('retorna 0 para o mesmo ponto', () => {
    expect(distanceInMeters(-7.115, -34.863, -7.115, -34.863)).toBe(0);
  });

  it('calcula corretamente uma distância curta conhecida (~111m para 0.001° de latitude)', () => {
    const d = distanceInMeters(-7.115, -34.863, -7.116, -34.863);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });

  it('é simétrica (distância de A a B = de B a A)', () => {
    const d1 = distanceInMeters(-7.115, -34.863, -7.12, -34.86);
    const d2 = distanceInMeters(-7.12, -34.86, -7.115, -34.863);
    expect(d1).toBe(d2);
  });
});
