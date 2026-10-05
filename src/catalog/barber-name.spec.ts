import { describe, expect, it } from 'vitest';
import { barberName } from './barber-name';

describe('barber name', () => {
  it('shows the name barbershop-api copied from identity-auth', () => {
    expect(barberName({ fullName: ' Juan Pérez ' })).toBe('Juan Pérez');
  });

  it('falls back to a Spanish text for a profile created before the name was kept', () => {
    expect(barberName({ fullName: null })).toBe('Barbero sin nombre');
    expect(barberName({ fullName: '  ' })).toBe('Barbero sin nombre');
  });
});
