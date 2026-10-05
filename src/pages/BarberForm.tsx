import { FormEvent, useState } from 'react';
import { IonButton, IonContent, IonModal, IonSpinner } from '@ionic/react';
import { editBarber } from '../catalog/catalog-api';
import { type FieldErrors, validateBarber } from '../catalog/forms';
import type { BarberProfile } from '../catalog/types';
import type { ApiClient } from '../shell-contract';
import { Field } from '../ui/Field';
import { messageOf } from '../ui/load';

interface BarberFormProps {
  api: ApiClient;
  barber: BarberProfile;
  onClose(): void;
  onSaved(): void;
}

/**
 * Edit a barber profile: experience and bio. A new barber is added with AddBarberForm; the account
 * (name, e-mail, password) belongs to identity-auth. The rating is never edited here.
 */
export function BarberForm({ api, barber, onClose, onSaved }: BarberFormProps) {
  const [years, setYears] = useState(String(barber.experienceYears));
  const [bio, setBio] = useState(barber.bio ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = validateBarber({ experienceYears: years, bio });
    setErrors(checked.errors);
    setFailure(null);
    if (!checked.data || pending) return;
    setPending(true);
    try {
      await editBarber(api, barber.id, checked.data);
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
          <h2 className="bs-header">Editar barbero</h2>
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
