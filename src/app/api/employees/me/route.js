import { findById, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { requireEmployee } from '@/lib/employeeSession';
import { fail, handleError, ok } from '@/lib/apiResponse';

/**
 * POST /api/employees/me
 *
 * Lets the logged-in employee update their own profile - identity comes from
 * the session (`session.sub`), never a client-supplied id. Only the fields in
 * `EDITABLE_FIELDS` are ever written; anything else in the request body
 * (jobTitle, role, team/sub-team, email, computerNumber, featured, ...) is
 * silently dropped so an employee can never touch it through this route.
 */

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'photo',
  'bio',
  'quote',
  'expertise',
  'skills',
  'hobbies',
  'interests',
  'funFacts',
  'projects',
  'educationUniversity',
  'educationMajor',
  'educationGraduationYear',
  'totalExperienceYears',
  'mobileNumber',
  'resume',
  'joinedDate',
];

export async function POST(request) {
  try {
    const session = await requireEmployee();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return fail('Request body must be an object.', { code: 'INVALID_BODY' });
    }

    const employee = await findById(RESOURCES.employees, session.sub);
    if (!employee) return fail('Your employee record could not be found.', { status: 404, code: 'EMPLOYEE_NOT_FOUND' });

    const payload = {};
    EDITABLE_FIELDS.forEach((field) => {
      if (field in body) payload[field] = body[field];
    });

    const updated = await updateRecord(RESOURCES.employees, session.sub, payload);
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
