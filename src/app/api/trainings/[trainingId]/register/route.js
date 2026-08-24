import { createRecord, findById, listAll } from '@/lib/db';
import { ACTIVE_REGISTRATION_STATUS, RESOURCES } from '@/lib/constants';
import { requireEmployee } from '@/lib/employeeSession';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { isValid, rules, sanitizeText, validate } from '@/lib/validation';

/**
 * POST /api/trainings/[trainingId]/register
 *
 * Registers the logged-in employee for a training - identity comes from the
 * verified session, never the request body (same pattern as `/api/participate`).
 * Collects only what the employee record doesn't already have: computer
 * number and phone number.
 */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  computerNumber: [rules.required('Enter your computer number.')],
  phoneNumber: [rules.required('Enter your phone number.')],
};

export async function POST(request, { params }) {
  try {
    const session = await requireEmployee();
    const { trainingId } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const values = {
      computerNumber: sanitizeText(body?.computerNumber, 60),
      phoneNumber: sanitizeText(body?.phoneNumber, 40),
    };
    const errors = validate(values, SCHEMA);
    if (!isValid(errors)) {
      return fail('Please correct the highlighted fields.', { code: 'VALIDATION_FAILED', details: errors });
    }

    const training = await findById(RESOURCES.trainings, trainingId);
    if (!training) return fail('That training no longer exists.', { status: 404, code: 'NOT_FOUND' });
    if (!training.enableParticipation) {
      return fail('Registration is not available for this training.', { status: 409, code: 'PARTICIPATION_DISABLED' });
    }
    if (training.status !== 'Registration Open') {
      return fail('Registration is not currently open for this training.', { status: 409, code: 'REGISTRATION_CLOSED' });
    }

    const employee = await findById(RESOURCES.employees, session.sub);
    if (!employee) return fail('Your employee record could not be found.', { status: 404, code: 'EMPLOYEE_NOT_FOUND' });

    const registrations = await listAll(RESOURCES.trainingRegistrations);
    const forTraining = registrations.filter((item) => item.trainingId === trainingId);
    const mine = forTraining.find((item) => item.employeeId === employee.id && item.status !== 'Cancelled');
    if (mine) {
      return fail('You are already registered for this training.', { status: 409, code: 'ALREADY_REGISTERED' });
    }

    let status = 'Registered';
    if (training.enableCapacity) {
      const max = Number(training.maxParticipants) || 0;
      const activeCount = forTraining.filter((item) => ACTIVE_REGISTRATION_STATUS.includes(item.status)).length;
      if (max > 0 && activeCount >= max) {
        if (!training.enableWaitlist) {
          return fail('This training is fully booked.', { status: 409, code: 'FULLY_BOOKED' });
        }
        status = 'Waitlisted';
      }
    }

    const record = await createRecord(
      RESOURCES.trainingRegistrations,
      {
        trainingId,
        employeeId: employee.id,
        status,
        computerNumber: values.computerNumber,
        phoneNumber: values.phoneNumber,
      },
      'treg',
    );

    return ok(record, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
