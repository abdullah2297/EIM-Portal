'use client';

import { useState } from 'react';
import { departmentService, ApiError } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { DataState } from '@/components/ui/StateViews';
import { TagInput, TextArea, TextInput } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RelationMultiSelect, RelationSelect } from '@/components/admin/RelationFields';
import { Repeater } from '@/components/admin/Repeater';
import { isValid, rules, validate } from '@/lib/validation';
import { RESOURCES } from '@/lib/constants';

const SCHEMA = {
  name: [rules.required('The department needs a name.')],
  shortName: [rules.required('Add a short name.')],
  overview: [rules.required('Add an overview.')],
};

/**
 * Editor for the department profile - the single record that drives the
 * hero copy, mission, vision, values, portfolios and contact details.
 */
export function DepartmentForm() {
  const { notify } = useToast();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { error, isLoading, refetch } = useAsyncData(async () => {
    const record = await departmentService.get();
    setValues(record ?? {});
    return record;
  }, []);

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const setContactValue = (name, value) => {
    setValues((current) => ({ ...current, contact: { ...(current?.contact ?? {}), [name]: value } }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values ?? {}, SCHEMA);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) {
      notify('Please correct the highlighted fields.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await departmentService.update(values);
      notify('Department profile saved.', 'success');
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.details) setErrors(saveError.details);
      notify(saveError?.message ?? 'The department profile could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DataState isLoading={isLoading || !values} error={error} onRetry={refetch} skeletonCount={2} skeletonClassName="u-stack">
      {values ? (
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Identity</h2>
            <div className="form-grid">
              <TextInput label="Department name" name="name" value={values.name} onChange={setValue} error={errors.name} required />
              <TextInput label="Short name" name="shortName" value={values.shortName} onChange={setValue} error={errors.shortName} required />
              <TextInput label="Portal name" name="portalName" value={values.portalName} onChange={setValue} />
              <TextInput label="Established" name="establishedYear" value={values.establishedYear} onChange={setValue} />
              <TextInput label="Tagline" name="tagline" value={values.tagline} onChange={setValue} className="form-grid__full" />
            </div>
          </section>

          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Narrative</h2>
            <div className="form-grid">
              <TextArea label="Overview" name="overview" value={values.overview} onChange={setValue} error={errors.overview} rows={6} required className="form-grid__full" />
              <TextArea label="Mission" name="mission" value={values.mission} onChange={setValue} rows={3} className="form-grid__full" />
              <TextArea label="Vision" name="vision" value={values.vision} onChange={setValue} rows={3} className="form-grid__full" />
              <TagInput label="Key responsibilities" name="responsibilities" value={values.responsibilities} onChange={setValue} className="form-grid__full" />
            </div>
          </section>

          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Values & portfolios</h2>
            <div className="form-grid">
              <div className="form-grid__full">
                <Repeater
                  label="Values"
                  name="values"
                  value={values.values}
                  onChange={setValue}
                  fields={[
                    { name: 'title', label: 'Value', type: 'text' },
                    { name: 'description', label: 'Description', type: 'text' },
                  ]}
                />
              </div>
              <div className="form-grid__full">
                <Repeater
                  label="Portfolios"
                  name="portfolios"
                  value={values.portfolios}
                  onChange={setValue}
                  fields={[
                    { name: 'name', label: 'Portfolio', type: 'text' },
                    { name: 'description', label: 'Description', type: 'text' },
                    { name: 'teamCount', label: 'Teams involved', type: 'number' },
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Leadership</h2>
            <div className="form-grid">
              <RelationSelect
                label="Department head"
                name="headId"
                value={values.headId}
                onChange={setValue}
                resource={RESOURCES.employees}
                labelField="fullName"
              />
              <div className="form-grid__full">
                <RelationMultiSelect
                  label="Leadership team"
                  name="leadershipIds"
                  value={values.leadershipIds}
                  onChange={setValue}
                  resource={RESOURCES.employees}
                  labelField="fullName"
                />
              </div>
            </div>
          </section>

          <section className="admin-form__section">
            <h2 className="admin-form__section-title">Contact</h2>
            <div className="form-grid">
              <TextInput label="Email" name="email" value={values.contact?.email} onChange={setContactValue} />
              <TextInput label="Phone" name="phone" value={values.contact?.phone} onChange={setContactValue} />
              <TextInput label="Location" name="location" value={values.contact?.location} onChange={setContactValue} />
              <TextInput label="Office hours" name="officeHours" value={values.contact?.officeHours} onChange={setContactValue} />
              <TextInput label="Support channel" name="supportChannel" value={values.contact?.supportChannel} onChange={setContactValue} className="form-grid__full" />
            </div>
          </section>

          <div className="admin-form__actions">
            <Button variant="ghost" icon="Refresh" onClick={refetch}>
              Discard changes
            </Button>
            <Button type="submit" icon="Save" loading={saving}>
              Save department profile
            </Button>
          </div>

          <p className="u-text-xs u-subtle">
            <Icon name="InfoOutlined" fontSize="inherit" /> These values drive the home page hero, the
            department page and the contact details in the footer.
          </p>
        </form>
      ) : null}
    </DataState>
  );
}

export default DepartmentForm;
