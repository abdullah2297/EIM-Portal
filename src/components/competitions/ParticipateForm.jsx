'use client';

import { useState } from 'react';
import { participationService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { TextArea } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { isValid, rules, validate } from '@/lib/validation';

const SCHEMA = {
  message: [rules.maxLength(2000)],
};

/**
 * "Participate Now" registration form for a single competition.
 *
 * The whole competitions section is gated behind the employee login, so
 * whoever reaches this form is already identified by their session - no more
 * free-text name/email or a "who are you" picker, just an optional message.
 *
 * @param {{
 *  competitionId: string,
 *  competitionName: string,
 *  closed?: boolean,
 *  me: { fullName: string, jobTitle?: string, photo?: string|null },
 * }} props
 */
export function ParticipateForm({ competitionId, competitionName, closed = false, me }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const { notify } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate({ message }, SCHEMA);
    setError(nextErrors.message ?? '');
    if (!isValid(nextErrors)) return;

    setStatus('submitting');
    try {
      await participationService.participate({ competitionId, message });
      setStatus('success');
      setMessage('');
      notify(`You are registered for ${competitionName}. Good luck!`, 'success');
    } catch (submitError) {
      setStatus('error');
      if (submitError instanceof ApiError && submitError.details?.message) setError(submitError.details.message);
      notify(submitError?.message ?? 'We could not register your entry.', 'error');
    }
  };

  if (closed) {
    return (
      <div className="form-alert form-alert--info">
        <Icon name="InfoOutlined" />
        <span>
          This competition is closed, so new entries are no longer accepted. Take a look at the
          winners below.
        </span>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {status === 'success' ? (
        <div className="form-alert form-alert--success" role="status">
          <Icon name="CheckCircle" />
          <span>Your entry has been registered. The organisers will be in touch.</span>
        </div>
      ) : null}

      <div className="u-cluster u-cluster--sm">
        <Avatar name={me.fullName} src={me.photo} size="sm" />
        <span className="u-stack u-stack--sm">
          <strong className="u-text-sm">Registering as {me.fullName}</strong>
          {me.jobTitle ? <span className="u-text-xs u-subtle">{me.jobTitle}</span> : null}
        </span>
      </div>

      <TextArea
        label="Anything the organisers should know?"
        name="message"
        value={message}
        onChange={(_, value) => setMessage(value)}
        error={error}
        rows={4}
        placeholder="Optional - your approach, team members, questions..."
      />

      <Button type="submit" size="lg" icon="HowToReg" loading={status === 'submitting'}>
        Participate now
      </Button>
    </form>
  );
}

export default ParticipateForm;
