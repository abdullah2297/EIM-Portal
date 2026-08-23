import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeamDetail } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Avatar } from '@/components/ui/Avatar';
import { TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/StateViews';
import { SubTeamCard } from '@/components/cards/SubTeamCard';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { ROUTES } from '@/lib/constants';

/** @param {{ params: Promise<{ teamId: string }> }} props */
export async function generateMetadata({ params }) {
  const { teamId } = await params;
  const detail = await getTeamDetail(teamId);
  if (!detail) return { title: 'Team not found' };
  return { title: detail.team.name, description: detail.team.description };
}

/** `/teams/[teamId]` - full team profile: overview, sub-teams, people, initiatives and achievements. */
export default async function TeamDetailPage({ params }) {
  const { teamId } = await params;
  const detail = await getTeamDetail(teamId);
  if (!detail) notFound();

  const { team, lead, subTeams, members, initiatives, achievements } = detail;

  return (
    <>
      <PageHeader
        title={team.name}
        lead={team.description}
        breadcrumbs={[
          { label: 'Our Squads', href: ROUTES.ourSquads },
          { label: 'Teams', href: ROUTES.teams },
          { label: team.shortName },
        ]}
        actions={
          <Button href={ROUTES.teams} variant="on-dark" icon="ArrowBack">
            All teams
          </Button>
        }
      />

      {/* 1. Overview ----------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name={team.icon ?? 'Groups'} />
                Mission
              </h2>
              <p className="prose prose--wide">{team.mission}</p>
            </article>

            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="FactCheck" />
                Responsibilities
              </h2>
              <ul className="icon-list">
                {(team.responsibilities ?? []).map((item) => (
                  <li className="icon-list__item" key={item}>
                    <span className="icon-list__bullet">
                      <Icon name="CheckCircle" fontSize="inherit" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <aside className="u-stack">
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="BusinessCenter" />
                Supported portfolios
              </h2>
              <TagList items={team.portfolios} />
            </article>

            {lead ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Person" />
                  Team manager
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
                  <dt>Members</dt>
                  <dd>
                    <Link href="#members" className="detail-list__stat-link">{members.length}</Link>
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Sub-teams</dt>
                  <dd>
                    <Link href="#sub-teams" className="detail-list__stat-link">{subTeams.length}</Link>
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

      {/* 2. Sub-teams ------------------------------------------------------------ */}
      <section id="sub-teams" className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Structure"
            eyebrowIcon="Hub"
            title="Sub-teams"
            subtitle={`${subTeams.length} specialist group(s) inside ${team.shortName}.`}
          />
          {subTeams.length ? (
            <div className="grid-auto">
              {subTeams.map((sub) => (
                <SubTeamCard key={sub.id} subTeam={sub} href={ROUTES.subTeam(sub.id)} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Hub" title="No sub-teams recorded" message="Sub-teams added for this team will appear here." />
          )}
        </div>
      </section>

      {/* 3. People ---------------------------------------------------------------- */}
      <section id="members" className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="The people"
            eyebrowIcon="Badge"
            title={`${team.shortName} members`}
            subtitle={`${members.length} colleague(s) on this team.`}
            action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">Full directory</Button>}
          />
          {members.length ? (
            <div className="grid-auto grid-auto--4">
              {members.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} teamName={team.shortName} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Badge" title="No members recorded" message="Colleagues assigned to this team will appear here." />
          )}
        </div>
      </section>

      {/* 4. Initiatives ------------------------------------------------------------ */}
      <section id="initiatives" className="section section--tight section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Contribution"
            eyebrowIcon="Lightbulb"
            title="Initiatives"
            subtitle={`${initiatives.length} initiative(s) owned by ${team.shortName}.`}
            action={<Button href={ROUTES.initiatives} variant="outline" iconAfter="ArrowForward">All initiatives</Button>}
          />
          {initiatives.length ? (
            <div className="grid-auto">
              {initiatives.map((initiative) => (
                <InitiativeCard key={initiative.id} initiative={initiative} teamName={team.shortName} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Lightbulb" title="No initiatives recorded yet" message="Initiatives owned by this team will appear here." />
          )}
        </div>
      </section>

      {/* 5. Achievements ------------------------------------------------------------ */}
      <section id="achievements" className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Recognition"
            eyebrowIcon="EmojiEvents"
            title="Achievements"
            subtitle={`Awards and milestones earned by ${team.name}.`}
            action={<Button href={ROUTES.achievements} variant="outline" iconAfter="ArrowForward">All achievements</Button>}
          />
          {achievements.length ? (
            <div className="grid-auto">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} teamName={team.shortName} />
              ))}
            </div>
          ) : (
            <EmptyState icon="EmojiEvents" title="No achievements recorded yet" message="Achievements earned by this team will be celebrated here." />
          )}
        </div>
      </section>
    </>
  );
}
