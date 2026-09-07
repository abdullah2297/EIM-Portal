import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentEmployee, getEmployeeProfile, getMyTrainingRegistrations } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge, TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/StateViews';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { Timeline } from '@/components/ui/Timeline';
import { ProfileEditGate } from './ProfileEditGate';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** "Mar 2024 - Jun 2024", "Mar 2024 - Present", or just an end date alone. */
function formatProjectDateRange(project) {
  if (!project.startDate && !project.endDate) return '';
  const start = project.startDate ? formatDate(project.startDate, 'monthYear') : '';
  const end = project.endDate ? formatDate(project.endDate, 'monthYear') : 'Present';
  return start ? `${start} - ${end}` : end;
}

/** Groups projects by their start year (most recent year first, undated last). */
function groupProjectsByYear(projects) {
  const withYear = (projects ?? []).map((project) => ({
    ...project,
    year: project.startDate ? new Date(project.startDate).getFullYear() : null,
  }));
  const years = [...new Set(withYear.map((project) => project.year))].sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return b - a;
  });
  return years.map((year) => ({
    year,
    projects: withYear
      .filter((project) => project.year === year)
      .sort((a, b) => new Date(b.startDate ?? 0) - new Date(a.startDate ?? 0)),
  }));
}

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

  // "My Training" is personal registration history - only shown on your own
  // profile, never while browsing a colleague's.
  const me = await getCurrentEmployee();
  const isOwnProfile = me?.id === employee.id;
  const myTraining = isOwnProfile ? await getMyTrainingRegistrations(employee.id) : null;

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

      <ProfileEditGate employee={employee} canEdit={isOwnProfile}>
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

            {/* Projects timeline, grouped by year ----------------------------- */}
            {employee.projects?.length ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="Timeline" />
                  Projects
                </h2>
                <div className="u-stack u-stack--lg">
                  {groupProjectsByYear(employee.projects).map(({ year, projects }) => (
                    <div className="u-stack u-stack--sm" key={year ?? 'undated'}>
                      <p className="u-text-sm">
                        <strong>{year ?? 'Undated'}</strong>
                      </p>
                      <Timeline
                        items={projects.map((project, index) => ({
                          id: `${year ?? 'undated'}-${project.name || index}`,
                          dateLabel: formatProjectDateRange(project),
                          title: project.name,
                          description: project.description,
                          meta: (
                            <div className="u-cluster u-cluster--sm">
                              {project.status ? <StatusBadge status={project.status} /> : null}
                              {project.link ? (
                                <a href={project.link} target="_blank" rel="noreferrer noopener" className="u-text-sm">
                                  View project <Icon name="OpenInNew" fontSize="inherit" />
                                </a>
                              ) : null}
                            </div>
                          ),
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {/* My Training - only on your own profile ------------------------- */}
            {isOwnProfile ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="MenuBook" />
                  My Training
                </h2>

                <p className="u-text-sm u-muted">Upcoming</p>
                {myTraining.upcoming.length ? (
                  <ul className="icon-list">
                    {myTraining.upcoming.map((registration) => (
                      <li className="icon-list__item" key={registration.id}>
                        <span className="icon-list__bullet">
                          <Icon name="MenuBook" fontSize="inherit" />
                        </span>
                        <span className="u-stack u-stack--sm">
                          <Link href={ROUTES.learningItem(registration.training.id)}>
                            {registration.training.name}
                          </Link>
                          <span className="u-text-xs u-subtle">
                            {formatDate(registration.training.date, 'short')}
                            {registration.training.instructorName ? ` - ${registration.training.instructorName}` : ''}
                          </span>
                        </span>
                        <StatusBadge status={registration.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="u-text-sm u-subtle">No upcoming training yet.</p>
                )}

                <hr className="u-divider" />

                <p className="u-text-sm u-muted">Completed</p>
                {myTraining.completed.length ? (
                  <ul className="icon-list">
                    {myTraining.completed.map((registration) => (
                      <li className="icon-list__item" key={registration.id}>
                        <span className="icon-list__bullet">
                          <Icon name="CheckCircle" fontSize="inherit" />
                        </span>
                        <span className="u-stack u-stack--sm">
                          <Link href={ROUTES.learningItem(registration.training.id)}>
                            {registration.training.name}
                          </Link>
                          <span className="u-text-xs u-subtle">
                            {formatDate(registration.training.date, 'short')}
                            {registration.training.instructorName ? ` - ${registration.training.instructorName}` : ''}
                          </span>
                        </span>
                        {registration.training.certificateAvailable ? (
                          <Icon name="WorkspacePremium" titleAccess="Certificate available" />
                        ) : null}
                        <StatusBadge status={registration.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="u-text-sm u-subtle">No completed training yet.</p>
                )}

                <Button href={ROUTES.learning} variant="outline" size="sm" iconAfter="ArrowForward">
                  Browse training
                </Button>
              </article>
            ) : null}

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
                      <Link href={ROUTES.team(team.id)}>{team.name}</Link>
                    ) : (
                      'PLACEHOLDER'
                    )}
                  </dd>
                </div>
                <div className="detail-list__row">
                  <dt>Sub-team</dt>
                  <dd>
                    {subTeam ? (
                      <Link href={ROUTES.subTeam(subTeam.id)}>{subTeam.name}</Link>
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

            {/* Career - experience, education, resume ------------------------- */}
            {employee.totalExperienceYears ||
            employee.mobileNumber ||
            employee.computerNumber ||
            employee.educationUniversity ||
            employee.resume ? (
              <article className="detail-panel">
                <h2 className="detail-panel__title">
                  <Icon name="WorkHistory" />
                  Career
                </h2>
                <dl className="detail-list">
                  {employee.totalExperienceYears ? (
                    <div className="detail-list__row">
                      <dt>Experience</dt>
                      <dd>{employee.totalExperienceYears} year(s)</dd>
                    </div>
                  ) : null}
                  {employee.mobileNumber ? (
                    <div className="detail-list__row">
                      <dt>Mobile</dt>
                      <dd>{employee.mobileNumber}</dd>
                    </div>
                  ) : null}
                  {employee.computerNumber ? (
                    <div className="detail-list__row">
                      <dt>Computer number</dt>
                      <dd>{employee.computerNumber}</dd>
                    </div>
                  ) : null}
                  {employee.educationUniversity ? (
                    <div className="detail-list__row">
                      <dt>University</dt>
                      <dd>{employee.educationUniversity}</dd>
                    </div>
                  ) : null}
                  {employee.educationMajor ? (
                    <div className="detail-list__row">
                      <dt>Major</dt>
                      <dd>{employee.educationMajor}</dd>
                    </div>
                  ) : null}
                  {employee.educationGraduationYear ? (
                    <div className="detail-list__row">
                      <dt>Graduated</dt>
                      <dd>{employee.educationGraduationYear}</dd>
                    </div>
                  ) : null}
                </dl>
                {employee.resume ? (
                  <a href={employee.resume.url} target="_blank" rel="noreferrer noopener" className="btn btn--outline btn--sm">
                    <Icon name="Description" fontSize="inherit" />
                    View resume
                  </a>
                ) : null}
              </article>
            ) : null}

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
      </ProfileEditGate>
    </>
  );
}
