import { FormEvent, useState } from 'react';
import { IonButton, IonContent, IonInput, IonModal, IonSpinner } from '@ionic/react';
import { addBarber, type AddBarberProgress } from '../catalog/add-barber';
import { type FieldErrors, validateNewBarber } from '../catalog/forms';
import type { ApiClient } from '../shell-contract';
import { Field } from '../ui/Field';
import { messageOf, newIdempotencyKey } from '../ui/load';

interface AddBarberFormProps {
  api: ApiClient;
  onClose(): void;
  onSaved(): void;
}

/**
 * "Agregar barbero" (HU-SHOP-002), from the prototype's (admin)/employees: the account with an initial
 * password the owner gives the barber, then the profile. When only the profile failed, the data is
 * locked and saving retries just the profile; experience and bio are edited afterwards.
 */
export function AddBarberForm({ api, onClose, onSaved }: AddBarberFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<AddBarberProgress>(() => ({
    accountId: null, accountKey: newIdempotencyKey(), profileKey: newIdempotencyKey(),
  }));
  const accountCreated = progress.accountId !== null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = validateNewBarber({ fullName, email, phone, password });
    setErrors(checked.errors);
    setFailure(null);
    if (!checked.data || pending) return;
    setPending(true);
    const result = await addBarber(api, checked.data, progress);
    setPending(false);
    switch (result.outcome) {
      case 'added':
        onSaved();
        return;
      case 'email-taken':
        // Nothing was created: the corrected data goes with a new key.
        setErrors({ email: 'Ese correo ya está registrado' });
        setProgress((p) => ({ ...p, accountKey: newIdempotencyKey() }));
        return;
      case 'account-failed':
        setFailure(messageOf(result.error, 'No se pudo crear la cuenta del barbero. Inténtalo de nuevo.'));
        return;
      case 'profile-failed':
        setProgress((p) => ({ ...p, accountId: result.accountId }));
        setFailure(`${messageOf(result.error, 'No se pudo crear el perfil.')} `
          + 'La cuenta ya quedó creada: reintenta para crear solo el perfil.');
    }
  }

  return (
    <IonModal isOpen className="bs-modal" onDidDismiss={onClose}>
      <IonContent>
        <form className="bs-page bs-root" onSubmit={submit} noValidate>
          <h2 className="bs-header">Agregar barbero</h2>
          <Field id="new-barber-name" label="Nombre completo" value={fullName} error={errors.fullName}
                 disabled={accountCreated} onChange={setFullName} />
          <Field id="new-barber-email" label="Correo" value={email} error={errors.email} disabled={accountCreated}
                 onChange={setEmail} placeholder="barbero@correo.com" />
          <Field id="new-barber-phone" label="Teléfono (opcional)" value={phone} error={errors.phone}
                 disabled={accountCreated} onChange={setPhone} />
          <div className="bs-field">
            <IonInput id="new-barber-password" label="Contraseña inicial" labelPlacement="stacked" type="password"
                      value={password} disabled={accountCreated} aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'new-barber-password-error' : undefined}
                      onIonInput={(e) => setPassword(String(e.detail.value ?? ''))} />
            {errors.password && <div id="new-barber-password-error" className="bs-field-error">{errors.password}</div>}
          </div>
          <p className="bs-hint">Entrégale esta contraseña al barbero; podrá cambiarla al recuperar su contraseña.</p>
          {failure && <div className="bs-alert" role="alert">{failure}</div>}
          <IonButton expand="block" type="submit" className="bs-primary" disabled={pending}>
            {pending ? <IonSpinner name="crescent" aria-label="Guardando" /> : accountCreated ? 'Reintentar perfil' : 'Guardar'}
          </IonButton>
          <IonButton expand="block" fill="clear" className="bs-secondary" onClick={onClose}>Cancelar</IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
}
