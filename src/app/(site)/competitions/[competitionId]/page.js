import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompetitionDetail, getEmployees } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/ui/StateViews';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { CompetitionCard } from '@/components/cards/CompetitionCard';
import { ParticipateForm } from '@/components/competitions/ParticipateForm';
import { SubmitEntryForm } from '@/components/competitions/SubmitEntryForm';
import { ROUTES } from '@/lib/constants';
import { daysRemaining, formatBytes, formatDate, progressBetween } from '@/lib/format';

/** @param {{ params: Promise<{ competitionId: string }> }} props */
export async function generateMetadata({ params }) {
  const { competitionId } = await params;
  const detail = await getCompetitionDetail(competitionId);
  if (!detail) return { title: 'Competition not found' };
  return { title: detail.competition.name, description: detail.competition.summary };
}

/** `/competitions/[competitionId]` - full brief, rules, prizes, entry and results. */
export default async function CompetitionDetailPage({ params }) {
  const { competitionId } = await params;
  const detail = await getCompetitionDetail(competitionId);
  if (!detail) notFound();

  const { competition, participants, winners, pastWinners, related } = detail;
  const employees = await getEmployees();
  const isClosed = competition.status === 'Completed';
  const remaining = daysRemaining(competition.endDate);

  const timelineItems = [
    {
      id: 'start',
      date: competition.startDate,
      title: 'Competition opens',
      description: 'Registration and submissions open to everyone in the department.',
    },
    {
      id: 'end',
      date: competition.endDate,
      title: 'Submissions close',
      description: 'Last chance to get your entry in before judging begins.',
      tone: 'gold',
    },
  ];

  return (
    <>
      <PageHeader
        title={competition.name}
        lead={competition.summary}
        breadcrumbs={[{ label: 'Competitions', href: ROUTES.competitions }, { label: competition.name }]}
        actions={
          <Button href={ROUTES.competitions} variant="on-dark" icon="ArrowBack">
            All competitions
          </Button>
        }
      >
        <div className="u-cluster u-cluster--sm">
          <StatusBadge status={competition.status} pulse />
          <Badge tone="on-dark">{competition.category}</Badge>
          <Badge tone="on-dark" icon="HowToReg">
            {participants.length} participants
          </Badge>
          {!isClosed ? (
            <Badge tone="on-dark" icon="Schedule">
              {remaining} day(s) remaining
            </Badge>
          ) : null}
        </div>
      </PageHeader>

      <section className="section section--tight">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            {/* 1 + 2. Header media and description --------------------------- */}
            <div className="card">
              <div className="card__media">
                <MediaPlaceholder
                  src={competition.image}
                  alt={competition.name}
                  icon="SportsEsports"
                  variant="brand"
                />
              </div>
              <div className="card__body">
                <h2 className="card__title">About this competition</h2>
                <div className="prose prose--wide">
                  {String(competition.description ?? '')
                    .split('\n\n')
                    .map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                </div>
                {competition.attachment ? (
                  <a
                    className="btn btn--outline btn--sm"
                    href={`${competition.attachment.url}?name=${encodeURIComponent(competition.attachment.name)}`}
                  >
                    <Icon name="FolderZip" fontSize="inherit" />
                    Download competition files ({formatBytes(competition.attachment.size)})
                  </a>
                ) : null}
              </div>
            </div>

            {/* 3. Rules ------------------------------------------------------ */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Gavel" />
                Rules
              </h2>
              <ul className="icon-list">
                {(competition.rules ?? []).map((rule) => (
                  <li className="icon-list__item" key={rule}>
                    <span className="icon-list__bullet">
                      <Icon name="CheckCircle" fontSize="inherit" />
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
              <hr className="u-divider" />
              <p className="u-text-sm u-muted">
                <strong>Eligibility:</strong> {competition.eligibility}
              </p>
            </article>

            {/* 4. Timeline ---------------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Timeline" />
                Timeline
              </h2>
              {!isClosed ? (
                <ProgressBar
                  value={progressBetween(competition.startDate, competition.endDate)}
                  label="Progress"
                  valueLabel={`${remaining} day(s) left`}
                />
              ) : null}
              <Timeline items={timelineItems} />
            </article>

            {/* 5. Prizes ------------------------------------------------------ */}
            <div className="u-stack">
              <SectionHeading
                eyebrow="Rewards"
                eyebrowIcon="CardGiftcard"
                title="Prize information"
                subtitle="What is on offer for the top three places."
                as="h2"
              />
              <div className="grid-auto">
                {(competition.prizes ?? []).map((prize) => (
                  <article className="achievement-card" key={prize.rank}>
                    <span className={`rank-medal ${prize.rank <= 3 ? `rank-medal--${prize.rank}` : ''}`.trim()}>
                      {prize.rank}
                    </span>
                    <h3 className="achievement-card__title">{prize.title}</h3>
                    <p className="achievement-card__text">{prize.description}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* 8 + 9. Results and winners -------------------------------------- */}
            {isClosed ? (
              <div className="u-stack">
                <SectionHeading
                  eyebrow="Results"
                  eyebrowIcon="EmojiEvents"
                  title="Winners"
                  subtitle="Congratulations to the top three."
                  as="h2"
                />
                {winners.length ? (
                  <div className="grid-auto">
                    {winners.map((person, index) => (
                      <article className="achievement-card" key={person.id}>
                        <span className={`rank-medal rank-medal--${index + 1}`}>{index + 1}</span>
                        <Avatar name={person.fullName} src={person.photo} size="lg" ringGold />
                        <h3 className="achievement-card__title">
                          <Link href={ROUTES.employee(person.id)}>{person.fullName}</Link>
                        </h3>
                        <p className="u-text-xs u-subtle">{person.jobTitle}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="EmojiEvents"
                    title="Winners not published yet"
                    message="Results are added once judging is complete."
                  />
                )}
              </div>
            ) : null}
          </div>

          {/* Sidebar: participation and leaderboard -------------------------- */}
          <aside className="u-stack">
            {/* 6. Participation ---------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="HowToReg" />
                Participate
              </h2>
              <ParticipateForm
                competitionId={competition.id}
                competitionName={competition.name}
                closed={isClosed}
                employees={employees.map((employee) => ({
                  id: employee.id,
                  fullName: employee.fullName,
                  email: employee.email,
                }))}
              />
            </article>

            {/* 6b. Submit entry ------------------------------------------------ */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="UploadFile" />
                Submit your entry
              </h2>
              <SubmitEntryForm
                competitionId={competition.id}
                competitionName={competition.name}
                status={competition.status}
                employees={employees.map((employee) => ({
                  id: employee.id,
                  fullName: employee.fullName,
                  email: employee.email,
                }))}
              />
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="FactCheck" />
                How to participate
              </h2>
              <ol className="icon-list">
                {(competition.howToParticipate ?? []).map((step, index) => (
                  <li className="icon-list__item" key={step}>
                    <span className="icon-list__bullet">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </article>

            {/* 7. Past winners -------------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="EmojiEvents" />
                Past winners
              </h2>
              {pastWinners.length ? (
                <div className="u-stack u-stack--sm">
                  {pastWinners.map((winner) => (
                    <div className="u-cluster u-cluster--sm" key={winner.key}>
                      <span className={`rank-medal ${winner.rank <= 3 ? `rank-medal--${winner.rank}` : ''}`.trim()}>
                        {winner.rank}
                      </span>
                      {winner.person ? (
                        <Avatar name={winner.person.fullName} src={winner.person.photo} size="sm" />
                      ) : null}
                      <span className="u-stack u-stack--sm">
                        <strong className="u-text-sm">
                          {winner.person ? (
                            <Link href={ROUTES.employee(winner.person.id)}>{winner.person.fullName}</Link>
                          ) : (
                            'PLACEHOLDER - winner'
                          )}
                        </strong>
                        <span className="u-text-xs u-subtle">{winner.competition.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="u-text-sm u-subtle">No past winners recorded yet.</p>
              )}
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Groups" />
                Participants ({participants.length})
              </h2>
              {participants.length ? (
                <div className="u-cluster u-cluster--sm">
                  {participants.slice(0, 18).map((person) => (
                    <Avatar
                      key={person.id}
                      name={person.fullName}
                      src={person.photo}
                      size="sm"
                      href={ROUTES.employee(person.id)}
                    />
                  ))}
                  {participants.length > 18 ? (
                    <span className="badge badge--neutral">+{participants.length - 18} more</span>
                  ) : null}
                </div>
              ) : (
                <p className="u-text-sm u-subtle">No entries yet - be the first to register.</p>
              )}
            </article>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section--muted">
          <div className="container-page u-stack u-stack--lg">
            <SectionHeading
              eyebrow="More like this"
              eyebrowIcon="SportsEsports"
              title="Related competitions"
              as="h2"
            />
            <div className="grid-auto">
              {related.map((item) => (
                <CompetitionCard key={item.id} competition={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
