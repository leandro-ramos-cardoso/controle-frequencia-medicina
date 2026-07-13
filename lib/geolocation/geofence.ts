import type { LocationStatus } from '@/types/attendance';

/**
 * Determina o status de localização a partir da distância e dos raios
 * configurados no local de estágio (allowed_radius_meters / warning_radius_meters).
 * Valores em metros. Configuráveis por local, pelo administrador.
 */
export function getLocationStatus(
  distanceMeters: number,
  allowedRadiusMeters: number,
  warningRadiusMeters: number
): LocationStatus {
  if (distanceMeters <= allowedRadiusMeters) return 'dentro_do_raio';
  if (distanceMeters <= warningRadiusMeters) return 'atencao';
  return 'fora_do_raio';
}
