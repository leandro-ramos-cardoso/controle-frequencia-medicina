const TIME_ZONE = 'America/Fortaleza';

/**
 * Sempre formatar data/hora com timeZone explícito. Sem isso, chamadas de
 * `.toLocaleDateString()`/`.toLocaleTimeString()` feitas em Server Components
 * usam o fuso do processo Node (Vercel roda em UTC), não o do usuário —
 * causando registros aparecendo com 2-3h de diferença do horário real de
 * João Pessoa.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: TIME_ZONE });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', { timeZone: TIME_ZONE });
}

/** Ex: "seg., 13/07" — usado nos cabeçalhos de dia do histórico. */
export function formatWeekdayDayMonth(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: TIME_ZONE,
  });
}

/**
 * Chave de dia no formato YYYY-MM-DD, calculada no fuso America/Fortaleza —
 * usada para agrupar registros por dia. Sem timeZone explícito (ex: via
 * toISOString(), que é sempre UTC), um registro feito às 21h-23h59 em João
 * Pessoa cairia no dia seguinte quando agrupado.
 */
export function formatDateKey(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

/** Ex: "13/07" — usado como rótulo em gráficos. */
export function formatDayMonth(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: TIME_ZONE,
  });
}
