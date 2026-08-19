import { PageHeader } from '@/components/layout/PageHeader';
import { RecognitionWall } from './RecognitionWall';

export const metadata = {
  title: 'Recognition Wall',
  description:
    'A dedicated space to publicly recognise colleagues and teams for their contributions and outstanding work.',
};

/** `/recognition` - employee/team of the quarter, appreciation and awards. */
export default function RecognitionPage() {
  return (
    <>
      <PageHeader
        title="Recognition Wall"
        lead="Where we say thank you out loud. Celebrate a colleague, a team or a moment worth remembering."
        breadcrumbs={[{ label: 'Recognition' }]}
      />
      <RecognitionWall />
    </>
  );
}
