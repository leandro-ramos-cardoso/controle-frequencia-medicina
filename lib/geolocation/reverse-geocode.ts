/**
 * Geocodificação reversa "melhor esforço" usando a API pública do Nominatim
 * (OpenStreetMap) — gratuita, sem chave de API. Respeitar a política de uso
 * (nominatim.org/release-docs/latest/api/Usage-Policy): uso leve, sem
 * disparar em rajada. Aqui é chamada no máximo 1x por registro de ponto.
 *
 * Falha silenciosamente (retorna null) se indisponível — o registro de
 * ponto NUNCA deve travar por causa do endereço aproximado.
 *
 * IMPORTANTE: este endereço é só informativo (nunca bloqueia o registro).
 * A precisão real depende do GPS do aparelho — no Brasil, a cobertura de
 * endereços do OpenStreetMap também é mais esparsa que em outros países,
 * então o resultado pode "arredondar" para a rua conhecida mais próxima em
 * vez do endereço exato. O campo "Precisão" (metros) ao lado indica o
 * quanto confiar nisso.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;

    const data = await response.json();
    const a = data?.address;
    if (!a) return data?.display_name ?? null;

    // Monta um endereço curto (rua, bairro, cidade) em vez do display_name
    // completo do Nominatim, que vem com CEP/região/país e fica verboso.
    const street = a.road || a.pedestrian || a.residential;
    const number = a.house_number;
    const neighborhood = a.suburb || a.neighbourhood;
    const city = a.city || a.town || a.municipality;

    const parts = [street ? `${street}${number ? `, ${number}` : ''}` : null, neighborhood, city].filter(
      Boolean
    );

    return parts.length > 0 ? parts.join(' · ') : (data?.display_name ?? null);
  } catch {
    return null;
  }
}
