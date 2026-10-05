import { pesosToCents } from './money';
import type { BarberProfileData, NewBarber, ServiceData } from './types';

/**
 * Field checks with the limits of barbershop-service.yaml, so the owner reads what is wrong before
 * sending. The service checks the same again; its errors arrive as error.userMessage.
 */
export type FieldErrors = Partial<Record<string, string>>;

export interface Checked<T> {
  data: T | null;
  errors: FieldErrors;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** auth-service.yaml Password: 8 to 100 characters, one uppercase letter and one digit. */
const PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,100}$/;

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

/** The editable part of a barber profile; the user account is not edited here. */
export function validateBarber(form: { experienceYears: string; bio: string }): Checked<BarberProfileData> {
  const errors: FieldErrors = {};
  const years = form.experienceYears.trim() === '' ? 0 : Number(form.experienceYears);
  if (!Number.isInteger(years) || years < 0) errors.experienceYears = 'Los años de experiencia no pueden ser negativos.';
  if (form.bio.trim().length > 500) errors.bio = 'La biografía tiene máximo 500 caracteres.';
  if (Object.keys(errors).length > 0) return { data: null, errors };
  return { data: { experienceYears: years, bio: form.bio.trim() }, errors };
}

/** CreateBarberRequest of auth-service.yaml (DEC-AUTH-05): the barbershop and the role come from the token. */
export function validateNewBarber(form: NewBarber): Checked<NewBarber> {
  const errors: FieldErrors = {};
  const fullName = form.fullName.trim();
  const email = form.email.trim();
  if (!fullName) errors.fullName = 'Escribe el nombre del barbero.';
  else if (fullName.length > 120) errors.fullName = 'El nombre tiene máximo 120 caracteres.';
  if (!EMAIL.test(email) || email.length > 150) errors.email = 'Escribe un correo válido.';
  if (form.phone.trim().length > 20) errors.phone = 'El teléfono tiene máximo 20 caracteres.';
  if (!PASSWORD.test(form.password)) {
    errors.password = 'La contraseña necesita al menos 8 caracteres, una mayúscula y un número.';
  }
  if (Object.keys(errors).length > 0) return { data: null, errors };
  return { data: { fullName, email, phone: form.phone.trim(), password: form.password }, errors };
}

export function validateSpecialty(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Escribe la especialidad.';
  if (value.length > 80) return 'La especialidad tiene máximo 80 caracteres.';
  return null;
}
