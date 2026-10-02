import { useEffect, useState } from 'react';
import { IonSearchbar } from '@ionic/react';
import { searchBarbershops, type Search } from '../catalog/catalog-api';
import type { ApiClient } from '../shell-contract';
import { LoadView } from '../ui/LoadView';
import { useLoad } from '../ui/load';

type Position = Search['position'];

/**
 * Asks for the position once (the prototype's expo-location step). If it is denied or slow, the
 * search still works, only without ordering by distance.
 */
function usePosition(): { position: Position; settled: boolean } {
  const [position, setPosition] = useState<Position>(undefined);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!('geolocation' in navigator)) { setSettled(true); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }); setSettled(true); },
      () => setSettled(true),
      { timeout: 5000, maximumAge: 300000 },
    );
  }, []);
  return { position, settled };
}

/** The prototype's (client)/home: barbershops near the client, or filtered by city. */
export function SearchPage({ api, onOpen }: { api: ApiClient; onOpen(id: string): void }) {
  const { position, settled } = usePosition();
  const [city, setCity] = useState('');
  const [result, reload] = useLoad(
    () => (settled ? searchBarbershops(api, { city, position }) : new Promise<never>(() => undefined)),
    [settled, city, position?.lat, position?.lng], 'No se pudieron cargar las barberías.');

  return (
    <section className="bs-page">
      <h1 className="bs-header">{position ? 'Barberías cerca de ti' : 'Barberías disponibles'}</h1>
      <IonSearchbar className="bs-search" placeholder="Filtrar por ciudad" debounce={400} value={city}
                    onIonInput={(e) => setCity(String(e.detail.value ?? ''))} aria-label="Ciudad" />
      <LoadView load={result} onRetry={reload} isEmpty={(page) => page.data.length === 0}
                empty={city ? `No hay barberías disponibles en ${city.trim()}.` : 'No hay barberías disponibles por ahora.'}>
        {(page) => page.data.map((shop) => (
          <button key={shop.id} type="button" className="bs-card" onClick={() => onOpen(shop.id)}>
            {shop.logoUrl
              ? <img className="bs-logo" src={shop.logoUrl} alt="" />
              : <span className="bs-logo" aria-hidden="true">{shop.name.charAt(0).toUpperCase()}</span>}
            <span className="bs-grow">
              <p className="bs-title">{shop.name}</p>
              <p className="bs-gold">{shop.city}</p>
              {shop.address && <p className="bs-muted">{shop.address}</p>}
            </span>
          </button>
        ))}
      </LoadView>
    </section>
  );
}
