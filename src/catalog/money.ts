/** Prices travel as integer cents of COP (ADR-010); people read and type whole pesos. */
const PESOS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function formatCop(cents: number): string {
  return `$ ${PESOS.format(Math.round(cents / 100))}`;
}

/** "25000" or "25.000" → 2500000; anything that is not a non-negative whole amount → null. */
export function pesosToCents(typed: string): number | null {
  const digits = typed.trim().replace(/\./g, '');
  if (!/^\d{1,9}$/.test(digits)) return null;
  return Number(digits) * 100;
}

export function centsToPesos(cents: number): string {
  return String(Math.round(cents / 100));
}
