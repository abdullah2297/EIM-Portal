import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveUploadRule } from '@/lib/uploads';

/**
 * File download endpoint - public, matching the rest of the site's content.
 *
 *   GET /api/uploads/:filename[?name=Original+file+name.zip]
 *
 * `filename` is the opaque name the upload route generated; `name` (optional)
 * restores the original file name in the download prompt. Images are served
 * `inline` so they render directly in `<img>` tags; everything else forces a
 * download.
 */

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

export async function GET(request, { params }) {
  const { filename } = await params;
  // Strip any path segments regardless of separator so this can never escape
  // the uploads directory, no matter how the segment was encoded.
  const safeName = String(filename ?? '').split(/[\\/]/).pop();

  if (!safeName || safeName.includes('..')) {
    return NextResponse.json(
      { success: false, error: { message: 'File not found.', code: 'NOT_FOUND' } },
      { status: 404 },
    );
  }

  let buffer;
  try {
    buffer = await fs.readFile(path.join(UPLOAD_DIR, safeName));
  } catch {
    return NextResponse.json(
      { success: false, error: { message: 'File not found.', code: 'NOT_FOUND' } },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const downloadName = (searchParams.get('name') || safeName).replace(/["\r\n]/g, '');

  const extension = path.extname(safeName).toLowerCase();
  const rule = resolveUploadRule(extension);
  const contentType = rule?.contentTypes[extension] ?? 'application/octet-stream';
  const disposition = rule?.disposition === 'inline' ? 'inline' : 'attachment';

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${downloadName}"`,
      'Content-Length': String(buffer.length),
    },
  });
}
