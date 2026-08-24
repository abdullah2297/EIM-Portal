'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trainingRegistrationService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

const SCHEMA_FIELDS = ['computerNumber', 'phoneNumber'];
const EMPTY = { computerNumber: '', phoneNumber: '' };
const ACTIVE_STATUSES = ['Registered', 'Waitlisted', 'Approved'];

/**
 * Training registration panel - mirrors `ParticipateForm.jsx`'s shape and the
 * same "identity comes from the session" rule. Renders one of five states
 * depending on `enableParticipation`, the training's own `status`, capacity,
 * and whether the current employee already has an active registration.
 *
 * @param {{
 *  trainingId: string,
 *  trainingName: string,
 *  trainingStatus: string,
 *  enableParticipation: boolean,
 *  enableCapacity: boolean,
 *  maxParticipants?: number,
 *  registeredCount: number,
 *  enableWaitlist: boolean,
 *  myRegistration: { status: string } | null,
 *  me: { fullName: string, jobTitle?: string, photo?: string|null },
 * }} props
 */
export function RegistrationPanel({
  trainingId,
  trainingName,
  trainingStatus,
  enableParticipation,
  enableCapacity,
  maxParticipants,
  registeredCount,
  enableWaitlist,
  myRegistration,
  me,
}) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const router = useRouter();
  const { notify } = useToast();

  if (!enableParticipation) return null;

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    SCHEMA_FIELDS.forEach((field) => {
      if (!values[field].trim()) nextErrors[field] = 'This field is required.';
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus('submitting');
    try {
      await trainingRegistrationService.register(trainingId, values);
      notify(`You're registered for ${trainingName}.`, 'success');
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'We could not register your entry.', 'error');
      setStatus('idle');
    }
  };

  const handleCancel = async () => {
    setStatus('cancelling');
    try {
      await trainingRegistrationService.cancel(trainingId);
      notify('Your registration was cancelled.', 'success');
      router.refresh();
    } catch (error) {
      notify(error?.message ?? 'We could not cancel your registration.', 'error');
    } finally {
      setStatus('idle');
    }
  };

  const capacityInfo = enableCapacity ? (
    <dl className="detail-list">
      <div className="detail-list__row">
        <dt>Maximum participants</dt>
        <dd>{maxParticipants || 'PLACEHOLDER'}</dd>
      </div>
      <div className="detail-list__row">
        <dt>Registered</dt>
        <dd>{registeredCount}</dd>
      </div>
      <div className="detail-list__row">
        <dt>Available seats</dt>
        <dd>{Math.max(0, (Number(maxParticipants) || 0) - registeredCount)}</dd>
      </div>
    </dl>
  ) : null;

  // Already has an active registration - show status + a cancel action.
  if (myRegistration && ACTIVE_STATUSES.includes(myRegistration.status)) {
    return (
      <>
        {capacityInfo}
        <div className="u-cluster u-cluster--sm">
          <StatusBadge status={myRegistration.status} />
          <span className="u-text-sm u-muted">Registered as {me.fullName}</span>
        </div>
        <Button variant="outline" icon="Cancel" onClick={handleCancel} loading={status === 'cancelling'}>
          Cancel registration
        </Button>
      </>
    );
  }

  const isFull =
    enableCapacity && Number(maxParticipants) > 0 && registeredCount >= Number(maxParticipants);

  if (trainingStatus !== 'Registration Open') {
    return (
      <>
        {capacityInfo}
        <div className="form-alert form-alert--info">
          <Icon name="InfoOutlined" />
          <span>Registration is not currently open for this training.</span>
        </div>
      </>
    );
  }

  if (isFull && !enableWaitlist) {
    return (
      <>
        {capacityInfo}
        <div className="form-alert form-alert--info">
          <Icon name="InfoOutlined" />
          <span>This training is fully booked.</span>
        </div>
      </>
    );
  }

  return (
    <>
      {capacityInfo}
      {isFull ? (
        <div className="form-alert form-alert--info">
          <Icon name="InfoOutlined" />
          <span>This training is fully booked - registering now will add you to the waiting list.</span>
        </div>
      ) : null}
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="u-cluster u-cluster--sm">
          <Avatar name={me.fullName} src={me.photo} size="sm" />
          <span className="u-stack u-stack--sm">
            <strong className="u-text-sm">Registering as {me.fullName}</strong>
            {me.jobTitle ? <span className="u-text-xs u-subtle">{me.jobTitle}</span> : null}
          </span>
        </div>

        <TextInput
          label="Computer number"
          name="computerNumber"
          value={values.computerNumber}
          onChange={setValue}
          error={errors.computerNumber}
          required
        />
        <TextInput
          label="Phone number"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={setValue}
          error={errors.phoneNumber}
          required
        />

        <Button type="submit" icon="HowToReg" loading={status === 'submitting'}>
          {isFull ? 'Join waiting list' : 'Register now'}
        </Button>
      </form>
    </>
  );
}

export default RegistrationPanel;
