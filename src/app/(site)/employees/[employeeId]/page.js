import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEmployeeProfile } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/StateViews';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** @param {{ params: Promise<{ employeeId: string }> }} props */
export async function generateMetadata({ params }) {
  const { employeeId } = await params;
  const profile = await getEmployeeProfile(employeeId);
  if (!profile) return { title: 'Employee not found' };
  return {
    title: profile.employee.fullName,
    description: `${profile.employee.jobTitle} - ${profile.team?.name ?? 'Data Warehouse Department'}`,
  };
}

/** `/employees/[employeeId]` - full, personal profile page. */
export default async function EmployeeProfilePage({ params }) {
  const { employeeId } = await params;
  const profile = await getEmployeeProfile(employeeId);

  if (!profile) notFound();

  const {
    employee,
    team,
    subTeam,
    manager,
    subTeamLead,
    colleagues,
    initiatives,
    achievements,
    stories,
    recognition,
    competitionsWon,
  } = profile;

  return (
    <>
      <PageHeader
        title={employee.fullName}
        lead={employee.jobTitle}
        breadcrumbs={[{ label: 'People', href: ROUTES.employees }, { label: employee.fullName }]}
        actions={
          <Button href={ROUTES.employees} variant="on-dark" icon="ArrowBack">
            Back to directory
          </Button>
        }
      />

      {/* 1. Profile header --------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page">
          <div className="spotlight">
            <div className="spotlight__media">
              <Avatar name={employee.fullName} src={employee.photo} size="2xl" ringGold />
            </div>

            <div className="spotlight__content">
              <div className="u-cluster u-cluster--sm">
                <Badge tone="on-dark">{employee.role}</Badge>
                {employee.featured ? (
                  <Badge tone="gold" icon="Star">
                    Featured colleague
                  </Badge>
                ) : null}
              </div>

              <h2>{employee.fullName}</h2>
              <p className="hero__lead">{employee.jobTitle}</p>

              {employee.quote ? <p className="hero__lead">"{employee.quote}"</p> : null}

              <div className="u-cluster">
                <span className="badge badge--on-dark">
                  <Icon name="Groups" fontSize="inherit" />
                  {team?.name ?? 'PLACEHOLDER - team'}
                </span>
                <span className="badge badge--on-dark">
                  <Icon name="Hub" fontSize="inherit" />
                  {subTeam?.name ?? 'PLACEHOLDER - sub-team'}
                </span>
                <span className="badge badge--on-dark">
                  <Icon name="MailOutline" fontSize="inherit" />
                  {employee.email}
                </span>
                <span className="badge badge--on-dark">
                  <Icon name="Schedule" fontSize="inherit" />
                  Joined {formatDate(employee.joinedDate, 'monthYear')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            {/* 2. About me --------------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Person" />
                About me
              </h2>
              <p className="prose prose--wide">{employee.bio}</p>
            </article>

            {/* 3. Role & responsibilities ------------------------------------ */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Work" />
                Role & responsibilities
              </h2>
              <ul className="icon-list">
                {(employee.responsibilities ?? []).map((item) => (
                  <li className="icon-list__item" key={item}>
                    <span className="icon-list__bullet">
                      <Icon name="CheckCircle" fontSize="inherit" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            {/* 5 + 6. Expertise and skills ----------------------------------- */}
            <div className="grid-auto grid-auto--2">
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Insights" />
                  Areas of expertise
                </h2>
                <TagList items={employee.expertise} />
              </article>

              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="TrendingUp" />
                  Skills
                </h2>
                <div className="u-stack u-stack--sm">
                  {(employee.skills ?? []).map((skill) => (
                    <ProgressBar
                      key={skill.name}
                      value={skill.level}
                      label={skill.name}
                      valueLabel={`${skill.level}%`}
                    />
                  ))}
                </div>
              </article>
            </div>

            {/* 7. Hobbies & interests ---------------------------------------- */}
            <div className="grid-auto grid-auto--2">
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="SportsSoccer" />
                  Hobbies
                </h2>
                <TagList items={employee.hobbies} />
              </article>
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Interests" />
                  Interests
                </h2>
                <TagList items={employee.interests} />
              </article>
            </div>

            {/* 8 + 9. Achievements, awards and prizes ------------------------ */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="EmojiEvents" />
                Achievements, awards & prizes
              </h2>

              <ul className="icon-list">
                {(employee.achievements ?? []).map((item) => (
                  <li className="icon-list__item" key={item}>
                    <span className="icon-list__bullet">
                      <Icon name="Star" fontSize="inherit" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {employee.awards?.length ? (
                <>
                  <hr className="u-divider" />
                  <div className="u-cluster">
                    {employee.awards.map((award) => (
                      <span className="badge badge--gold" key={`${award.title}-${award.year}`}>
                        <Icon name="MilitaryTech" fontSize="inherit" />
                        {award.title} - {award.year}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}

              {competitionsWon.length ? (
                <>
                  <hr className="u-divider" />
                  <p className="u-text-sm u-muted">Competition wins</p>
                  <div className="u-cluster">
                    {competitionsWon.map((competition) => (
                      <Link key={competition.id} href={ROUTES.competition(competition.id)} className="badge badge--accent">
                        <Icon name="SportsEsports" fontSize="inherit" />
                        {competition.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}

              {achievements.length ? (
                <>
                  <hr className="u-divider" />
                  <div className="grid-auto grid-auto--2">
                    {achievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        teamName={team?.shortName}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </article>

            {/* 10. Initiatives / projects ------------------------------------ */}
            <div className="u-stack">
              <SectionHeading
                eyebrow="Contribution"
                eyebrowIcon="Lightbulb"
                title="Initiatives & projects"
                subtitle={`${initiatives.length} initiative(s) this colleague has contributed to.`}
                as="h2"
              />
              {initiatives.length ? (
                <div className="grid-auto grid-auto--2">
                  {initiatives.map((initiative) => (
                    <InitiativeCard key={initiative.id} initiative={initiative} teamName={team?.shortName} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="Lightbulb"
                  title="No initiatives recorded yet"
                  message="Initiatives this colleague contributes to will appear here."
                  actionLabel="Browse all initiatives"
                  actionHref={ROUTES.initiatives}
                />
              )}
            </div>

            {/* Success stories ------------------------------------------------ */}
            {stories.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="AutoStories" />
                  Featured in success stories
                </h2>
                <ul className="icon-list">
                  {stories.map((story) => (
                    <li className="icon-list__item" key={story.id}>
                      <span className="icon-list__bullet">
                        <Icon name="AutoStories" fontSize="inherit" />
                      </span>
                      <Link href={`${ROUTES.successStories}?story=${story.id}`}>{story.title}</Link>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>

          {/* Sidebar ---------------------------------------------------------- */}
          <aside className="u-stack">
            {/* 4. Team & sub-team ------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="AccountTree" />
                Team & sub-team
              </h2>
              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Team</dt>
                  <dd>
                    {team ? (
                      <Link href={`${ROUTES.teams}?team=${team.id}`}>{team.name}</Link>
                    ) : (
                      'PLACEHOLDER'
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Sub-team</dt>
                  <dd>
                    {subTeam && team ? (
                      <Link href={`${ROUTES.teams}?team=${team.id}&subTeam=${subTeam.id}`}>{subTeam.name}</Link>
                    ) : (
                      'PLACEHOLDER'
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Manager</dt>
                  <dd>{manager ? <Link href={ROUTES.employee(manager.id)}>{manager.fullName}</Link> : 'PLACEHOLDER'}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Sub-team lead</dt>
                  <dd>
                    {subTeamLead ? (
                      <Link href={ROUTES.employee(subTeamLead.id)}>{subTeamLead.fullName}</Link>
                    ) : (
                      'PLACEHOLDER'
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Extension</dt>
                  <dd>{employee.extension}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Location</dt>
                  <dd>{employee.location}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Languages</dt>
                  <dd>{(employee.languages ?? []).join(', ') || 'PLACEHOLDER'}</dd>
                </div>
              </dl>
            </article>

            {/* 11. Fun facts -------------------------------------------------- */}
            <article className="detail-panel">
              <h2 className="detail-panel__title">
                <Icon name="Celebration" />
                Fun facts
              </h2>
              <ul className="icon-list">
                {(employee.funFacts ?? []).map((fact) => (
                  <li className="icon-list__item" key={fact}>
                    <span className="icon-list__bullet">
                      <Icon name="Bolt" fontSize="inherit" />
                    </span>
                    {fact}
                  </li>
                ))}
              </ul>
            </article>

            {/* Recognition received -------------------------------------------- */}
            {recognition.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Favorite" />
                  Recognition received
                </h2>
                <div className="u-stack u-stack--sm">
                  {recognition.slice(0, 4).map((item) => (
                    <p className="quote-block" key={item.id}>
                      {item.message}
                      {item.from ? <span className="u-text-xs u-subtle"> - {item.from.fullName}</span> : null}
                    </p>
                  ))}
                </div>
              </article>
            ) : null}

            {/* Sub-team colleagues -------------------------------------------- */}
            {colleagues.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Groups" />
                  Sub-team colleagues
                </h2>
                <div className="u-stack u-stack--sm">
                  {colleagues.map((person) => (
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
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
