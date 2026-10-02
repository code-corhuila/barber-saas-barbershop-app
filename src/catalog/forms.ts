import { pesosToCents } from './money';
import type { BarberData, ServiceData } from './types';

/**
 * Field checks with the limits of barbershop-service.yaml, so the owner reads what is wrong before
 * sending. The service checks the same again; its errors arrive as error.userMessage.
 */
export type FieldErrors = Partial<Record<string, string>>;

export interface Checked<T> {
  data: T | null;
  errors: FieldErrors;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateService(form: { name: string; description: string; duration: string; price: string }):
    Checked<ServiceData> {
  const errors: FieldErrors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Escribe el nombre del servicio.';
  else if (name.length > 100) errors.name = 'El nombre tiene máximo 100 caracteres.';
  if (form.description.trim().length > 255) errors.description = 'La descripción tiene máximo 255 caracteres.';
  const duration = Number(form.duration);
  if (!Number.isInteger(duration) || duration < 5) errors.duration = 'La duración es de al menos 5 minutos.';
  const priceCents = pesosToCents(form.price);
  if (priceCents === null) errors.price = 'Escribe un precio válido en pesos.';
  if (Object.keys(errors).length > 0) return { data: null, errors };
  return { data: { name, description: form.description.trim(), durationMinutes: duration, priceCents: priceCents! },
    errors };
}

/** The user is created in identity-auth; the owner pastes its id here (auth-service.yaml has no lookup yet). */
export function validateBarber(form: { userId: string; experienceYears: string; bio: string }): Checked<BarberData> {
  const errors: FieldErrors = {};
  const userId = form.userId.trim();
  if (!UUID.test(userId)) errors.userId = 'Pega el identificador del usuario barbero.';
  const years = form.experienceYears.trim() === '' ? 0 : Number(form.experienceYears);
  if (!Number.isInteger(years) || years < 0) errors.experienceYears = 'Los años de experiencia no pueden ser negativos.';
  if (form.bio.trim().length > 500) errors.bio = 'La biografía tiene máximo 500 caracteres.';
  if (Object.keys(errors).length > 0) return { data: null, errors };
  return { data: { userId, experienceYears: years, bio: form.bio.trim() }, errors };
}

export function validateSpecialty(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Escribe la especialidad.';
  if (value.length > 80) return 'La especialidad tiene máximo 80 caracteres.';
  return null;
}
