import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/StateViews';
import { SearchResults } from './SearchResults';

export const metadata = {
  title: 'Search',
  description: 'Search across employees, teams, initiatives, achievements, news, stories and competitions.',
};

/** `/search` - one search box across every content type in the portal. */
export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Search"
        lead="One place to find a colleague, a team, an initiative, an announcement or a competition."
        breadcrumbs={[{ label: 'Search' }]}
      />
      <Suspense fallback={<LoadingState label="Preparing search..." />}>
        <SearchResults />
      </Suspense>
    </>
  );
}
