import type { ApiClient } from '../shell-contract';

/**
 * The part of platform-admin-service.yaml's Subscription this app reads: the plan's barber limit.
 * The plan, the trial and paying them are shown by the shell's "Mi plan" (HU-SHOP-003).
 */
export interface Subscription {
  barbershopId: string;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  plan: { id: string; name: string; maxBarbers: number };
}

/** GET /api/v1/subscription (platform-admin-api): the token's barbershop, role ADMIN_BARBERSHOP. */
export function getMySubscription(api: ApiClient): Promise<Subscription> {
  return api.get<Subscription>('/api/v1/subscription');
}
