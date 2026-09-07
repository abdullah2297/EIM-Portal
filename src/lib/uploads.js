import path from 'node:path';
import { put } from '@vercel/blob';
import { generateId } from './db';

/**
 * Shared rules for file uploads (server only): which extensions are
 * accepted, their size limit and how they should be served back (inline for
 * images so `<img>` tags work, as a forced download otherwise).
 *
 * `saveUpload` does the actual validation + upload to Vercel Blob, so any
 * route that needs to accept a file - the admin-only `/api/uploads`, or a
 * public route gated by its own business rule (e.g. a competition entry) -
 * shares the exact same rules instead of re-implementing them.
 *
 * Files live in Vercel Blob storage rather than the local filesystem because
 * Vercel Functions have a read-only, ephemeral filesystem - anything written
 * to local disk would vanish (or fail to write at all) between requests.
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
  // PDF-only (e.g. an employee's resume) - opens in the browser's own PDF
  // viewer rather than forcing a download, same treatment as images.
  document: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf', 'application/octet-stream'],
    maxSize: 10 * 1024 * 1024, // 10 MB
    contentTypes: { '.pdf': 'application/pdf' },
    disposition: 'inline',
  },
};

/** @param {string} extension e.g. `.png` (lower-cased) */
export function resolveUploadRule(extension) {
  return Object.values(UPLOAD_KINDS).find((kind) => kind.extensions.includes(extension)) ?? null;
}

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
 * Validates an uploaded `File` and stores it in Vercel Blob, restricted to
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

  const storedName = `${generateId('upl')}${extension}`;
  let blob;
  try {
    blob = await put(storedName, file, {
      access: 'public',
      contentType: rule.contentTypes[extension],
      addRandomSuffix: true,
    });
  } catch (error) {
    throw new UploadError('The file could not be uploaded. Please try again.', { file: error?.message ?? 'Upload failed.' });
  }

  return {
    name: file.name,
    // Images render inline (plain `.url`); zips force a save-as dialog
    // (`.downloadUrl`, which sets Content-Disposition: attachment).
    url: rule.disposition === 'attachment' ? blob.downloadUrl : blob.url,
    size: String(file.size),
  };
}
