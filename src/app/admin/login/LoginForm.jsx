'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Brand } from '@/components/layout/Brand';
import { isValid, rules, validate } from '@/lib/validation';
import { ROUTES } from '@/lib/constants';

const SCHEMA = {
  username: [rules.required('Enter your username.')],
  password: [rules.required('Enter your password.')],
};

/** Credential form for the admin panel. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? ROUTES.admin;
  const { notify } = useToast();

  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, SCHEMA);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setSubmitting(true);
    try {
      await authService.login(values.username, values.password);
      notify('Welcome back.', 'success');
      router.push(next.startsWith('/admin') ? next : ROUTES.admin);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      setFormError(error?.message ?? 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__head">
          <Brand href={ROUTES.home} />
          <h1>Admin sign in</h1>
          <p className="u-text-sm u-muted">
            Sign in to manage the portal's content. Credentials are configured in your
            <code> .env.local</code> file.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <div className="form-alert form-alert--error" role="alert">
              <Icon name="ErrorOutline" />
              <span>{formError}</span>
            </div>
          ) : null}

          <TextInput
            label="Username"
            name="username"
            value={values.username}
            onChange={setValue}
            error={errors.username}
            required
            autoComplete="username"
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={setValue}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <Button type="submit" size="lg" icon="Login" block loading={submitting}>
            Sign in
          </Button>
        </form>

        <p className="u-text-xs u-subtle">
          Default development credentials: <strong>admin</strong> / <strong>eim-admin-2026</strong>.
          Change them in <code>.env.local</code> before deploying.
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
