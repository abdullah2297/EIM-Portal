'use client';

import { useId, useRef, useState } from 'react';
import { uploadsService } from '@/services';
import { Field } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';

/**
 * Image field: paste a URL, or upload a file - either way the value stored
 * on the record is just the resulting URL string, matching every other
 * `image` field in the schema.
 *
 * @param {{
 *  label: string, name: string, value: string, onChange: Function,
 *  hint?: string, error?: string,
 * }} props
 */
export function ImageField({ label, name, value, onChange, hint, error }) {
  const id = useId();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const uploaded = await uploadsService.upload(file);
      onChange(name, uploaded.url);
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message ?? 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field
      label={label}
      htmlFor={id}
      error={error || uploadError || undefined}
      hint={hint ?? 'Paste an image URL, or upload a jpg, png, webp, gif or svg (up to 5 MB).'}
    >
      <div className="u-stack u-stack--sm">
        {value ? <img src={value} alt="" className="admin-image-preview" /> : null}
        <div className="u-cluster u-cluster--sm">
          <input
            id={id}
            className={`input ${error ? 'input--invalid' : ''}`.trim()}
            value={value ?? ''}
            placeholder="https://..."
            onChange={(event) => onChange(name, event.target.value)}
            aria-invalid={Boolean(error)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon="UploadFile"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" icon="Close" onClick={() => onChange(name, '')}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg,image/*"
        className="u-sr-only"
        onChange={handleSelect}
      />
    </Field>
  );
}

export default ImageField;
