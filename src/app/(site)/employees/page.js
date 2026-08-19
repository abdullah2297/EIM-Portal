import { PageHeader } from '@/components/layout/PageHeader';
import { EmployeeDirectory } from './EmployeeDirectory';

export const metadata = {
  title: 'Employee Directory',
  description:
    'Discover colleagues across the Data Warehouse Department - their roles, teams, expertise, hobbies and achievements.',
};

/** `/employees` - searchable, filterable directory of everyone in the department. */
export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        title="Employee Directory"
        lead="Discover who does what, find the expertise you need, and get to know the person behind the job title."
        breadcrumbs={[{ label: 'People' }]}
      />
      <EmployeeDirectory />
    </>
  );
}
