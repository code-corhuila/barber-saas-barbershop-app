import { describe, expect, it } from 'vitest';
import type { ApiClient } from '../shell-contract';
import * as catalog from './catalog-api';

function recordingApi(calls: unknown[][]): ApiClient {
  const record = (...args: unknown[]) => { calls.push(args); return Promise.resolve({} as never); };
  return { get: record, post: record, put: record, patch: record, delete: record } as ApiClient;
}

describe('catalog-api', () => {
  it('searches the public catalog by city and, when known, by the client position', async () => {
    const calls: unknown[][] = [];
    const api = recordingApi(calls);

    await catalog.searchBarbershops(api, { city: ' Neiva ' });
    await catalog.searchBarbershops(api, { position: { lat: 2.9273, lng: -75.2819 } });
    await catalog.searchBarbershops(api, {});

    expect(calls.map((c) => c[0])).toEqual([
      '/api/v1/barbershops?city=Neiva&limit=50',
      '/api/v1/barbershops?lat=2.9273&lng=-75.2819&limit=50',
      '/api/v1/barbershops?limit=50',
    ]);
  });

  it('reads a barbershop and its public services and barbers by id', async () => {
    const calls: unknown[][] = [];
    const api = recordingApi(calls);

    await catalog.getBarbershop(api, 'b1');
    await catalog.listPublicServices(api, 'b1');
    await catalog.listPublicBarbers(api, 'b1');

    expect(calls.map((c) => c[0])).toEqual([
      '/api/v1/barbershops/b1', '/api/v1/barbershops/b1/services?limit=100', '/api/v1/barbershops/b1/barbers?limit=100',
    ]);
  });

  it('creates a service with its key and a trimmed body, and edits it with put', async () => {
    const calls: unknown[][] = [];
    const api = recordingApi(calls);
    const data = { name: ' Corte ', description: ' ', durationMinutes: 30, priceCents: 2500000 };

    await catalog.createService(api, data, 'key-123456789');
    await catalog.updateService(api, 's1', data, false);

    expect(calls[0]).toEqual(['/api/v1/services',
      { name: 'Corte', description: null, durationMinutes: 30, priceCents: 2500000 }, { idempotencyKey: 'key-123456789' }]);
    expect(calls[1]).toEqual(['/api/v1/services/s1',
      { name: 'Corte', description: null, durationMinutes: 30, priceCents: 2500000, isActive: false }]);
  });

  it('manages barber profiles and their specialties of the token barbershop', async () => {
    const calls: unknown[][] = [];
    const api = recordingApi(calls);

    await catalog.listMyServices(api);
    await catalog.listMyBarbers(api);
    await catalog.createBarber(api, { userId: 'u1', experienceYears: 3, bio: ' Fades ' }, 'key-000000001');
    await catalog.editBarber(api, 'p1', { experienceYears: 5, bio: '' });
    await catalog.addSpecialty(api, 'p1', ' Fade ', 'key-000000002');
    await catalog.removeSpecialty(api, 'p1', 'sp1');

    expect(calls).toEqual([
      ['/api/v1/services?limit=100'],
      ['/api/v1/barbers?limit=100'],
      ['/api/v1/barbers', { userId: 'u1', experienceYears: 3, bio: 'Fades' }, { idempotencyKey: 'key-000000001' }],
      ['/api/v1/barbers/p1', { experienceYears: 5, bio: null }],
      ['/api/v1/barbers/p1/specialties', { specialtyName: 'Fade' }, { idempotencyKey: 'key-000000002' }],
      ['/api/v1/barbers/p1/specialties/sp1'],
    ]);
  });
});
