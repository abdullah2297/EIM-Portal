import Link from 'next/link';
import { getDepartment, getLookups, toPersonSummary } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { ContactForms } from './ContactForms';
import { ROUTES } from '@/lib/constants';

// Content is read from the JSON data store on every request so edits made in
// the admin panel appear on the portal immediately.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact / Get Involved',
  description:
    'Contact the Data Warehouse Department, submit an idea, share a success story or suggest an initiative.',
};

/** `/contact` - department contact details plus the four submission forms. */
export default async function ContactPage() {
  const [department, lookups] = await Promise.all([getDepartment(), getLookups()]);
  const head = toPersonSummary(lookups.employeesById[department?.headId]);
  const leadership = (department?.leadershipIds ?? [])
    .map((id) => toPersonSummary(lookups.employeesById[id]))
    .filter(Boolean);

  return (
    <>
      <PageHeader
        title="Contact & Get Involved"
        lead="Ideas, stories, initiatives or plain old questions - this is where they reach us."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section">
        <div className="container-page grid-sidebar">
          {/* 1. Contact information ------------------------------------------ */}
          <aside className="u-stack">
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="ContactSupport" />
                Contact information
              </h2>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Email</dt>
                  <dd>{department?.contact?.email}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Phone</dt>
                  <dd>{department?.contact?.phone}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Location</dt>
                  <dd>{department?.contact?.location}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Office hours</dt>
                  <dd>{department?.contact?.officeHours}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Support channel</dt>
                  <dd>{department?.contact?.supportChannel}</dd>
                </div>
              </dl>
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Person" />
                Who to ask
              </h2>
              <div className="u-stack u-stack--sm">
                {head ? (
                  <Link href={ROUTES.employee(head.id)} className="u-cluster u-cluster--sm">
                    <Avatar name={head.fullName} src={head.photo} size="sm" />
                    <span className="u-stack u-stack--sm">
                      <strong className="u-text-sm">{head.fullName}</strong>
                      <span className="u-text-xs u-subtle">{head.jobTitle}</span>
                    </span>
                  </Link>
                ) : null}
                {leadership.map((person) => (
                  <Link key={person.id} href={ROUTES.employee(person.id)} className="u-cluster u-cluster--sm">
                    <Avatar name={person.fullName} src={person.photo} size="sm" />
                    <span className="u-stack u-stack--sm">
                      <strong className="u-text-sm">{person.fullName}</strong>
                      <span className="u-text-xs u-subtle">{person.jobTitle}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="InfoOutlined" />
                What happens next
              </h2>
              <ul className="icon-list">
                {[
                  'Your submission lands in the department inbox straight away.',
                  'A team lead reviews it and decides where it fits best.',
                  'You will hear back with next steps - even if the answer is not yet.',
                ].map((step, index) => (
                  <li className="icon-list__item" key={step}>
                    <span className="icon-list__bullet">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </article>
          </aside>

          {/* 2-5. The submission forms ---------------------------------------- */}
          <div className="u-stack">
            <SectionHeading
              eyebrow="Your turn"
              eyebrowIcon="Publish"
              title="Send something to the department"
              subtitle="Pick the type of submission that fits best - the form adapts to it."
            />
            <ContactForms />
          </div>
        </div>
      </section>
    </>
  );
}
