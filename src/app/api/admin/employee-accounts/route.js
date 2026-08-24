import { createRecord, deleteRecord, listAll, readCollection, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { ALL_SECTION_KEYS } from '@/lib/siteSections';
import { hashPassword } from '@/lib/employeePassword';
import { requireAdmin } from '@/lib/session';
import { fail, handleError, ok } from '@/lib/apiResponse';

/**
 * Admin-only management of employee logins - deliberately hand-written
 * rather than a generic resource, since `GET /api/[resource]` is always
 * public and this data must never include a password hash. There is no
 * self-service signup: an admin creates every account here, including its
 * initial password and which gated sections it can see.
 */

export const dynamic = 'force-dynamic';

/** Keeps only recognised section keys, deduped. */
function sanitizeSections(value) {
  const requested = Array.isArray(value) ? value : [];
  return ALL_SECTION_KEYS.filter((key) => requested.includes(key));
}

export async function GET() {
  try {
    await requireAdmin();

    const [credentials, employees] = await Promise.all([
      readCollection('employee-credentials'),
      listAll(RESOURCES.employees),
    ]);
    const employeesById = Object.fromEntries(employees.map((employee) => [employee.id, employee]));

    const accounts = (Array.isArray(credentials) ? credentials : [])
      .map((credential) => {
        const employee = employeesById[credential.employeeId];
        return {
          employeeId: credential.employeeId,
          fullName: employee?.fullName ?? 'PLACEHOLDER - employee no longer exists',
          email: employee?.email ?? '',
          sections: Array.isArray(credential.sections) ? credential.sections : [],
          createdAt: credential.createdAt,
        };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return ok(accounts);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const action = String(body?.action ?? 'reset');
    const employeeId = String(body?.employeeId ?? '').trim();
    if (!employeeId) {
      return fail('An employee id is required.', { code: 'VALIDATION_FAILED' });
    }

    const credentials = await readCollection('employee-credentials');
    const list = Array.isArray(credentials) ? credentials : [];
    const credential = list.find((item) => item.employeeId === employeeId);

    if (action === 'create') {
      if (credential) {
        return fail('This employee already has an account - edit or reset it instead.', {
          status: 409,
          code: 'ACCOUNT_EXISTS',
        });
      }
      const password = String(body?.password ?? '');
      if (password.length < 8) {
        return fail('Choose a password with at least 8 characters.', {
          code: 'VALIDATION_FAILED',
          details: { password: 'Use at least 8 characters.' },
        });
      }
      const employee = await listAll(RESOURCES.employees).then((items) =>
        items.find((item) => item.id === employeeId),
      );
      if (!employee) {
        return fail('That employee could not be found.', { status: 404, code: 'EMPLOYEE_NOT_FOUND' });
      }

      const { salt, hash } = hashPassword(password);
      const sections = sanitizeSections(body?.sections);
      await createRecord('employee-credentials', { employeeId, salt, hash, sections }, 'cred');
      return ok({ employeeId, created: true }, { status: 201 });
    }

    if (!credential) {
      return fail('No account found for that employee.', { status: 404, code: 'NOT_FOUND' });
    }

    if (action === 'update-permissions') {
      const sections = sanitizeSections(body?.sections);
      await updateRecord('employee-credentials', credential.id, { sections });
      return ok({ employeeId, sections });
    }

    if (action === 'reset') {
      await deleteRecord('employee-credentials', credential.id);
      return ok({ employeeId, reset: true });
    }

    return fail(`Unknown action "${action}".`, { code: 'UNKNOWN_ACTION' });
  } catch (error) {
    return handleError(error);
  }
}
