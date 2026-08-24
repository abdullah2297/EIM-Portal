'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { employeeAuthService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { isValid, rules, validate } from '@/lib/validation';
import { ROUTES } from '@/lib/constants';

const EMPTY = { email: '', password: '' };

const SCHEMA = {
  email: [rules.required('Enter your work email.'), rules.email()],
  password: [rules.required('Enter your password.')],
};

/**
 * The employee login, as its own section at the bottom of the anonymous
 * landing page (linked from the navbar's "Log in" button) rather than a
 * form squeezed into the header - there's no self-service signup, so this
 * is the one and only place to sign in.
 */
export function LandingLoginSection() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, SCHEMA);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setSubmitting(true);
    try {
      await employeeAuthService.login(values);
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next || ROUTES.home);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'That did not work. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section section--muted anchor-target" id="login">
      <div className="container-page">
        <div className="login-section">
          <SectionHeading
            eyebrow="Employees"
            eyebrowIcon="Login"
            title="Log in to the portal"
            subtitle="Use the email and password your admin set up for you. There's no self-service signup - ask an admin if you need an account."
          />
          <form className="form login-section__form" onSubmit={handleSubmit} noValidate>
            <TextInput
              label="Work email"
              name="email"
              type="email"
              value={values.email}
              onChange={setValue}
              error={errors.email}
              required
              autoComplete="email"
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
            <Button type="submit" size="lg" icon="Login" loading={submitting} block>
              Log in
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LandingLoginSection;
