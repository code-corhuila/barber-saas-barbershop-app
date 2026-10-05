import { describe, expect, it } from 'vitest';
import type { ApiClient, ApiError } from '../shell-contract';
import { addBarber, type AddBarberProgress } from './add-barber';

const DATA = { fullName: ' Juan Pérez ', email: ' juan@elclasico.co ', phone: ' ', password: 'Inicial2026' };

function apiError(status: number): ApiError {
  return { status, code: 'X', message: 'x', details: [], traceId: 't', userMessage: 'Algo falló.' };
}

/** Records every post; {@code answers} decides, per path, what each call returns or throws. */
function fakeApi(calls: unknown[][], answers: Record<string, Array<() => unknown>>): ApiClient {
  const post = (path: string, ...rest: unknown[]) => {
    calls.push([path, ...rest]);
    const next = answers[path].shift()!;
    return new Promise((resolve, reject) => {
      try { resolve(next()); } catch (err) { reject(err); }
    });
  };
  return { post } as unknown as ApiClient;
}

function progress(): AddBarberProgress {
  return { accountId: null, accountKey: 'account-key-1', profileKey: 'profile-key-1' };
}

describe('add a barber', () => {
  it('creates the account in identity-auth first and then the profile with the returned id', async () => {
    const calls: unknown[][] = [];
    const api = fakeApi(calls, {
      '/api/v1/auth/barbers': [() => ({ id: 'u1' })],
      '/api/v1/barbers': [() => ({ id: 'p1', userId: 'u1' })],
    });

    const result = await addBarber(api, DATA, progress());

    expect(result).toEqual({ outcome: 'added', profile: { id: 'p1', userId: 'u1' } });
    expect(calls).toEqual([
      ['/api/v1/auth/barbers', { fullName: 'Juan Pérez', email: 'juan@elclasico.co', password: 'Inicial2026', phone: null },
        { idempotencyKey: 'account-key-1' }],
      ['/api/v1/barbers', { userId: 'u1', experienceYears: 0, bio: null }, { idempotencyKey: 'profile-key-1' }],
    ]);
  });

  it('says the e-mail is taken on 422 and never creates a profile', async () => {
    const calls: unknown[][] = [];
    const api = fakeApi(calls, { '/api/v1/auth/barbers': [() => { throw apiError(422); }] });

    expect(await addBarber(api, DATA, progress())).toEqual({ outcome: 'email-taken' });
    expect(calls).toHaveLength(1);
  });

  it('reports any other account failure as it is', async () => {
    const error = apiError(503);
    const api = fakeApi([], { '/api/v1/auth/barbers': [() => { throw error; }] });

    expect(await addBarber(api, DATA, progress())).toEqual({ outcome: 'account-failed', error });
  });

  it('keeps the account when the profile fails and retries only the profile, with the same key', async () => {
    const calls: unknown[][] = [];
    const error = apiError(503);
    const api = fakeApi(calls, {
      '/api/v1/auth/barbers': [() => ({ id: 'u1' })],
      '/api/v1/barbers': [() => { throw error; }, () => ({ id: 'p1', userId: 'u1' })],
    });
    const state = progress();

    const first = await addBarber(api, DATA, state);
    expect(first).toEqual({ outcome: 'profile-failed', accountId: 'u1', error });

    const retry = await addBarber(api, DATA, { ...state, accountId: 'u1' });
    expect(retry.outcome).toBe('added');
    expect(calls.map((c) => c[0])).toEqual(['/api/v1/auth/barbers', '/api/v1/barbers', '/api/v1/barbers']);
    expect(calls[2][2]).toEqual({ idempotencyKey: 'profile-key-1' });
  });
});
