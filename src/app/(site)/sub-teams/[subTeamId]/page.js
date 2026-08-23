import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubTeamDetail } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Avatar } from '@/components/ui/Avatar';
import { TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/StateViews';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { ROUTES } from '@/lib/constants';

/** @param {{ params: Promise<{ subTeamId: string }> }} props */
export async function generateMetadata({ params }) {
  const { subTeamId } = await params;
  const detail = await getSubTeamDetail(subTeamId);
  if (!detail) return { title: 'Sub-team not found' };
  return { title: detail.subTeam.name, description: detail.subTeam.description };
}

/** `/sub-teams/[subTeamId]` - full sub-team profile: overview, people, initiatives and achievements. */
export default async function SubTeamDetailPage({ params }) {
  const { subTeamId } = await params;
  const detail = await getSubTeamDetail(subTeamId);
  if (!detail) notFound();

  const { subTeam, team, lead, members, initiatives, achievements } = detail;

  return (
    <>
      <PageHeader
        title={subTeam.name}
        lead={subTeam.description}
        breadcrumbs={[
          { label: 'Our Squads', href: ROUTES.ourSquads },
          { label: 'Teams', href: ROUTES.teams },
          ...(team ? [{ label: team.shortName, href: ROUTES.team(team.id) }] : []),
          { label: subTeam.name },
        ]}
        actions={
          team ? (
            <Button href={ROUTES.team(team.id)} variant="on-dark" icon="ArrowBack">
              {team.shortName}
            </Button>
          ) : (
            <Button href={ROUTES.teams} variant="on-dark" icon="ArrowBack">
              All teams
            </Button>
          )
        }
      >
        {team ? (
          <span className="badge badge--on-dark">
            <Icon name="AccountTree" fontSize="inherit" />
            Part of {team.name}
          </span>
        ) : null}
      </PageHeader>

      {/* 1. Overview ----------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="FactCheck" />
                Responsibilities
              </h2>
              <ul className="icon-list">
                {(subTeam.responsibilities ?? []).map((item) => (
                  <li className="icon-list__item" key={item}>
                    <span className="icon-list__bullet">
                      <Icon name="CheckCircle" fontSize="inherit" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Insights" />
                Focus areas
              </h2>
              <TagList items={subTeam.focusAreas} />
            </article>
          </div>

          <aside className="u-stack">
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="BusinessCenter" />
                Supported portfolios
              </h2>
              <TagList items={subTeam.portfolios} />
            </article>

            {lead ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Person" />
                  Sub-team lead
                </h2>
                <Link href={ROUTES.employee(lead.id)} className="u-cluster">
                  <Avatar name={lead.fullName} src={lead.photo} size="md" ring />
                  <span className="u-stack u-stack--sm">
                    <strong className="u-text-sm">{lead.fullName}</strong>
                    <span className="u-text-xs u-subtle">{lead.jobTitle}</span>
                  </span>
                </Link>
              </article>
            ) : null}

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Insights" />
                At a glance
              </h2>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Team</dt>
                  <dd>{team ? <Link href={ROUTES.team(team.id)}>{team.name}</Link> : 'PLACEHOLDER'}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Members</dt>
                  <dd>
                    <Link href="#members" className="detail-list__stat-link">{members.length}</Link>
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Initiatives</dt>
                  <dd>
                    <Link href="#initiatives" className="detail-list__stat-link">{initiatives.length}</Link>
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Achievements</dt>
                  <dd>
                    <Link href="#achievements" className="detail-list__stat-link">{achievements.length}</Link>
                  </dd>
                </div>
              </dl>
            </article>
          </aside>
        </div>
      </section>

      {/* 2. People ---------------------------------------------------------------- */}
      <section id="members" className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="The people"
            eyebrowIcon="Badge"
            title={`${subTeam.name} members`}
            subtitle={`${members.length} colleague(s) in this sub-team.`}
            action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">Full directory</Button>}
          />
          {members.length ? (
            <div className="grid-auto grid-auto--4">
              {members.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  teamName={team?.shortName}
                  subTeamName={subTeam.name}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="Badge" title="No members recorded" message="Colleagues assigned to this sub-team will appear here." />
          )}
        </div>
      </section>

      {/* 3. Initiatives ------------------------------------------------------------ */}
      <section id="initiatives" className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Contribution"
            eyebrowIcon="Lightbulb"
            title="Initiatives"
            subtitle={`${initiatives.length} initiative(s) owned by ${subTeam.name}.`}
            action={<Button href={ROUTES.initiatives} variant="outline" iconAfter="ArrowForward">All initiatives</Button>}
          />
          {initiatives.length ? (
            <div className="grid-auto">
              {initiatives.map((initiative) => (
                <InitiativeCard key={initiative.id} initiative={initiative} teamName={team?.shortName} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Lightbulb" title="No initiatives recorded yet" message="Initiatives owned by this sub-team will appear here." />
          )}
        </div>
      </section>

      {/* 4. Achievements ------------------------------------------------------------ */}
      <section id="achievements" className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Recognition"
            eyebrowIcon="EmojiEvents"
            title="Achievements"
            subtitle={`Awards and milestones earned by ${subTeam.name}.`}
            action={<Button href={ROUTES.achievements} variant="outline" iconAfter="ArrowForward">All achievements</Button>}
          />
          {achievements.length ? (
            <div className="grid-auto">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} teamName={team?.shortName} />
              ))}
            </div>
          ) : (
            <EmptyState icon="EmojiEvents" title="No achievements recorded yet" message="Achievements earned by this sub-team will be celebrated here." />
          )}
        </div>
      </section>
    </>
  );
}
