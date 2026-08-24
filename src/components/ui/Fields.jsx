'use client';

import { useId, useState } from 'react';
import { Icon } from './Icon';

/**
 * Form field primitives. Every control is uncontrolled-friendly, reports its
 * own validation message and pairs the label to the input with a generated id.
 */

/**
 * @param {{
 *  label?: string,
 *  htmlFor?: string,
 *  required?: boolean,
 *  hint?: string,
 *  error?: string,
 *  children: import('react').ReactNode,
 *  className?: string,
 * }} props
 */
export function Field({ label, htmlFor, required, hint, error, children, className = '' }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required ? (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? <span className="field__hint">{hint}</span> : null}
      {error ? (
        <span className="field__error" role="alert">
          <Icon name="ErrorOutline" fontSize="inherit" />
          {error}
        </span>
      ) : null}
    </div>
  );
}

/**
 * @param {{
 *  label?: string, name: string, value: any, onChange: Function, type?: string,
 *  placeholder?: string, required?: boolean, hint?: string, error?: string,
 *  disabled?: boolean, className?: string, autoComplete?: string, ariaLabel?: string,
 * }} props
 */
export function TextInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  hint,
  error,
  disabled,
  className,
  autoComplete,
  ariaLabel,
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} required={required} hint={hint} error={error} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        className={`input ${error ? 'input--invalid' : ''}`.trim()}
        value={value ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-label={!label ? ariaLabel : undefined}
        required={required}
      />
    </Field>
  );
}

/** @param {{ label?: string, name: string, value: any, onChange: Function, rows?: number, placeholder?: string, required?: boolean, hint?: string, error?: string, className?: string }} props */
export function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 5,
  placeholder,
  required,
  hint,
  error,
  className,
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        className={`textarea ${error ? 'textarea--invalid' : ''}`.trim()}
        value={value ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        required={required}
      />
    </Field>
  );
}

/**
 * @param {{
 *  label?: string, name: string, value: any, onChange: Function,
 *  options: Array<{ value: string, label: string }>, placeholder?: string,
 *  required?: boolean, hint?: string, error?: string, className?: string,
 * }} props
 */
export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required,
  hint,
  error,
  className,
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} required={required} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={name}
        className={`select ${error ? 'select--invalid' : ''}`.trim()}
        value={value ?? ''}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={Boolean(error)}
        required={required}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** @param {{ label: string, name: string, checked: boolean, onChange: Function, hint?: string }} props */
export function CheckboxField({ label, name, checked, onChange, hint }) {
  const id = useId();
  return (
    <label className="checkbox-field" htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(name, event.target.checked)}
      />
      <span>
        {label}
        {hint ? <span className="field__hint"> {hint}</span> : null}
      </span>
    </label>
  );
}

/**
 * Free-form list editor used for responsibilities, tags, rules and similar.
 * @param {{ label?: string, name: string, value?: string[], onChange: Function, placeholder?: string, hint?: string, error?: string }} props
 */
export function TagInput({ label, name, value = [], onChange, placeholder = 'Type and press Enter', hint, error }) {
  const [draft, setDraft] = useState('');
  const id = useId();
  const items = Array.isArray(value) ? value : [];

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed || items.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange(name, [...items, trimmed]);
    setDraft('');
  };

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <div className="tag-input">
        {items.map((item, index) => (
          <span className="tag-input__chip" key={item}>
            {item}
            <button
              type="button"
              onClick={() => onChange(name, items.filter((_, i) => i !== index))}
              aria-label={`Remove ${item}`}
            >
              <Icon name="Close" fontSize="inherit" />
            </button>
          </span>
        ))}
        <input
          id={id}
          className="tag-input__field"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }
            if (event.key === 'Backspace' && !draft && items.length) {
              onChange(name, items.slice(0, -1));
            }
          }}
          onBlur={commit}
        />
      </div>
    </Field>
  );
}

/**
 * Debounce-friendly search box with a clear button.
 * @param {{ value: string, onChange: (value: string) => void, placeholder?: string, label?: string, className?: string }} props
 */
export function SearchInput({ value, onChange, placeholder = 'Search...', label = 'Search', className = '' }) {
  const id = useId();
  return (
    <div className={`search-input ${className}`.trim()}>
      <label className="u-sr-only" htmlFor={id}>
        {label}
      </label>
      <span className="search-input__icon">
        <Icon name="Search" />
      </span>
      <input
        id={id}
        type="search"
        className="search-input__field"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button type="button" className="search-input__clear" onClick={() => onChange('')} aria-label="Clear search">
          <Icon name="Close" fontSize="inherit" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Horizontal chip filter row.
 * @param {{ options: Array<{ value: string, label: string, count?: number }>, value: string, onChange: (value: string) => void, ariaLabel?: string }} props
 */
export function ChipFilters({ options = [], value, onChange, ariaLabel = 'Filter' }) {
  return (
    <div className="chip-filters" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip-filter ${option.value === value ? 'chip-filter--active' : ''}`.trim()}
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
        >
          {option.label}
          {typeof option.count === 'number' ? (
            <span className="chip-filter__count">{option.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default Field;
