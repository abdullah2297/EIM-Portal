'use client';

import { useId, useMemo } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import { SERVICE_BY_RESOURCE } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { Field } from '@/components/ui/Fields';

/**
 * Relation pickers used by the schema-driven admin forms.
 *
 * Both variants load their options from the REST layer, so a newly created
 * team or employee is immediately selectable everywhere else.
 */

/** Loads `{ value, label }` options for a resource. */
function useRelationOptions(resource, labelField) {
  const { data, isLoading, error } = useAsyncData(async () => {
    const service = SERVICE_BY_RESOURCE[resource];
    if (!service) return [];
    const { items } = await service.list({ pageSize: 200 });
    return items;
  }, [resource]);

  const options = useMemo(
    () =>
      (data ?? []).map((item) => ({
        value: item.id,
        label: item[labelField] ?? item.name ?? item.title ?? item.id,
      })),
    [data, labelField],
  );

  return { options, isLoading, error };
}

/**
 * @param {{
 *  label: string, name: string, value: string, onChange: Function,
 *  resource: string, labelField: string, required?: boolean, error?: string, hint?: string,
 * }} props
 */
export function RelationSelect({ label, name, value, onChange, resource, labelField, required, error, hint }) {
  const id = useId();
  const { options, isLoading } = useRelationOptions(resource, labelField);

  return (
    <Field label={label} htmlFor={id} required={required} error={error} hint={hint}>
      <select
        id={id}
        name={name}
        className={`select ${error ? 'select--invalid' : ''}`.trim()}
        value={value ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        disabled={isLoading}
        aria-invalid={Boolean(error)}
      >
        <option value="">{isLoading ? 'Loading...' : 'None selected'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * @param {{
 *  label: string, name: string, value: string[], onChange: Function,
 *  resource: string, labelField: string, hint?: string, error?: string,
 * }} props
 */
export function RelationMultiSelect({ label, name, value = [], onChange, resource, labelField, hint, error }) {
  const id = useId();
  const { options, isLoading } = useRelationOptions(resource, labelField);
  const selected = Array.isArray(value) ? value : [];
  // A record can reference an id that no longer exists (deleted elsewhere) -
  // still show it, clearly marked, so it can be removed rather than getting stuck.
  const labelFor = (id2) => options.find((option) => option.value === id2)?.label ?? `${id2} (not found)`;
  const removeValue = (id2) => onChange(name, selected.filter((v) => v !== id2));

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint ?? 'Select to add. Click a chip’s X to remove it.'}>
      <Select
        id={id}
        multiple
        fullWidth
        size="small"
        displayEmpty
        value={selected}
        input={<OutlinedInput />}
        disabled={isLoading}
        onChange={(event) => {
          const next = event.target.value;
          onChange(name, typeof next === 'string' ? next.split(',') : next);
        }}
        renderValue={(picked) =>
          picked.length ? (
            <Box className="u-cluster u-cluster--sm">
              {picked.map((id3) => (
                <Chip
                  key={id3}
                  size="small"
                  label={labelFor(id3)}
                  onDelete={() => removeValue(id3)}
                  // The chip lives inside the Select's clickable trigger area,
                  // so without this the delete click also re-opens the dropdown.
                  onMouseDown={(event) => event.stopPropagation()}
                />
              ))}
            </Box>
          ) : (
            <span className="u-subtle u-text-sm">{isLoading ? 'Loading...' : 'None selected'}</span>
          )
        }
        MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Field>
  );
}

export default RelationSelect;
