/**
 * The resources of barbershop-service.yaml, as the API returns them. They replace the prototype's
 * src/types/barbershop.ts: ids are UUIDs and money is integer cents (ADR-010), and the barber
 * profile carries no name or photo (DEC-SHOP-04).
 */
export interface Barbershop {
  id: string;
  name: string;
  address: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  timezone: string;
  cancellationPolicyHours: number;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
}

export interface BarberSpecialty {
  id: string;
  barberProfileId: string;
  specialtyName: string;
}

export interface BarberProfile {
  id: string;
  userId: string;
  experienceYears: number;
  bio: string | null;
  ratingAvg: number;
  ratingCount: number;
  specialties: BarberSpecialty[];
}

/** The {data, meta} envelope of every list (_shared.yaml). */
export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ServiceData {
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
}

export interface BarberProfileData {
  experienceYears: number;
  bio: string;
}

export interface BarberData extends BarberProfileData {
  userId: string;
}

/** What the owner types to create a barber account (CreateBarberRequest); phone blank when not given. */
export interface NewBarber {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

/** UserSummary of auth-service.yaml: only the id is needed to create the profile. */
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
}
