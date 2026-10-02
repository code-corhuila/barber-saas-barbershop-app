import type { ApiClient } from '../shell-contract';
import type { BarberData, BarberProfile, BarberSpecialty, Barbershop, Page, Service, ServiceData } from './types';

/**
 * Typed calls to barbershop-service.yaml, ALWAYS through the shell's client (context.api): never
 * fetch or axios (norm 5.4.1). The barbershop of the management calls is the token's: no call
 * sends a barbershopId. Every creation carries the Idempotency-Key the form keeps while it retries.
 */

export interface Search {
  city?: string;
  position?: { lat: number; lng: number };
}

/** The public discovery catalog (DEC-SHOP-02): only TRIAL and ACTIVE barbershops, closest first with a position. */
export function searchBarbershops(api: ApiClient, search: Search): Promise<Page<Barbershop>> {
  const query = new URLSearchParams();
  const city = search.city?.trim();
  if (city) query.set('city', city);
  if (search.position) {
    query.set('lat', String(search.position.lat));
    query.set('lng', String(search.position.lng));
  }
  query.set('limit', '50');
  return api.get<Page<Barbershop>>(`/api/v1/barbershops?${query}`);
}

export function getBarbershop(api: ApiClient, id: string): Promise<Barbershop> {
  return api.get<Barbershop>(`/api/v1/barbershops/${id}`);
}

export function listPublicServices(api: ApiClient, barbershopId: string): Promise<Page<Service>> {
  return api.get<Page<Service>>(`/api/v1/barbershops/${barbershopId}/services?limit=100`);
}

export function listPublicBarbers(api: ApiClient, barbershopId: string): Promise<Page<BarberProfile>> {
  return api.get<Page<BarberProfile>>(`/api/v1/barbershops/${barbershopId}/barbers?limit=100`);
}

/** The owner sees active and inactive services of their barbershop. */
export function listMyServices(api: ApiClient): Promise<Page<Service>> {
  return api.get<Page<Service>>('/api/v1/services?limit=100');
}

function serviceBody(data: ServiceData) {
  return {
    name: data.name.trim(),
    description: data.description.trim() || null,
    durationMinutes: data.durationMinutes,
    priceCents: data.priceCents,
  };
}

export function createService(api: ApiClient, data: ServiceData, idempotencyKey: string): Promise<Service> {
  return api.post<Service>('/api/v1/services', serviceBody(data), { idempotencyKey });
}

/** PUT replaces the service; deactivating never deletes it (past appointments keep resolving it). */
export function updateService(api: ApiClient, id: string, data: ServiceData, isActive: boolean): Promise<Service> {
  return api.put<Service>(`/api/v1/services/${id}`, { ...serviceBody(data), isActive });
}

export function listMyBarbers(api: ApiClient): Promise<Page<BarberProfile>> {
  return api.get<Page<BarberProfile>>('/api/v1/barbers?limit=100');
}

export function createBarber(api: ApiClient, data: BarberData, idempotencyKey: string): Promise<BarberProfile> {
  return api.post<BarberProfile>('/api/v1/barbers',
    { userId: data.userId, experienceYears: data.experienceYears, bio: data.bio.trim() || null }, { idempotencyKey });
}

export function editBarber(api: ApiClient, id: string, data: Omit<BarberData, 'userId'>): Promise<BarberProfile> {
  return api.patch<BarberProfile>(`/api/v1/barbers/${id}`,
    { experienceYears: data.experienceYears, bio: data.bio.trim() || null });
}

export function addSpecialty(api: ApiClient, barberId: string, name: string, idempotencyKey: string): Promise<BarberSpecialty> {
  return api.post<BarberSpecialty>(`/api/v1/barbers/${barberId}/specialties`, { specialtyName: name.trim() },
    { idempotencyKey });
}

export function removeSpecialty(api: ApiClient, barberId: string, specialtyId: string): Promise<void> {
  return api.delete<void>(`/api/v1/barbers/${barberId}/specialties/${specialtyId}`);
}
