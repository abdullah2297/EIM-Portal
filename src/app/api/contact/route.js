import { createRecord } from '@/lib/db';
import { RESOURCES, SUBMISSION_TYPES } from '@/lib/constants';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { rules, sanitizeText, validate, isValid } from '@/lib/validation';

/**
 * POST /api/contact
 *
 * Single entry point for every public form on /contact: general enquiries,
 * idea submissions, success-story pitches and initiative suggestions.
 * Everything lands in the `submissions` collection and shows up in the
 * admin inbox.
 */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  name: [rules.required('Enter your name.'), rules.maxLength(120)],
  email: [rules.required('Enter your email address.'), rules.email()],
  type: [rules.required('Choose a submission type.'), rules.oneOf(SUBMISSION_TYPES)],
  subject: [rules.required('Enter a subject.'), rules.maxLength(160)],
  message: [
    rules.required('Enter your message.'),
    rules.minLength(20, 'Please give us at least 20 characters of detail.'),
    rules.maxLength(4000),
  ],
};

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const values = {
      name: sanitizeText(body?.name, 120),
      email: sanitizeText(body?.email, 160),
      type: sanitizeText(body?.type, 60),
      subject: sanitizeText(body?.subject, 160),
      message: sanitizeText(body?.message, 4000),
    };

    const errors = validate(values, SCHEMA);
    if (!isValid(errors)) {
      return fail('Please correct the highlighted fields.', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    const record = await createRecord(
      RESOURCES.submissions,
      { ...values, competitionId: null, status: 'New', createdAt: new Date().toISOString() },
      'sub',
    );

    return ok({ id: record.id, type: record.type }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
