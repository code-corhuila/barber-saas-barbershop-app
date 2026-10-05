/**
 * The name to show for a barber: the copy barbershop-api keeps from identity-auth (DEC-SHOP-04,
 * ADR-014). A profile created before that copy existed has none, so it gets a Spanish fallback.
 */
export function barberName(barber: { fullName: string | null }): string {
  return barber.fullName?.trim() || 'Barbero sin nombre';
}
