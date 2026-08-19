import { PageHeader } from '@/components/layout/PageHeader';
import { AchievementsBoard } from './AchievementsBoard';

export const metadata = {
  title: 'Achievements & Awards',
  description:
    'Celebrating the accomplishments of employees, teams and the Data Warehouse Department as a whole.',
};

/** `/achievements` - awards, recognition, milestones and a recognition timeline. */
export default function AchievementsPage() {
  return (
    <>
      <PageHeader
        title="Achievements & Awards"
        lead="Every award, milestone and moment of recognition earned by our colleagues and our teams."
        breadcrumbs={[{ label: 'Achievements' }]}
      />
      <AchievementsBoard />
    </>
  );
}
