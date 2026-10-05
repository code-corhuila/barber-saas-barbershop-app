import { isApiError, type ApiClient } from '../shell-contract';
import { createBarber } from './catalog-api';
import type { BarberProfile, NewBarber, UserSummary } from './types';

/**
 * Adding a barber is two calls (HU-SHOP-002, DEC-AUTH-05): the account in identity-auth, then the
 * profile here with the returned id. Each has its own Idempotency-Key, kept while it is retried.
 * Once the account exists only the profile is retried: the account is never created twice.
 */
export interface AddBarberProgress {
  /** The account already created, when only the profile is left. */
  accountId: string | null;
  accountKey: string;
  profileKey: string;
}

export type AddBarberResult =
  | { outcome: 'added'; profile: BarberProfile }
  | { outcome: 'email-taken' }
  | { outcome: 'account-failed'; error: unknown }
  | { outcome: 'profile-failed'; accountId: string; error: unknown };

/** POST /api/v1/auth/barbers (auth-service.yaml): a BARBER in the owner's barbershop, taken from the token. */
export function createBarberAccount(api: ApiClient, data: NewBarber, idempotencyKey: string): Promise<UserSummary> {
  return api.post<UserSummary>('/api/v1/auth/barbers', {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    password: data.password,
    phone: data.phone.trim() || null,
  }, { idempotencyKey });
}

export async function addBarber(api: ApiClient, data: NewBarber, progress: AddBarberProgress): Promise<AddBarberResult> {
  let accountId = progress.accountId;
  if (accountId === null) {
    try {
      accountId = (await createBarberAccount(api, data, progress.accountKey)).id;
    } catch (error) {
      // auth-service.yaml: 422 on this operation means the e-mail is already registered.
      if (isApiError(error) && error.status === 422) return { outcome: 'email-taken' };
      return { outcome: 'account-failed', error };
    }
  }
  try {
    const profile = await createBarber(api, { userId: accountId, experienceYears: 0, bio: '' }, progress.profileKey);
    return { outcome: 'added', profile };
  } catch (error) {
    return { outcome: 'profile-failed', accountId, error };
  }
}
