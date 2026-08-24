import { createRecord, findById, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { rules, sanitizeText, validate, isValid } from '@/lib/validation';
import { requireEmployee } from '@/lib/employeeSession';

/**
 * POST /api/participate
 *
 * Registers the logged-in employee for a competition. The entry is stored
 * as a submission (so the organisers see it in the admin inbox) and their id
 * is added to the competition's participant list so the participant count
 * and leaderboard stay accurate. The identity comes from the verified
 * session, not from the request body, so this can no longer be spoofed.
 */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  competitionId: [rules.required('Competition is required.')],
  message: [rules.maxLength(2000)],
};

export async function POST(request) {
  try {
    const session = await requireEmployee();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const values = {
      competitionId: sanitizeText(body?.competitionId, 60),
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

    const employee = await findById(RESOURCES.employees, session.sub);
    if (!employee) {
      return fail('Your employee record could not be found.', { status: 404, code: 'EMPLOYEE_NOT_FOUND' });
    }

    const participants = Array.isArray(competition.participantIds) ? competition.participantIds : [];
    if (participants.includes(employee.id)) {
      return fail('You are already registered for this competition.', {
        status: 409,
        code: 'ALREADY_REGISTERED',
      });
    }
    await updateRecord(RESOURCES.competitions, competition.id, {
      participantIds: [...participants, employee.id],
    });

    await createRecord(
      RESOURCES.submissions,
      {
        type: 'Competition Entry',
        name: employee.fullName,
        email: employee.email,
        subject: `Entry: ${competition.name}`,
        message: values.message || 'PLACEHOLDER - no additional message provided.',
        competitionId: competition.id,
        employeeId: employee.id,
        attachment: null,
        status: 'New',
        createdAt: new Date().toISOString(),
      },
      'sub',
    );

    return ok(
      { competitionId: competition.id, registered: true, employeeId: employee.id },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
