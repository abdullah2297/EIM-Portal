import { PageHeader } from '@/components/layout/PageHeader';
import { AbbreviationsLookupForm } from './AbbreviationsLookupForm';

export const metadata = {
  title: 'Abbreviations Lookup',
  description: 'Look up the standard abbreviation for a word, phrase or sentence.',
};

/** `/abbreviations` - footer-only utility page, reachable by any logged-in employee. */
export default function AbbreviationsPage() {
  return (
    <>
      <PageHeader
        title="Abbreviations Lookup"
        lead="Type a word, phrase or a comma-separated list of them to find the standard abbreviation."
        breadcrumbs={[{ label: 'Abbreviations Lookup' }]}
      />

      <section className="section">
        <div className="container-page">
          <AbbreviationsLookupForm />
        </div>
      </section>
    </>
  );
}
