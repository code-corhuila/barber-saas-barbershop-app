import type { SessionUser } from '../shell-contract';

/**
 * The screens of the domain, under the shell's basePath (/barbershops). A small in-memory router:
 * the app keeps the route in state and mirrors it in the address with context.navigate, so the
 * shell keeps the app mounted and the back button can bring the user back.
 */
export type Route =
  | { name: 'search' }
  | { name: 'detail'; id: string }
  | { name: 'services' }
  | { name: 'barbers' };

const ID = /^\/([0-9a-fA-F-]{36})\/?$/;

export function parseRoute(path: string): Route {
  if (path.startsWith('/manage/services')) return { name: 'services' };
  if (path.startsWith('/manage/barbers')) return { name: 'barbers' };
  const id = ID.exec(path);
  return id ? { name: 'detail', id: id[1] } : { name: 'search' };
}

export function routePath(route: Route): string {
  switch (route.name) {
    case 'detail': return `/${route.id}`;
    case 'services': return '/manage/services';
    case 'barbers': return '/manage/barbers';
    default: return '/';
  }
}

/** The owner lands on managing their barbershop; a client, or anyone with a deep link, where the path says. */
export function startRoute(initialPath: string, role: SessionUser['role'] | undefined): Route {
  const route = parseRoute(initialPath);
  if (route.name === 'search' && (initialPath === '/' || initialPath === '') && role === 'ADMIN_BARBERSHOP') {
    return { name: 'services' };
  }
  return route;
}

/**
 * Booking belongs to the appointment domain (appointment-app): this app only hands over the chosen
 * barbershop and service. The address is agreed with the owner of appointment-app.
 */
export function bookingPath(barbershopId: string, serviceId: string): string {
  return `/appointments/new?barbershopId=${encodeURIComponent(barbershopId)}&serviceId=${encodeURIComponent(serviceId)}`;
}
