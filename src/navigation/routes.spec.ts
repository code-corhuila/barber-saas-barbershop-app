import { describe, expect, it } from 'vitest';
import { bookingPath, parseRoute, routePath, startRoute } from './routes';

describe('routes inside /barbershops', () => {
  it('reads the path the shell mounted the app with', () => {
    expect(parseRoute('/')).toEqual({ name: 'search' });
    expect(parseRoute('/3fa85f64-5717-4562-b3fc-2c963f66afa6'))
      .toEqual({ name: 'detail', id: '3fa85f64-5717-4562-b3fc-2c963f66afa6' });
    expect(parseRoute('/manage/services')).toEqual({ name: 'services' });
    expect(parseRoute('/manage/barbers')).toEqual({ name: 'barbers' });
    expect(parseRoute('/whatever')).toEqual({ name: 'search' });
  });

  it('writes a route back as a path, so the browser address follows the screen', () => {
    expect(routePath({ name: 'detail', id: 'b1' })).toBe('/b1');
    expect(routePath({ name: 'services' })).toBe('/manage/services');
    expect(routePath({ name: 'search' })).toBe('/');
  });

  it('opens the owner on the management of their barbershop and anyone else on the search', () => {
    expect(startRoute('/', 'ADMIN_BARBERSHOP')).toEqual({ name: 'services' });
    expect(startRoute('/', 'CLIENT')).toEqual({ name: 'search' });
    expect(startRoute('/b1', 'ADMIN_BARBERSHOP')).toEqual({ name: 'search' });
  });

  it('hands the chosen barbershop and service to the appointment domain', () => {
    expect(bookingPath('b1', 's1')).toBe('/appointments/new?barbershopId=b1&serviceId=s1');
  });
});
