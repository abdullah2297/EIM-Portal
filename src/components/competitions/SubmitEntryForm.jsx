'use client';

import { useId, useState } from 'react';
import { competitionEntryService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { SelectField, TextArea, TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { isValid, rules, validate } from '@/lib/validation';

const SCHEMA = {
  name: [rules.required('Enter your name.')],
  email: [rules.required('Enter your email address.'), rules.email()],
};

const EMPTY = { employeeId: '', name: '', email: '', message: '' };

/**
 * "Submit your entry" form - only usable while a competition is Active, and
 * only for someone who has already participated (checked server-side by
 * email, since there is no visitor login on this site).
 *
 * @param {{
 *  competitionId: string,
 *  competitionName: string,
 *  status: string,
 *  employees?: Array<{ id: string, fullName: string, email: string }>,
 * }} props
 */
export function SubmitEntryForm({ competitionId, competitionName, status, employees = [] }) {
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState('idle');
  const { notify } = useToast();
  const fileInputId = useId();

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

  if (status === 'Upcoming') {
    return (
      <div className="form-alert form-alert--info">
        <Icon name="InfoOutlined" />
        <span>Submissions open once this competition goes active - participate now to be ready.</span>
      </div>
    );
  }

  if (status === 'Completed') {
    return (
      <div className="form-alert form-alert--info">
        <Icon name="InfoOutlined" />
        <span>This competition is closed, so entries are no longer accepted.</span>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, SCHEMA);
    if (!file) nextErrors.file = 'Attach your entry as a .zip file.';
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setFormStatus('submitting');
    try {
      await competitionEntryService.submit(competitionId, { ...values, file });
      setFormStatus('success');
      setValues(EMPTY);
      setFile(null);
      notify(`Your entry for ${competitionName} has been submitted.`, 'success');
    } catch (error) {
      setFormStatus('error');
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'We could not submit your entry.', 'error');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formStatus === 'success' ? (
        <div className="form-alert form-alert--success" role="status">
          <Icon name="CheckCircle" />
          <span>Your entry has been submitted. Good luck!</span>
        </div>
      ) : null}

      <SelectField
        label="Who are you?"
        name="employeeId"
        value={values.employeeId}
        onChange={setValue}
        placeholder="Select your name (optional)"
        hint="Use the same name/email you registered with."
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
        label="Anything the judges should know?"
        name="message"
        value={values.message}
        onChange={setValue}
        rows={3}
        placeholder="Optional - notes about your submission."
      />

      <div className="field">
        <label className="field__label" htmlFor={fileInputId}>
          Entry file (.zip)
          <span className="field__required" aria-hidden="true">*</span>
        </label>
        <input
          id={fileInputId}
          type="file"
          accept=".zip"
          className={`input ${errors.file ? 'input--invalid' : ''}`.trim()}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setErrors((current) => ({ ...current, file: undefined }));
          }}
        />
        {file ? <span className="field__hint">{file.name}</span> : null}
        {errors.file ? (
          <span className="field__error" role="alert">
            <Icon name="ErrorOutline" fontSize="inherit" />
            {errors.file}
          </span>
        ) : (
          <span className="field__hint">Up to 20 MB.</span>
        )}
      </div>

      <Button type="submit" size="lg" icon="UploadFile" loading={formStatus === 'submitting'}>
        Submit entry
      </Button>
    </form>
  );
}

export default SubmitEntryForm;
