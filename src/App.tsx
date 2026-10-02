import { useCallback, useEffect, useState } from 'react';
import type { MountContext } from './shell-contract';
import { bookingPath, parseRoute, routePath, startRoute, type Route } from './navigation/routes';
import { DetailPage } from './pages/DetailPage';
import { SearchPage } from './pages/SearchPage';
import { STYLES } from './ui/styles';

/** The path inside the domain from the browser address, e.g. /barbershops/abc → /abc. */
function pathInDomain(basePath: string): string {
  const path = window.location.pathname;
  return path.startsWith(basePath) ? path.slice(basePath.length) || '/' : '/';
}

/**
 * The barbershop domain app (ADR-013). Everything it requests goes through context.api and it
 * never stores a token: the session is the shell's (norm 5.4.1).
 */
export function App({ context }: { context: MountContext }) {
  const [route, setRoute] = useState<Route>(() => startRoute(context.initialPath, context.session.user()?.role));

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

  return (
    <div className="bs-root">
      <style>{STYLES}</style>
      {route.name === 'detail'
        ? <DetailPage api={context.api} id={route.id} onBack={() => go({ name: 'search' })}
                      onBook={(serviceId) => context.navigate(bookingPath(route.id, serviceId))} />
        : <SearchPage api={context.api} onOpen={(id) => go({ name: 'detail', id })} />}
    </div>
  );
}
