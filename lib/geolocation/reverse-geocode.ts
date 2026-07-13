/**
 * Geocodificação reversa "melhor esforço" usando a API pública do Nominatim
 * (OpenStreetMap) — gratuita, sem chave de API. Respeitar a política de uso
 * (nominatim.org/release-docs/latest/api/Usage-Policy): uso leve, sem
 * disparar em rajada. Aqui é chamada no máximo 1x por registro de ponto.
 *
 * Falha silenciosamente (retorna null) se indisponível — o registro de
 * ponto NUNCA deve travar por causa do endereço aproximado.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;

    const data = await response.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}
