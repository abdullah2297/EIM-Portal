import { createRecord, findById, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { rules, sanitizeText, validate, isValid } from '@/lib/validation';

/**
 * POST /api/participate
 *
 * Registers a colleague for a competition. The entry is stored as a
 * submission (so the organisers see it in the admin inbox) and, when the
 * employee is identified, their id is added to the competition's participant
 * list so the participant count and leaderboard stay accurate.
 */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  competitionId: [rules.required('Competition is required.')],
  name: [rules.required('Enter your name.'), rules.maxLength(120)],
  email: [rules.required('Enter your email address.'), rules.email()],
  message: [rules.maxLength(2000)],
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
      competitionId: sanitizeText(body?.competitionId, 60),
      employeeId: sanitizeText(body?.employeeId, 60),
      name: sanitizeText(body?.name, 120),
      email: sanitizeText(body?.email, 160),
      message: sanitizeText(body?.message, 2000),
    };

    const errors = validate(values, SCHEMA);
    if (!isValid(errors)) {
      return fail('Please correct the highlighted fields.', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    const competition = await findById(RESOURCES.competitions, values.competitionId);
    if (!competition) {
      return fail('That competition no longer exists.', { status: 404, code: 'NOT_FOUND' });
    }
    if (competition.status === 'Completed') {
      return fail('This competition has already closed.', { status: 409, code: 'COMPETITION_CLOSED' });
    }

    if (values.employeeId) {
      const participants = Array.isArray(competition.participantIds) ? competition.participantIds : [];
      if (participants.includes(values.employeeId)) {
        return fail('You are already registered for this competition.', {
          status: 409,
          code: 'ALREADY_REGISTERED',
        });
      }
      await updateRecord(RESOURCES.competitions, competition.id, {
        participantIds: [...participants, values.employeeId],
      });
    }

    await createRecord(
      RESOURCES.submissions,
      {
        type: 'Competition Entry',
        name: values.name,
        email: values.email,
        subject: `Entry: ${competition.name}`,
        message: values.message || 'PLACEHOLDER - no additional message provided.',
        competitionId: competition.id,
        employeeId: values.employeeId || null,
        attachment: null,
        status: 'New',
        createdAt: new Date().toISOString(),
      },
      'sub',
    );

    return ok(
      { competitionId: competition.id, registered: true, employeeId: values.employeeId || null },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
