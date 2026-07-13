import { describe, it, expect } from 'vitest';
import { getLocationStatus } from '../geofence';

describe('getLocationStatus', () => {
  const allowed = 100;
  const warning = 150;

  it('classifica como dentro_do_raio quando a distância é menor que o permitido', () => {
    expect(getLocationStatus(50, allowed, warning)).toBe('dentro_do_raio');
  });

  it('classifica como dentro_do_raio exatamente no limite permitido', () => {
    expect(getLocationStatus(100, allowed, warning)).toBe('dentro_do_raio');
  });

  it('classifica como atencao entre o permitido e o de atenção', () => {
    expect(getLocationStatus(120, allowed, warning)).toBe('atencao');
  });

  it('classifica como atencao exatamente no limite de atenção', () => {
    expect(getLocationStatus(150, allowed, warning)).toBe('atencao');
  });

  it('classifica como fora_do_raio acima do limite de atenção', () => {
    expect(getLocationStatus(151, allowed, warning)).toBe('fora_do_raio');
  });
});
