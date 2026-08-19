'use client';

import { useState } from 'react';
import { contactService, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { SelectField, TextArea, TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { isValid, rules, validate } from '@/lib/validation';
import { SUBMISSION_TYPES } from '@/lib/constants';

const SCHEMA = {
  name: [rules.required('Enter your name.')],
  email: [rules.required('Enter your email address.'), rules.email()],
  subject: [rules.required('Enter a subject.'), rules.maxLength(160)],
  message: [
    rules.required('Enter your message.'),
    rules.minLength(20, 'Please give us at least 20 characters of detail.'),
  ],
};

/** Tab definitions - each one is the same form with a different framing. */
const TABS = [
  {
    key: 'Idea',
    label: 'Submit an idea',
    icon: 'TipsAndUpdates',
    title: 'Submit an idea',
    subtitle: 'Spotted something that could work better? Tell us - every initiative started this way.',
    subjectLabel: 'Idea title',
    messageLabel: 'Describe your idea',
    messagePlaceholder: 'What is the problem, what would you change, and who would benefit?',
  },
  {
    key: 'Success Story',
    label: 'Share a story',
    icon: 'AutoStories',
    title: 'Share a success story',
    subtitle: 'Something went really well? Let us write it up and celebrate it properly.',
    subjectLabel: 'Story title',
    messageLabel: 'Tell us the story',
    messagePlaceholder: 'What was the challenge, what did the team do, and what changed as a result?',
  },
  {
    key: 'Initiative',
    label: 'Suggest an initiative',
    icon: 'RocketLaunch',
    title: 'Suggest an initiative',
    subtitle: 'A bigger piece of work you think the department should take on.',
    subjectLabel: 'Initiative title',
    messageLabel: 'Describe the initiative',
    messagePlaceholder: 'Objective, scope, the teams involved and the expected impact.',
  },
  {
    key: 'General Enquiry',
    label: 'General contact',
    icon: 'ContactSupport',
    title: 'General contact form',
    subtitle: 'Anything else - questions, data requests, or getting in touch with a team.',
    subjectLabel: 'Subject',
    messageLabel: 'Your message',
    messagePlaceholder: 'How can we help?',
  },
];

const EMPTY = { name: '', email: '', subject: '', message: '' };

/**
 * The four "Get Involved" forms. They share one submission endpoint and one
 * validation schema; only the copy changes between tabs.
 */
export function ContactForms() {
  const [active, setActive] = useState(TABS[0].key);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const { notify } = useToast();

  const tab = TABS.find((item) => item.key === active) ?? TABS[0];

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, SCHEMA);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');
    try {
      await contactService.submit({ ...values, type: active });
      setStatus('success');
      setValues(EMPTY);
      notify('Thank you - your submission has reached the department.', 'success');
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'We could not send your submission.', 'error');
    }
  };

  return (
    <div className="u-stack u-stack--lg">
      <Tabs
        tabs={TABS.map((item) => ({ key: item.key, label: item.label }))}
        active={active}
        onChange={(key) => {
          setActive(key);
          setStatus('idle');
          setErrors({});
        }}
        ariaLabel="Choose a submission type"
      />

      {TABS.map((item) => (
        <TabPanel key={item.key} tabKey={item.key} active={active}>
          <SectionHeading eyebrow="Get involved" eyebrowIcon={item.icon} title={item.title} subtitle={item.subtitle} as="h2" />
        </TabPanel>
      ))}

      <form className="form admin-form" onSubmit={handleSubmit} noValidate>
        {status === 'success' ? (
          <div className="form-alert form-alert--success" role="status">
            <Icon name="CheckCircle" />
            <span>Thank you - we have received your submission and will come back to you.</span>
          </div>
        ) : null}

        {status === 'error' && !Object.keys(errors).length ? (
          <div className="form-alert form-alert--error" role="alert">
            <Icon name="ErrorOutline" />
            <span>Something went wrong sending your submission. Please try again.</span>
          </div>
        ) : null}

        <div className="form-grid">
          <TextInput
            label="Your name"
            name="name"
            value={values.name}
            onChange={setValue}
            error={errors.name}
            required
            autoComplete="name"
          />
          <TextInput
            label="Your email"
            name="email"
            type="email"
            value={values.email}
            onChange={setValue}
            error={errors.email}
            required
            autoComplete="email"
          />

          <SelectField
            label="Submission type"
            name="type"
            value={active}
            onChange={(_name, value) => setActive(value)}
            options={SUBMISSION_TYPES.filter((type) => type !== 'Competition Entry').map((type) => ({
              value: type,
              label: type,
            }))}
          />

          <TextInput
            label={tab.subjectLabel}
            name="subject"
            value={values.subject}
            onChange={setValue}
            error={errors.subject}
            required
          />

          <TextArea
            label={tab.messageLabel}
            name="message"
            value={values.message}
            onChange={setValue}
            error={errors.message}
            placeholder={tab.messagePlaceholder}
            rows={7}
            required
            className="form-grid__full"
          />
        </div>

        <div className="admin-form__actions">
          <Button
            variant="ghost"
            onClick={() => {
              setValues(EMPTY);
              setErrors({});
              setStatus('idle');
            }}
          >
            Clear
          </Button>
          <Button type="submit" icon="Publish" loading={status === 'submitting'}>
            Send submission
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ContactForms;
