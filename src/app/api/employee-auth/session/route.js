import { findById } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { getEmployeeSession } from '@/lib/employeeSession';
import { handleError, ok } from '@/lib/apiResponse';

/** GET /api/employee-auth/session -- the current employee session, if any. */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getEmployeeSession();
    if (!session) return ok({ authenticated: false });

    const employee = await findById(RESOURCES.employees, session.sub);
    if (!employee) return ok({ authenticated: false });

    return ok({
      authenticated: true,
      employeeId: employee.id,
      fullName: employee.fullName,
      jobTitle: employee.jobTitle,
      photo: employee.photo ?? null,
    });
  } catch (error) {
    return handleError(error);
  }
}
