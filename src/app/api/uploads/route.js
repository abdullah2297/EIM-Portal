import { fail, handleError, ok } from '@/lib/apiResponse';
import { requireAdmin } from '@/lib/session';
import { saveUpload, UploadError } from '@/lib/uploads';

/**
 * File upload endpoint (admin only).
 *
 *   POST /api/uploads   multipart/form-data, field name "file"
 *
 * Accepts zip archives and common image formats (see `lib/uploads`). Stores
 * the file under `data/uploads` (outside `public/`, so nothing is served by
 * name-guessing) and returns an `Attachment` shape ({ name, url, size }) that
 * the caller saves on its own record - this route never touches the JSON
 * collections itself.
 */

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await requireAdmin();

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return fail('Request must be multipart/form-data.', { code: 'INVALID_BODY' });
    }

    const attachment = await saveUpload(formData.get('file'));
    return ok(attachment, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return fail(error.message, { code: error.code, details: error.details });
    }
    return handleError(error);
  }
}
