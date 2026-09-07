'use client';

import { Field, SelectField, TextInput } from '@/components/ui/Fields';
import { Button, IconButton } from '@/components/ui/Button';

/**
 * Editor for a list of objects (impact metrics, prizes, skills, awards,
 * attachments, leaderboard rows, projects...). The row shape comes from the
 * schema, so one component covers every repeating structure in the data model.
 *
 * @param {{
 *  label: string,
 *  name: string,
 *  value?: Array<Record<string, any>>,
 *  onChange: (name: string, value: any[]) => void,
 *  fields: Array<{ name: string, label: string, type?: string, options?: {value,label}[] }>,
 *  hint?: string,
 * }} props
 */
export function Repeater({ label, name, value = [], onChange, fields = [], hint }) {
  const rows = Array.isArray(value) ? value : [];

  const updateRow = (index, key, fieldValue) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [key]: fieldValue } : row));
    onChange(name, next);
  };

  const addRow = () => {
    const blank = Object.fromEntries(fields.map((field) => [field.name, '']));
    onChange(name, [...rows, blank]);
  };

  const removeRow = (index) => onChange(name, rows.filter((_, i) => i !== index));

  /** Renders one row's field as a date picker, dropdown, number, or plain text. */
  const renderRowField = (field, index, row) => {
    // `key` is intentionally not part of `shared` - React requires it as a
    // literal JSX attribute at each call site below, not a spread value.
    const shared = {
      label: field.label,
      name: `${name}.${index}.${field.name}`,
      value: row?.[field.name] ?? '',
      onChange: (_fieldName, fieldValue) =>
        updateRow(index, field.name, field.type === 'number' ? Number(fieldValue) : fieldValue),
    };

    if (field.type === 'select') {
      return (
        <SelectField
          key={field.name}
          {...shared}
          options={field.options ?? []}
          placeholder="Select an option"
        />
      );
    }
    if (field.type === 'date') {
      return <TextInput key={field.name} {...shared} type="date" />;
    }
    return <TextInput key={field.name} {...shared} type={field.type === 'number' ? 'number' : 'text'} />;
  };

  return (
    <Field label={label} hint={hint}>
      <div className="u-stack u-stack--sm">
        {rows.map((row, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className="card card--flat" key={index}>
            <div className="card__body">
              <div className="form-grid">
                {fields.map((field) => renderRowField(field, index, row))}
              </div>
              <div className="admin-table__actions">
                <IconButton icon="Delete" label={`Remove item ${index + 1}`} onClick={() => removeRow(index)} />
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 ? <p className="u-text-sm u-subtle">No entries yet.</p> : null}

        <Button variant="outline" size="sm" icon="Add" onClick={addRow}>
          Add {label.toLowerCase()}
        </Button>
      </div>
    </Field>
  );
}

export default Repeater;
