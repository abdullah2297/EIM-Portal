import { PageHeader } from '@/components/layout/PageHeader';
import { CompetitionsBoard } from './CompetitionsBoard';

export const metadata = {
  title: 'Competitions & Challenges',
  description:
    'Internal competitions, challenges, leaderboards and prizes for the Data Warehouse Department.',
};

/** `/competitions` - active, upcoming and past challenges with leaderboards. */
export default function CompetitionsPage() {
  return (
    <>
      <PageHeader
        title="Competitions & Challenges"
        lead="Test your skills, learn something new and win a prize while you are at it."
        breadcrumbs={[{ label: 'Competitions' }]}
      />
      <CompetitionsBoard />
    </>
  );
}
