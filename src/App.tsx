import { useCallback, useEffect, useState } from 'react';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/react';
import type { MountContext } from './shell-contract';
import { bookingPath, parseRoute, routePath, startRoute, type Route } from './navigation/routes';
import { BarbersPage } from './pages/BarbersPage';
import { DetailPage } from './pages/DetailPage';
import { SearchPage } from './pages/SearchPage';
import { ServicesPage } from './pages/ServicesPage';
import { STYLES } from './ui/styles';

/** The path inside the domain from the browser address, e.g. /barbershops/abc → /abc. */
function pathInDomain(basePath: string): string {
  const path = window.location.pathname;
  return path.startsWith(basePath) ? path.slice(basePath.length) || '/' : '/';
}

/** The owner's sections; the services refuse the same operations to other roles (403). */
const OWNER_TABS: { route: Route; label: string }[] = [
  { route: { name: 'services' }, label: 'Servicios' },
  { route: { name: 'barbers' }, label: 'Barberos' },
  { route: { name: 'search' }, label: 'Catálogo' },
];

/**
 * The barbershop domain app (ADR-013). Everything it requests goes through context.api and it
 * never stores a token: the session is the shell's (norm 5.4.1).
 */
export function App({ context }: { context: MountContext }) {
  const role = context.session.user()?.role;
  const isOwner = role === 'ADMIN_BARBERSHOP';
  const [route, setRoute] = useState<Route>(() => startRoute(context.initialPath, role));

  const go = useCallback((next: Route) => {
    setRoute(next);
    context.navigate(context.basePath + routePath(next));
  }, [context]);

  // The back button changes the address; the shell keeps this app mounted, so follow it here.
  useEffect(() => {
    const follow = () => setRoute(parseRoute(pathInDomain(context.basePath)));
    window.addEventListener('popstate', follow);
    return () => window.removeEventListener('popstate', follow);
  }, [context.basePath]);

  function screen() {
    switch (route.name) {
      case 'detail':
        return <DetailPage api={context.api} id={route.id} onBack={() => go({ name: 'search' })}
                           onBook={(serviceId) => context.navigate(bookingPath(route.id, serviceId))} />;
      case 'services':
        if (isOwner) return <ServicesPage api={context.api} />;
        return <SearchPage api={context.api} onOpen={(id) => go({ name: 'detail', id })} />;
      case 'barbers':
        if (isOwner) return <BarbersPage api={context.api} />;
        return <SearchPage api={context.api} onOpen={(id) => go({ name: 'detail', id })} />;
      default:
        return <SearchPage api={context.api} onOpen={(id) => go({ name: 'detail', id })} />;
    }
  }

  return (
    <div className="bs-root">
      <style>{STYLES}</style>
      {isOwner && route.name !== 'detail' && (
        <div className="bs-page" style={{ paddingBottom: 0 }}>
          <IonSegment className="bs-tabs" value={route.name}
                      onIonChange={(e) => go(OWNER_TABS.find((t) => t.route.name === e.detail.value)?.route
                        ?? { name: 'search' })}>
            {OWNER_TABS.map((tab) => (
              <IonSegmentButton key={tab.route.name} value={tab.route.name}>
                <IonLabel>{tab.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>
      )}
      {screen()}
    </div>
  );
}
