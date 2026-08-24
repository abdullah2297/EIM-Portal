import { listAll, updateRecord } from '@/lib/db';
import { RESOURCES } from '@/lib/constants';
import { requireEmployee } from '@/lib/employeeSession';
import { fail, handleError, ok } from '@/lib/apiResponse';

/**
 * POST /api/trainings/[trainingId]/cancel
 *
 * Cancels the logged-in employee's own registration - the row is kept (set
 * to `Cancelled`) rather than deleted, so it stays part of their history.
 */

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const session = await requireEmployee();
    const { trainingId } = await params;

    const registrations = await listAll(RESOURCES.trainingRegistrations);
    const mine = registrations.find(
      (item) => item.trainingId === trainingId && item.employeeId === session.sub && item.status !== 'Cancelled',
    );
    if (!mine) {
      return fail('You do not have an active registration for this training.', { status: 404, code: 'NOT_FOUND' });
    }

    const updated = await updateRecord(RESOURCES.trainingRegistrations, mine.id, { status: 'Cancelled' });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
