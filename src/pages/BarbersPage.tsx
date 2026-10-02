import { FormEvent, useState } from 'react';
import { IonButton, IonInput } from '@ionic/react';
import { addSpecialty, listMyBarbers, removeSpecialty } from '../catalog/catalog-api';
import { validateSpecialty } from '../catalog/forms';
import type { BarberProfile } from '../catalog/types';
import type { ApiClient } from '../shell-contract';
import { LoadView } from '../ui/LoadView';
import { messageOf, newIdempotencyKey, useLoad } from '../ui/load';
import { BarberForm } from './BarberForm';

/** One specialty input per barber; the key is kept while the same specialty is retried. */
function SpecialtyAdder({ api, barber, onChanged }: { api: ApiClient; barber: BarberProfile; onChanged(): void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(newIdempotencyKey);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const invalid = validateSpecialty(name);
    setError(invalid);
    if (invalid) return;
    try {
      await addSpecialty(api, barber.id, name, key);
      setName('');
      setKey(newIdempotencyKey());
      onChanged();
    } catch (err) {
      setError(messageOf(err, 'No se pudo agregar la especialidad.'));
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }} noValidate>
      <div className="bs-field" style={{ flex: 1, marginBottom: 0 }}>
        <IonInput aria-label="Nueva especialidad" placeholder="Nueva especialidad" value={name}
                  onIonInput={(e) => setName(String(e.detail.value ?? ''))} />
        {error && <div className="bs-field-error" role="alert">{error}</div>}
      </div>
      <IonButton type="submit" size="small" className="bs-secondary" fill="outline">Agregar</IonButton>
    </form>
  );
}

/**
 * The owner's barbers: the profiles of their barbershop with experience, bio and specialties. It
 * replaces the prototype's (admin)/employees for what the barbershop domain owns; creating the
 * user accounts, commissions and payroll belong to other domains.
 */
export function BarbersPage({ api }: { api: ApiClient }) {
  const [result, reload] = useLoad(() => listMyBarbers(api), [], 'No se pudieron cargar tus barberos.');
  const [editing, setEditing] = useState<BarberProfile | null | undefined>(undefined);
  const [failure, setFailure] = useState<string | null>(null);

  async function remove(barber: BarberProfile, specialtyId: string) {
    setFailure(null);
    try {
      await removeSpecialty(api, barber.id, specialtyId);
      reload();
    } catch (err) {
      setFailure(messageOf(err, 'No se pudo quitar la especialidad.'));
    }
  }

  return (
    <section className="bs-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="bs-header">Barberos</h1>
        <IonButton className="bs-primary" onClick={() => setEditing(null)}>+ Nuevo</IonButton>
      </div>
      {failure && <div className="bs-alert" role="alert">{failure}</div>}
      <LoadView load={result} onRetry={reload} isEmpty={(page) => page.data.length === 0}
                empty="Aún no tienes barberos con perfil. Crea el primero.">
        {(page) => page.data.map((barber) => (
          <div key={barber.id} className="bs-card" style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}>
              <span>
                <p className="bs-title">{barber.experienceYears} años de experiencia</p>
                {barber.ratingCount > 0 && <p className="bs-gold">⭐ {barber.ratingAvg.toFixed(1)} ({barber.ratingCount})</p>}
                {barber.bio && <p className="bs-muted">{barber.bio}</p>}
                <p className="bs-muted">Usuario: {barber.userId}</p>
              </span>
              <IonButton size="small" fill="clear" className="bs-secondary" onClick={() => setEditing(barber)}>Editar</IonButton>
            </div>
            <span className="bs-chips">
              {barber.specialties.map((s) => (
                <span key={s.id} className="bs-chip">
                  {s.specialtyName}{' '}
                  <button type="button" aria-label={`Quitar ${s.specialtyName}`} onClick={() => remove(barber, s.id)}
                          style={{ all: 'unset', cursor: 'pointer', marginLeft: '.25rem' }}>×</button>
                </span>
              ))}
            </span>
            <SpecialtyAdder api={api} barber={barber} onChanged={reload} />
          </div>
        ))}
      </LoadView>
      {editing !== undefined && (
        <BarberForm api={api} barber={editing} onClose={() => setEditing(undefined)}
                    onSaved={() => { setEditing(undefined); reload(); }} />
      )}
    </section>
  );
}
