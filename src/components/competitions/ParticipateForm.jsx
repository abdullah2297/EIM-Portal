'use client';

import { useState } from 'react';
import { participationService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { SelectField, TextArea, TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { isValid, rules, validate } from '@/lib/validation';

const SCHEMA = {
  name: [rules.required('Enter your name.')],
  email: [rules.required('Enter your email address.'), rules.email()],
  message: [rules.maxLength(2000)],
};

const EMPTY = { employeeId: '', name: '', email: '', message: '' };

/**
 * "Participate Now" registration form for a single competition.
 *
 * Selecting your name from the directory pre-fills the contact details and
 * lets the API add you to the participant list.
 *
 * @param {{
 *  competitionId: string,
 *  competitionName: string,
 *  closed?: boolean,
 *  employees?: Array<{ id: string, fullName: string, email: string }>,
 * }} props
 */
export function ParticipateForm({ competitionId, competitionName, closed = false, employees = [] }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const { notify } = useToast();

  const setValue = (name, value) => {
    setValues((current) => {
      if (name !== 'employeeId') return { ...current, [name]: value };
      const match = employees.find((employee) => employee.id === value);
      return match
        ? { ...current, employeeId: value, name: match.fullName, email: match.email }
        : { ...current, employeeId: value };
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, SCHEMA);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setStatus('submitting');
    try {
      await participationService.participate({ ...values, competitionId });
      setStatus('success');
      setValues(EMPTY);
      notify(`You are registered for ${competitionName}. Good luck!`, 'success');
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'We could not register your entry.', 'error');
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

      <SelectField
        label="Who are you?"
        name="employeeId"
        value={values.employeeId}
        onChange={setValue}
        placeholder="Select your name (optional)"
        hint="Selecting your name adds you to the participant list automatically."
        options={employees.map((employee) => ({ value: employee.id, label: employee.fullName }))}
      />

      <div className="form-grid">
        <TextInput
          label="Full name"
          name="name"
          value={values.name}
          onChange={setValue}
          error={errors.name}
          required
          autoComplete="name"
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={setValue}
          error={errors.email}
          required
          autoComplete="email"
        />
      </div>

      <TextArea
        label="Anything the organisers should know?"
        name="message"
        value={values.message}
        onChange={setValue}
        error={errors.message}
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
