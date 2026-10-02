import { FormEvent, useState } from 'react';
import { IonButton, IonContent, IonModal, IonSpinner } from '@ionic/react';
import { createBarber, editBarber } from '../catalog/catalog-api';
import { type FieldErrors, validateBarber } from '../catalog/forms';
import type { BarberProfile } from '../catalog/types';
import type { ApiClient } from '../shell-contract';
import { Field } from '../ui/Field';
import { messageOf, newIdempotencyKey } from '../ui/load';

interface BarberFormProps {
  api: ApiClient;
  /** null: a new profile. */
  barber: BarberProfile | null;
  onClose(): void;
  onSaved(): void;
}

/**
 * Create or edit a barber profile. The user account (name, e-mail, password) belongs to identity-auth
 * and auth-service.yaml has no operation to create staff yet, so a new profile takes the id of a
 * BARBER user that already exists. The rating is never edited here.
 */
export function BarberForm({ api, barber, onClose, onSaved }: BarberFormProps) {
  const [userId, setUserId] = useState(barber?.userId ?? '');
  const [years, setYears] = useState(barber ? String(barber.experienceYears) : '');
  const [bio, setBio] = useState(barber?.bio ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [key] = useState(newIdempotencyKey);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = validateBarber({ userId, experienceYears: years, bio });
    setErrors(checked.errors);
    setFailure(null);
    if (!checked.data || pending) return;
    setPending(true);
    try {
      if (barber) await editBarber(api, barber.id, checked.data);
      else await createBarber(api, checked.data, key);
      onSaved();
    } catch (err) {
      setFailure(messageOf(err, 'No se pudo guardar el barbero. Inténtalo de nuevo.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <IonModal isOpen className="bs-modal" onDidDismiss={onClose}>
      <IonContent>
        <form className="bs-page bs-root" onSubmit={submit} noValidate>
          <h2 className="bs-header">{barber ? 'Editar barbero' : 'Nuevo barbero'}</h2>
          {!barber && (
            <>
              <Field id="barber-user" label="Identificador del usuario barbero" value={userId} error={errors.userId}
                     onChange={setUserId} placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6" />
              <p className="bs-hint">La cuenta del barbero se crea en el registro de usuarios; aquí se crea su perfil.</p>
            </>
          )}
          <Field id="barber-years" label="Años de experiencia" value={years} inputMode="numeric"
                 error={errors.experienceYears} onChange={setYears} placeholder="0" />
          <Field id="barber-bio" label="Biografía (opcional)" value={bio} multiline error={errors.bio} onChange={setBio} />
          {failure && <div className="bs-alert" role="alert">{failure}</div>}
          <IonButton expand="block" type="submit" className="bs-primary" disabled={pending}>
            {pending ? <IonSpinner name="crescent" aria-label="Guardando" /> : 'Guardar'}
          </IonButton>
          <IonButton expand="block" fill="clear" className="bs-secondary" onClick={onClose}>Cancelar</IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
}
