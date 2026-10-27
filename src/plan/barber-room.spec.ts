import { describe, expect, it } from 'vitest';
import type { ApiClient } from '../shell-contract';
import { MY_PLAN_PATH } from '../navigation/routes';
import { barberRoom, checkBarberRoom } from './barber-room';

/** Answers each path with what the services would; records every path asked. */
function fakeApi(answers: Record<string, unknown>, asked: string[] = []): ApiClient {
  const get = (path: string) => {
    asked.push(path);
    return path in answers ? Promise.resolve(answers[path] as never) : Promise.reject(new Error(`no answer for ${path}`));
  };
  return { get, post: get, put: get, patch: get, delete: get } as ApiClient;
}

function answers(activeBarbers: number, maxBarbers: number) {
  return {
    '/api/v1/barbershops/me': { id: 'b1', activeBarbers },
    '/api/v1/subscription': { barbershopId: 'b1', status: 'TRIAL', plan: { id: 'p1', name: 'Basico', maxBarbers } },
  };
}

describe('the barber limit of the plan (DEC-SHOP-07)', () => {
  it('leaves room while the barbershop has fewer barbers than its plan allows', () => {
    expect(barberRoom(1, 2)).toEqual({ full: false });
  });

  it('is full at the limit, with the message the owner reads', () => {
    expect(barberRoom(2, 2)).toEqual({
      full: true, message: 'Tu plan permite 2 barberos. Cambia de plan para agregar más.',
    });
    expect(barberRoom(1, 1)).toEqual({
      full: true, message: 'Tu plan permite 1 barbero. Cambia de plan para agregar más.',
    });
  });

  it('never fills an unlimited plan (999)', () => {
    expect(barberRoom(999, 999)).toEqual({ full: false });
    expect(barberRoom(2000, 999)).toEqual({ full: false });
  });

  it('reads my barbershop and my subscription through the shell client', async () => {
    const asked: string[] = [];

    const room = await checkBarberRoom(fakeApi(answers(2, 2), asked));

    expect(room.full).toBe(true);
    expect([...asked].sort()).toEqual(['/api/v1/barbershops/me', '/api/v1/subscription']);
  });

  it('fails when either read fails, so no account is created unchecked', async () => {
    const onlyShop = { '/api/v1/barbershops/me': { id: 'b1', activeBarbers: 0 } };

    await expect(checkBarberRoom(fakeApi(onlyShop))).rejects.toThrow();
  });

  it('sends the owner to the shell\'s "Mi plan"', () => {
    expect(MY_PLAN_PATH).toBe('/profile/plan');
  });
});
