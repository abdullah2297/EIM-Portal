'use client';

import { useId, useRef, useState } from 'react';
import { uploadsService } from '@/services';
import { Field } from '@/components/ui/Fields';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const MAX_IMAGES = 3;

/**
 * Up to `MAX_IMAGES` image URLs - paste a link or upload a file for each.
 *
 * @param {{
 *  label: string, name: string, value: string[], onChange: Function,
 *  hint?: string, error?: string,
 * }} props
 */
export function ImagesField({ label, name, value, onChange, hint, error }) {
  const images = Array.isArray(value) ? value.filter(Boolean) : [];
  const id = useId();
  const inputRef = useRef(null);
  const [draftUrl, setDraftUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const addImage = (url) => {
    if (!url || images.length >= MAX_IMAGES) return;
    onChange(name, [...images, url]);
    setDraftUrl('');
  };

  const removeImage = (index) => {
    onChange(name, images.filter((_, i) => i !== index));
  };

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const uploaded = await uploadsService.upload(file);
      addImage(uploaded.url);
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
      hint={hint ?? `Up to ${MAX_IMAGES} images. Paste a URL or upload a jpg, png, webp, gif or svg (up to 5 MB each).`}
    >
      <div className="u-stack u-stack--sm">
        {images.length ? (
          <div className="u-cluster u-cluster--sm">
            {images.map((url, index) => (
              <div className="admin-image-thumb" key={`${url}-${index}`}>
                <img src={url} alt="" className="admin-image-thumb__img" />
                <button
                  type="button"
                  className="admin-image-thumb__remove"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove image ${index + 1}`}
                >
                  <Icon name="Close" fontSize="inherit" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {images.length < MAX_IMAGES ? (
          <div className="u-cluster u-cluster--sm">
            <input
              id={id}
              className="input"
              value={draftUrl}
              placeholder="https://..."
              onChange={(event) => setDraftUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addImage(draftUrl.trim());
                }
              }}
            />
            <Button type="button" variant="ghost" size="sm" icon="Add" onClick={() => addImage(draftUrl.trim())}>
              Add URL
            </Button>
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
          </div>
        ) : null}
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

export default ImagesField;
