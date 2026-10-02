import { FormEvent, useState } from 'react';
import { IonButton, IonContent, IonModal, IonSpinner } from '@ionic/react';
import { createService, updateService } from '../catalog/catalog-api';
import { type FieldErrors, validateService } from '../catalog/forms';
import { centsToPesos } from '../catalog/money';
import type { Service } from '../catalog/types';
import type { ApiClient } from '../shell-contract';
import { Field } from '../ui/Field';
import { messageOf, newIdempotencyKey } from '../ui/load';

interface ServiceFormProps {
  api: ApiClient;
  /** null: a new service. */
  service: Service | null;
  onClose(): void;
  onSaved(): void;
}

/** Create or edit a service (the prototype's ServiceFormModal). Mounted fresh each time it opens. */
export function ServiceForm({ api, service, onClose, onSaved }: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [duration, setDuration] = useState(service ? String(service.durationMinutes) : '');
  const [price, setPrice] = useState(service ? centsToPesos(service.priceCents) : '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // One key for this intent: a retry after a network failure never creates a second service.
  const [key] = useState(newIdempotencyKey);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const checked = validateService({ name, description, duration, price });
    setErrors(checked.errors);
    setFailure(null);
    if (!checked.data || pending) return;
    setPending(true);
    try {
      if (service) await updateService(api, service.id, checked.data, service.isActive);
      else await createService(api, checked.data, key);
      onSaved();
    } catch (err) {
      setFailure(messageOf(err, 'No se pudo guardar el servicio. Inténtalo de nuevo.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <IonModal isOpen className="bs-modal" onDidDismiss={onClose}>
      <IonContent>
        <form className="bs-page bs-root" onSubmit={submit} noValidate>
          <h2 className="bs-header">{service ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <Field id="service-name" label="Nombre" value={name} error={errors.name} onChange={setName}
                 placeholder="Corte clásico" />
          <Field id="service-description" label="Descripción (opcional)" value={description} multiline
                 error={errors.description} onChange={setDescription} />
          <Field id="service-duration" label="Duración (minutos)" value={duration} inputMode="numeric"
                 error={errors.duration} onChange={setDuration} placeholder="30" />
          <Field id="service-price" label="Precio (pesos)" value={price} inputMode="numeric"
                 error={errors.price} onChange={setPrice} placeholder="25000" />
          {service && <p className="bs-hint">Cambiar el precio no modifica las citas ya reservadas.</p>}
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
