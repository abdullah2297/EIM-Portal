import fs from 'node:fs/promises';
import path from 'node:path';
import { generateId } from './db';

/**
 * Shared rules for `/api/uploads` (server only): which extensions are
 * accepted, their size limit and how the download route should serve them
 * back (inline for images so `<img>` tags work, as an attachment otherwise).
 *
 * `saveUpload` does the actual validation + disk write, so any route that
 * needs to accept a file - the admin-only `/api/uploads`, or a public route
 * gated by its own business rule (e.g. a competition entry) - shares the
 * exact same rules instead of re-implementing them.
 */

export const UPLOAD_KINDS = {
  archive: {
    extensions: ['.zip'],
    // Browsers disagree on the mime type for zip files, so this is a soft
    // check alongside the (authoritative) extension check.
    mimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/octet-stream'],
    maxSize: 20 * 1024 * 1024, // 20 MB
    contentTypes: { '.zip': 'application/zip' },
    disposition: 'attachment',
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/octet-stream',
    ],
    maxSize: 5 * 1024 * 1024, // 5 MB
    contentTypes: {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    },
    disposition: 'inline',
  },
};

/** @param {string} extension e.g. `.png` (lower-cased) */
export function resolveUploadRule(extension) {
  return Object.values(UPLOAD_KINDS).find((kind) => kind.extensions.includes(extension)) ?? null;
}

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

export class UploadError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'UploadError';
    this.status = 400;
    this.code = 'VALIDATION_FAILED';
    this.details = details;
  }
}

/**
 * Validates and writes an uploaded `File` to `data/uploads`, restricted to
 * the kinds allowed by `UPLOAD_KINDS`.
 *
 * @param {File} file
 * @param {{ kind?: keyof typeof UPLOAD_KINDS }} [options] restrict to one kind (e.g. 'archive' only)
 * @returns {Promise<{ name: string, url: string, size: string }>}
 */
export async function saveUpload(file, options = {}) {
  if (!(file instanceof File) || !file.name) {
    throw new UploadError('No file was provided.', { file: 'Choose a file to upload.' });
  }

  const extension = path.extname(file.name).toLowerCase();
  const rule = resolveUploadRule(extension);
  const kindName = rule && Object.entries(UPLOAD_KINDS).find(([, k]) => k === rule)?.[0];
  const allowed = !rule ? false : !options.kind || options.kind === kindName;

  if (!allowed || (file.type && !rule.mimeTypes.includes(file.type))) {
    throw new UploadError('This file type is not supported.', { file: 'This file type is not supported.' });
  }

  if (file.size > rule.maxSize) {
    const maxMb = Math.round(rule.maxSize / (1024 * 1024));
    throw new UploadError(`The file is too large. Maximum size is ${maxMb} MB.`, {
      file: `Maximum size is ${maxMb} MB.`,
    });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = `${generateId('upl')}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  return {
    name: file.name,
    url: `/api/uploads/${storedName}`,
    size: String(file.size),
  };
}
