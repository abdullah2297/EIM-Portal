import { fail, handleError, ok } from '@/lib/apiResponse';
import { requireEmployee } from '@/lib/employeeSession';
import { saveUpload, UploadError } from '@/lib/uploads';

/**
 * POST /api/employees/me/upload
 *
 * Lets the logged-in employee upload their own photo or resume, without
 * needing admin rights - a narrow, employee-gated counterpart to the
 * admin-only `/api/uploads`, restricted to exactly the two kinds their
 * profile form needs.
 */

export const dynamic = 'force-dynamic';

const ALLOWED_KINDS = ['image', 'document'];

export async function POST(request) {
  try {
    await requireEmployee();

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return fail('Request must be multipart/form-data.', { code: 'INVALID_BODY' });
    }

    const kind = formData.get('kind');
    if (!ALLOWED_KINDS.includes(kind)) {
      return fail('Unsupported upload kind.', { code: 'INVALID_KIND' });
    }

    const attachment = await saveUpload(formData.get('file'), { kind });
    return ok(attachment, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return fail(error.message, { code: error.code, details: error.details });
    }
    return handleError(error);
  }
}
