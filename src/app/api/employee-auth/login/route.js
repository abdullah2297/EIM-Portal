import { cookies } from 'next/headers';
import { listAll, readCollection } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { createEmployeeSessionToken, EMPLOYEE_SESSION_COOKIE } from '@/lib/employeeAuth';
import { verifyPassword } from '@/lib/employeePassword';
import { sessionCookieOptions } from '@/lib/auth';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { isValid, rules, sanitizeText, validate } from '@/lib/validation';

/** POST /api/employee-auth/login -- exchanges email+password for a signed session cookie. */

export const dynamic = 'force-dynamic';

const SCHEMA = {
  email: [rules.required('Enter your work email.')],
  password: [rules.required('Enter your password.')],
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
      email: sanitizeText(body?.email, 160).toLowerCase(),
      password: String(body?.password ?? ''),
    };

    const errors = validate(values, SCHEMA);
    if (!isValid(errors)) {
      return fail('Please correct the highlighted fields.', { code: 'VALIDATION_FAILED', details: errors });
    }

    const invalidCredentials = () =>
      fail('Incorrect email or password.', { status: 401, code: 'INVALID_CREDENTIALS' });

    const employees = await listAll(RESOURCES.employees);
    const employee = employees.find((item) => String(item.email ?? '').toLowerCase() === values.email);
    if (!employee) return invalidCredentials();

    const credentials = await readCollection('employee-credentials');
    const credential = (Array.isArray(credentials) ? credentials : []).find(
      (item) => item.employeeId === employee.id,
    );
    if (!credential) return invalidCredentials();
    if (!verifyPassword(values.password, credential.salt, credential.hash)) return invalidCredentials();

    const { token, expiresAt } = await createEmployeeSessionToken({ employeeId: employee.id });
    const store = await cookies();
    store.set(EMPLOYEE_SESSION_COOKIE, token, sessionCookieOptions(Math.floor((expiresAt - Date.now()) / 1000)));

    return ok({ employeeId: employee.id, fullName: employee.fullName });
  } catch (error) {
    return handleError(error);
  }
}
