'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVICE_BY_RESOURCE, ApiError } from '@/services';
import { useToast } from '@/context/ToastContext';
import { groupFields } from '@/lib/adminSchemas';
import { isValid, rules, validate } from '@/lib/validation';
import { ROUTES } from '@/lib/constants';
import {
  CheckboxField,
  SelectField,
  TagInput,
  TextArea,
  TextInput,
} from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RelationMultiSelect, RelationSelect } from './RelationFields';
import { Repeater } from './Repeater';
import { FileUploadField } from './FileUploadField';
import { ImageField } from './ImageField';
import { ImagesField } from './ImagesField';

/**
 * Schema-driven create / edit form.
 *
 * Every content type in the portal is edited through this one component: the
 * fields, their types, their validation and their layout all come from
 * `ADMIN_SCHEMAS`.
 *
 * @param {{
 *  resource: string,
 *  schema: any,
 *  initialValues: Record<string, any>,
 *  recordId?: string | null,
 * }} props
 */
export function ResourceForm({ resource, schema, initialValues, recordId = null }) {
  const router = useRouter();
  const { notify } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const sections = groupFields(schema);

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  /** Builds the validation schema from the field descriptors. */
  const buildValidation = () => {
    /** @type {Record<string, Function[]>} */
    const validationSchema = {};
    schema.fields.forEach((field) => {
      const fieldRules = [];
      if (field.required) fieldRules.push(rules.required());
      if (field.inputType === 'email') fieldRules.push(rules.email());
      if (field.type === 'number') fieldRules.push(rules.number());
      if (field.type === 'date') fieldRules.push(rules.date());
      if (fieldRules.length) validationSchema[field.name] = fieldRules;
    });
    return validationSchema;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values, buildValidation());
    setErrors(nextErrors);
    if (!isValid(nextErrors)) {
      notify('Please correct the highlighted fields.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const service = SERVICE_BY_RESOURCE[resource];
      if (recordId) {
        await service.update(recordId, values);
        notify(`${schema.label} updated.`, 'success');
      } else {
        await service.create(values);
        notify(`${schema.label} created.`, 'success');
      }
      router.push(ROUTES.adminResource(resource));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      notify(error?.message ?? 'The record could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /** Renders one field according to its descriptor. */
  const renderField = (field) => {
    // `key` is never part of `shared` - React requires it as a literal JSX
    // attribute at each call site below, not a value arriving through spread.
    const shared = {
      label: field.label,
      name: field.name,
      value: values[field.name],
      onChange: setValue,
      error: errors[field.name],
      required: field.required,
      hint: field.hint,
      className: field.full ? 'form-grid__full' : undefined,
    };

    switch (field.type) {
      case 'textarea':
        return <TextArea key={field.name} {...shared} rows={field.rows ?? 4} />;
      case 'select':
        return (
          <SelectField
            key={field.name}
            {...shared}
            options={field.options ?? []}
            placeholder="Select an option"
          />
        );
      case 'number':
        return <TextInput key={field.name} {...shared} type="number" />;
      case 'date':
        return <TextInput key={field.name} {...shared} type="date" />;
      case 'checkbox':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <CheckboxField
              label={field.label}
              name={field.name}
              checked={Boolean(values[field.name])}
              onChange={setValue}
              hint={field.hint}
            />
          </div>
        );
      case 'tags':
        return <TagInput key={field.name} {...shared} />;
      case 'relation':
        return (
          <RelationSelect
            key={field.name}
            {...shared}
            resource={field.resource}
            labelField={field.labelField ?? 'name'}
          />
        );
      case 'relations':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <RelationMultiSelect
              label={field.label}
              name={field.name}
              value={values[field.name]}
              onChange={setValue}
              resource={field.resource}
              labelField={field.labelField ?? 'name'}
              error={errors[field.name]}
              hint={field.hint}
            />
          </div>
        );
      case 'repeater':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <Repeater
              label={field.label}
              name={field.name}
              value={values[field.name]}
              onChange={setValue}
              fields={field.fields ?? []}
              hint={field.hint}
            />
          </div>
        );
      case 'file':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <FileUploadField
              label={field.label}
              name={field.name}
              value={values[field.name]}
              onChange={setValue}
              accept={field.accept}
              error={errors[field.name]}
              hint={field.hint}
              icon={field.icon}
              uploadLabel={field.uploadLabel}
            />
          </div>
        );
      case 'image':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <ImageField
              label={field.label}
              name={field.name}
              value={values[field.name]}
              onChange={setValue}
              error={errors[field.name]}
              hint={field.hint}
            />
          </div>
        );
      case 'images':
        return (
          <div className={field.full ? 'form-grid__full' : ''} key={field.name}>
            <ImagesField
              label={field.label}
              name={field.name}
              value={values[field.name]}
              onChange={setValue}
              error={errors[field.name]}
              hint={field.hint}
            />
          </div>
        );
      default:
        return <TextInput key={field.name} {...shared} type={field.inputType ?? 'text'} />;
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {Object.keys(errors).length ? (
        <div className="form-alert form-alert--error" role="alert">
          <Icon name="ErrorOutline" />
          <span>Some fields need attention before this {schema.label.toLowerCase()} can be saved.</span>
        </div>
      ) : null}

      {sections.map((section) => (
        <section className="admin-form__section" key={section.title}>
          <h2 className="admin-form__section-title">{section.title}</h2>
          <div className="form-grid">{section.fields.map(renderField)}</div>
        </section>
      ))}

      <div className="admin-form__actions">
        <Button variant="ghost" href={ROUTES.adminResource(resource)}>
          Cancel
        </Button>
        <Button type="submit" icon="Save" loading={saving}>
          {recordId ? `Save ${schema.label.toLowerCase()}` : `Create ${schema.label.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}

export default ResourceForm;
