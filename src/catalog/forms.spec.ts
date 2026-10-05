import { describe, expect, it } from 'vitest';
import { formatCop, pesosToCents } from './money';
import { validateBarber, validateNewBarber, validateService, validateSpecialty } from './forms';

describe('money', () => {
  it('shows cents as Colombian pesos without decimals', () => {
    expect(formatCop(2500000)).toBe('$ 25.000');
    expect(formatCop(0)).toBe('$ 0');
  });

  it('turns what the owner types, in pesos, into cents', () => {
    expect(pesosToCents('25000')).toBe(2500000);
    expect(pesosToCents('25.000')).toBe(2500000);
    expect(pesosToCents(' ')).toBeNull();
    expect(pesosToCents('-5')).toBeNull();
    expect(pesosToCents('abc')).toBeNull();
  });
});

describe('service form', () => {
  it('accepts what the contract accepts', () => {
    const result = validateService({ name: 'Corte clásico', description: '', duration: '30', price: '25000' });

    expect(result.errors).toEqual({});
    expect(result.data).toEqual({ name: 'Corte clásico', description: '', durationMinutes: 30, priceCents: 2500000 });
  });

  it('explains in Spanish every field the contract would reject', () => {
    const result = validateService({ name: ' ', description: 'd'.repeat(256), duration: '4', price: 'gratis' });

    expect(result.data).toBeNull();
    expect(result.errors).toEqual({
      name: 'Escribe el nombre del servicio.',
      description: 'La descripción tiene máximo 255 caracteres.',
      duration: 'La duración es de al menos 5 minutos.',
      price: 'Escribe un precio válido en pesos.',
    });
  });
});

describe('barber and specialty forms', () => {
  it('edits a profile with a non-negative experience', () => {
    expect(validateBarber({ experienceYears: '-1', bio: '' }).errors).toEqual({
      experienceYears: 'Los años de experiencia no pueden ser negativos.',
    });
    expect(validateBarber({ experienceYears: '', bio: 'Fades' }).data).toEqual({ experienceYears: 0, bio: 'Fades' });
  });

  it('keeps a specialty between 1 and 80 characters', () => {
    expect(validateSpecialty(' ')).toBe('Escribe la especialidad.');
    expect(validateSpecialty('x'.repeat(81))).toBe('La especialidad tiene máximo 80 caracteres.');
    expect(validateSpecialty('Fade')).toBeNull();
  });
});

describe('new barber form', () => {
  it('accepts what auth-service.yaml accepts, with the phone optional', () => {
    const result = validateNewBarber({ fullName: ' Juan Pérez ', email: 'juan@elclasico.co', phone: '', password: 'Inicial2026' });

    expect(result.errors).toEqual({});
    expect(result.data).toEqual({ fullName: 'Juan Pérez', email: 'juan@elclasico.co', phone: '', password: 'Inicial2026' });
  });

  it('explains in Spanish every field the contract would reject', () => {
    const result = validateNewBarber({ fullName: ' ', email: 'juan@', phone: '1'.repeat(21), password: 'inicial' });

    expect(result.data).toBeNull();
    expect(result.errors).toEqual({
      fullName: 'Escribe el nombre del barbero.',
      email: 'Escribe un correo válido.',
      phone: 'El teléfono tiene máximo 20 caracteres.',
      password: 'La contraseña necesita al menos 8 caracteres, una mayúscula y un número.',
    });
  });

  it('asks for an uppercase letter and a digit in the initial password', () => {
    const base = { fullName: 'Juan', email: 'juan@elclasico.co', phone: '' };

    expect(validateNewBarber({ ...base, password: 'inicial2026' }).errors.password).toBeDefined();
    expect(validateNewBarber({ ...base, password: 'InicialDos' }).errors.password).toBeDefined();
    expect(validateNewBarber({ ...base, password: 'Inicial2026' }).errors.password).toBeUndefined();
  });
});
