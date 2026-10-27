import type { ApiClient } from '../shell-contract';
import { getMyBarbershop } from '../catalog/catalog-api';
import { getMySubscription } from './plan-api';

/** maxBarbers of a plan without a limit (the seed of 06-data, DEC-SHOP-07). */
export const UNLIMITED_BARBERS = 999;

export type BarberRoom = { full: false } | { full: true; message: string };

/** Whether one more barber fits in the plan; the text is what the owner reads on the team screen. */
export function barberRoom(activeBarbers: number, maxBarbers: number): BarberRoom {
  if (maxBarbers >= UNLIMITED_BARBERS || activeBarbers < maxBarbers) return { full: false };
  const barbers = maxBarbers === 1 ? '1 barbero' : `${maxBarbers} barberos`;
  return { full: true, message: `Tu plan permite ${barbers}. Cambia de plan para agregar más.` };
}

/**
 * Checked before the account is created (DEC-SHOP-07): barbershop-api would refuse the profile, and
 * an account left without a profile is of no use. Rejects when either read fails.
 */
export async function checkBarberRoom(api: ApiClient): Promise<BarberRoom> {
  const [shop, subscription] = await Promise.all([getMyBarbershop(api), getMySubscription(api)]);
  return barberRoom(shop.activeBarbers, subscription.plan.maxBarbers);
}
