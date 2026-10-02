import { useState } from 'react';
import { IonButton } from '@ionic/react';
import { getBarbershop, listPublicBarbers, listPublicServices } from '../catalog/catalog-api';
import { formatCop } from '../catalog/money';
import type { ApiClient } from '../shell-contract';
import { LoadView } from '../ui/LoadView';
import { useLoad } from '../ui/load';

interface DetailPageProps {
  api: ApiClient;
  id: string;
  onBack(): void;
  onBook(serviceId: string): void;
}

/**
 * The prototype's (client)/barbershop/[id]: the barbershop, its active services and its barbers,
 * read from the public catalog (DEC-SHOP-02). Choosing a service hands over to booking, which
 * belongs to the appointment domain. Reviews, favourites, gallery and promotions are not carried
 * over: they are outside the scope (06-data/models.md §11).
 */
export function DetailPage({ api, id, onBack, onBook }: DetailPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, reload] = useLoad(
    () => Promise.all([getBarbershop(api, id), listPublicServices(api, id), listPublicBarbers(api, id)]),
    [id], 'No se pudo cargar la barbería.');

  return (
    <section className="bs-page">
      <IonButton fill="clear" className="bs-secondary" onClick={onBack}>‹ Barberías</IonButton>
      <LoadView load={result} onRetry={reload} isEmpty={() => false} empty="">
        {([shop, services, barbers]) => (
          <>
            {shop.logoUrl && <img className="bs-banner" src={shop.logoUrl} alt="" />}
            <h1 className="bs-header">{shop.name}</h1>
            <p className="bs-muted">{[shop.address, shop.city].filter(Boolean).join(', ')}</p>
            {shop.phone && <p className="bs-muted">Teléfono: {shop.phone}</p>}
            <p className="bs-muted">Puedes cancelar hasta {shop.cancellationPolicyHours} h antes de tu cita.</p>

            <h2 className="bs-section">Servicios</h2>
            {services.data.length === 0
              ? <p className="bs-empty">Esta barbería aún no tiene servicios publicados.</p>
              : services.data.map((service) => (
                <button key={service.id} type="button" aria-pressed={selected === service.id}
                        className={`bs-card${selected === service.id ? ' selected' : ''}`}
                        onClick={() => setSelected(service.id)}>
                  <span className="bs-grow">
                    <p className="bs-title">{service.name}</p>
                    {service.description && <p className="bs-muted">{service.description}</p>}
                    <p className="bs-muted">{service.durationMinutes} min</p>
                  </span>
                  <span className="bs-price">{formatCop(service.priceCents)}</span>
                </button>
              ))}

            <h2 className="bs-section">Barberos</h2>
            {barbers.data.length === 0
              ? <p className="bs-empty">Esta barbería aún no tiene barberos registrados.</p>
              : barbers.data.map((barber) => (
                <div key={barber.id} className="bs-card">
                  <span className="bs-logo" aria-hidden="true">✂</span>
                  <span className="bs-grow">
                    <p className="bs-title">{barber.experienceYears} años de experiencia</p>
                    {barber.ratingCount > 0 && <p className="bs-gold">⭐ {barber.ratingAvg.toFixed(1)} ({barber.ratingCount})</p>}
                    {barber.bio && <p className="bs-muted">{barber.bio}</p>}
                    {barber.specialties.length > 0 && (
                      <span className="bs-chips">
                        {barber.specialties.map((s) => <span key={s.id} className="bs-chip">{s.specialtyName}</span>)}
                      </span>
                    )}
                  </span>
                </div>
              ))}

            <div className="bs-footer">
              <IonButton expand="block" className="bs-primary" disabled={!selected}
                         onClick={() => selected && onBook(selected)}>
                {selected ? 'Continuar' : 'Selecciona un servicio'}
              </IonButton>
            </div>
          </>
        )}
      </LoadView>
    </section>
  );
}
