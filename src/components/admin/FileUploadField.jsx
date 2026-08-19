'use client';

import { useId, useRef, useState } from 'react';
import { uploadsService } from '@/services';
import { Field } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatBytes } from '@/lib/format';

/**
 * Single-file attachment picker used by the admin forms.
 *
 * Uploads the file as soon as it is chosen and stores the resulting
 * `{ name, url, size }` on the field - the record itself only ever carries a
 * reference, never the file bytes.
 *
 * @param {{
 *  label: string, name: string,
 *  value: { name: string, url: string, size: string } | null,
 *  onChange: Function, accept?: string, hint?: string, error?: string,
 * }} props
 */
export function FileUploadField({ label, name, value, onChange, accept = '.zip', hint, error }) {
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
      const attachment = await uploadsService.upload(file);
      onChange(name, attachment);
    } catch (uploadFailure) {
      setUploadError(uploadFailure?.message ?? 'The file could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label} htmlFor={id} error={error || uploadError || undefined} hint={hint}>
      {value ? (
        <div className="u-cluster u-cluster--sm">
          <Icon name="FolderZip" fontSize="inherit" />
          <a href={`${value.url}?name=${encodeURIComponent(value.name)}`} className="u-text-sm">
            {value.name}
          </a>
          <span className="u-subtle u-text-xs">({formatBytes(value.size)})</span>
          <Button type="button" variant="ghost" size="sm" icon="Close" onClick={() => onChange(name, null)}>
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon="UploadFile"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : 'Upload zip file'}
        </Button>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="u-sr-only"
        onChange={handleSelect}
      />
    </Field>
  );
}

export default FileUploadField;
