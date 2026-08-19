import { findById, listAll, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { rules, sanitizeText, validate, isValid } from '@/lib/validation';
import { saveUpload, UploadError } from '@/lib/uploads';

/**
 * POST /api/competitions/:competitionId/submit
 *
 * Attaches a zip entry file to a colleague's existing participation record.
 * Only accepted while the competition is Active, and only for someone who
 * has already registered via `/api/participate` (matched by email) - this
 * is a public route (no admin/session), so that prior-participation check
 * is what stands in for authentication.
 */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  name: [rules.required('Enter your name.')],
  email: [rules.required('Enter your email address.'), rules.email()],
};

export async function POST(request, { params }) {
  try {
    const { competitionId } = await params;

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return fail('Request must be multipart/form-data.', { code: 'INVALID_BODY' });
    }

    const values = {
      employeeId: sanitizeText(formData.get('employeeId'), 60),
      name: sanitizeText(formData.get('name'), 120),
      email: sanitizeText(formData.get('email'), 160),
      message: sanitizeText(formData.get('message'), 2000),
    };

    const errors = validate(values, SCHEMA);
    if (!isValid(errors)) {
      return fail('Please correct the highlighted fields.', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    const competition = await findById(RESOURCES.competitions, competitionId);
    if (!competition) {
      return fail('That competition no longer exists.', { status: 404, code: 'NOT_FOUND' });
    }
    if (competition.status !== 'Active') {
      const message =
        competition.status === 'Upcoming'
          ? 'This competition has not opened for submissions yet.'
          : 'This competition has already closed.';
      return fail(message, { status: 409, code: 'COMPETITION_NOT_ACTIVE' });
    }

    const submissions = await listAll(RESOURCES.submissions);
    const priorEntry = submissions
      .filter(
        (entry) =>
          entry.type === 'Competition Entry' &&
          entry.competitionId === competition.id &&
          String(entry.email ?? '').toLowerCase() === values.email.toLowerCase(),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    if (!priorEntry) {
      return fail('Please participate in this competition first, then come back to submit your entry.', {
        status: 409,
        code: 'NOT_PARTICIPATING',
      });
    }

    let attachment;
    try {
      attachment = await saveUpload(formData.get('file'), { kind: 'archive' });
    } catch (uploadError) {
      if (uploadError instanceof UploadError) {
        return fail(uploadError.message, { code: uploadError.code, details: uploadError.details });
      }
      throw uploadError;
    }

    const updated = await updateRecord(RESOURCES.submissions, priorEntry.id, {
      attachment,
      message: values.message || priorEntry.message,
    });

    return ok({ competitionId: competition.id, submissionId: updated.id, attachment });
  } catch (error) {
    return handleError(error);
  }
}
