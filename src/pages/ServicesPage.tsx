import { useState } from 'react';
import { IonButton } from '@ionic/react';
import { listMyServices, updateService } from '../catalog/catalog-api';
import { formatCop } from '../catalog/money';
import type { Service } from '../catalog/types';
import type { ApiClient } from '../shell-contract';
import { LoadView } from '../ui/LoadView';
import { messageOf, useLoad } from '../ui/load';
import { ServiceForm } from './ServiceForm';

/**
 * The prototype's (admin)/services for the owner: every service of their barbershop, active or not.
 * Deactivating is a PUT with isActive (the prototype's PATCH .../toggle); it never deletes, so past
 * appointments keep resolving the service.
 */
export function ServicesPage({ api }: { api: ApiClient }) {
  const [result, reload] = useLoad(() => listMyServices(api), [], 'No se pudieron cargar tus servicios.');
  const [editing, setEditing] = useState<Service | null | undefined>(undefined);
  const [toggling, setToggling] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function toggle(service: Service) {
    setToggling(service.id);
    setFailure(null);
    try {
      await updateService(api, service.id, { name: service.name, description: service.description ?? '',
        durationMinutes: service.durationMinutes, priceCents: service.priceCents }, !service.isActive);
      reload();
    } catch (err) {
      setFailure(messageOf(err, 'No se pudo cambiar el estado del servicio.'));
    } finally {
      setToggling(null);
    }
  }

  return (
    <section className="bs-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="bs-header">Servicios</h1>
        <IonButton className="bs-primary" onClick={() => setEditing(null)}>+ Nuevo</IonButton>
      </div>
      {failure && <div className="bs-alert" role="alert">{failure}</div>}
      <LoadView load={result} onRetry={reload} isEmpty={(page) => page.data.length === 0}
                empty="Aún no tienes servicios. Crea el primero.">
        {(page) => page.data.map((service) => (
          <div key={service.id} className={`bs-card${service.isActive ? '' : ' inactive'}`}>
            <button type="button" className="bs-grow" style={{ all: 'unset', flex: 1, cursor: 'pointer' }}
                    onClick={() => setEditing(service)} aria-label={`Editar ${service.name}`}>
              <p className="bs-title">{service.name}</p>
              {service.description && <p className="bs-muted">{service.description}</p>}
              <p className="bs-muted">{service.durationMinutes} min</p>
            </button>
            <span style={{ display: 'grid', justifyItems: 'end', gap: '.25rem' }}>
              <span className="bs-price">{formatCop(service.priceCents)}</span>
              <IonButton size="small" fill={service.isActive ? 'solid' : 'outline'}
                         className={service.isActive ? 'bs-primary' : 'bs-secondary'}
                         disabled={toggling === service.id} onClick={() => toggle(service)}>
                {service.isActive ? 'Activo' : 'Inactivo'}
              </IonButton>
            </span>
          </div>
        ))}
      </LoadView>
      {editing !== undefined && (
        <ServiceForm api={api} service={editing} onClose={() => setEditing(undefined)}
                     onSaved={() => { setEditing(undefined); reload(); }} />
      )}
    </section>
  );
}
