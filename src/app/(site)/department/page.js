import Link from 'next/link';
import { getDepartmentPageData } from '@/lib/dataAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatTile } from '@/components/ui/StatTile';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, TagList } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OrgChart } from '@/components/department/OrgChart';
import { TeamCard } from '@/components/cards/TeamCard';
import { SubTeamCard } from '@/components/cards/SubTeamCard';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { ROUTES } from '@/lib/constants';

// Content is read from the JSON data store on every request so edits made in
// the admin panel appear on the portal immediately.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Our Department',
  description:
    'Mission, vision, structure, responsibilities and portfolios of the Data Warehouse Department.',
};

/** `/department` - overview, mission, structure, portfolios, teams, sub-teams. */
export default async function DepartmentPage() {
  const { department, stats, head, leadership, teams, champions } = await getDepartmentPageData();
  const allSubTeams = teams.flatMap((team) => team.subTeams.map((sub) => ({ ...sub, team })));

  return (
    <>
      <PageHeader
        title={department?.name ?? 'Our Department'}
        lead={department?.tagline}
        breadcrumbs={[{ label: 'Our Department' }]}
        actions={
          <Button href={ROUTES.teams} variant="on-dark" icon="AccountTree">
            Explore teams
          </Button>
        }
      />

      {/* 1. Department overview ------------------------------------------- */}
      <section className="section">
        <div className="container-page grid-sidebar grid-sidebar--right">
          <div className="u-stack u-stack--lg">
            <SectionHeading
              eyebrow="Who we are"
              eyebrowIcon="AccountBalance"
              title="Department overview"
            />
            <div className="prose prose--wide">
              <p>{department?.overview}</p>
            </div>

            <div className="grid-auto grid-auto--2">
              <article className="detail-panel">
                <h3 className="detail-panel__title">
                  <Icon name="RocketLaunch" />
                  Our mission
                </h3>
                <p className="u-muted u-text-sm">{department?.mission}</p>
              </article>
              <article className="detail-panel">
                <h3 className="detail-panel__title">
                  <Icon name="Visibility" />
                  Our vision
                </h3>
                <p className="u-muted u-text-sm">{department?.vision}</p>
              </article>
            </div>
          </div>

          <aside className="detail-panel">
            <h3 className="detail-panel__title">
              <Icon name="Person" />
              Leadership
            </h3>

            {head ? (
              <Link href={ROUTES.employee(head.id)} className="u-cluster">
                <Avatar name={head.fullName} src={head.photo} size="md" ring />
                <span className="u-stack u-stack--sm">
                  <strong>{head.fullName}</strong>
                  <span className="u-text-xs u-subtle">{head.jobTitle}</span>
                </span>
              </Link>
            ) : (
              <p className="u-text-sm u-subtle">PLACEHOLDER - department head to be assigned.</p>
            )}

            <hr className="u-divider" />

            <div className="u-stack u-stack--sm">
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

            <hr className="u-divider" />

            <dl className="detail-list">
              <div className="detail-list__row">
                <dt>Established</dt>
                <dd>{department?.establishedYear ?? 'PLACEHOLDER'}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Contact</dt>
                <dd>{department?.contact?.email}</dd>
              </div>
              <div className="detail-list__row">
                <dt>Office hours</dt>
                <dd>{department?.contact?.officeHours}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* 2. Values --------------------------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we stand for"
            eyebrowIcon="Handshake"
            title="Our values"
            subtitle="The principles behind how we build, support and celebrate together."
          />
          <div className="grid-auto grid-auto--4">
            {(department?.values ?? []).map((value, index) => (
              <article className={`card u-anim-in u-delay-${index + 1}`} key={value.title}>
                <div className="card__body">
                  <span className="team-card__icon">
                    <Icon name="Star" fontSize="medium" />
                  </span>
                  <h3 className="card__title">{value.title}</h3>
                  <p className="card__text">{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Key responsibilities ------------------------------------------- */}
      <section className="section">
        <div className="container-page grid-auto grid-auto--2">
          <div className="u-stack">
            <SectionHeading
              eyebrow="What we do"
              eyebrowIcon="FactCheck"
              title="Key responsibilities"
              subtitle="The work the department owns end to end."
            />
            <ul className="icon-list">
              {(department?.responsibilities ?? []).map((item) => (
                <li className="icon-list__item" key={item}>
                  <span className="icon-list__bullet">
                    <Icon name="CheckCircle" fontSize="inherit" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Department statistics --------------------------------------- */}
          <div className="u-stack">
            <SectionHeading
              eyebrow="Scale"
              eyebrowIcon="Insights"
              title="Department statistics"
              subtitle="Calculated live from the portal content."
            />
            <div className="grid-auto grid-auto--2">
              <StatTile value={stats.employees} label="Colleagues" icon="Groups" />
              <StatTile value={stats.teams} label="Main teams" icon="AccountTree" />
              <StatTile value={stats.subTeams} label="Sub-teams" icon="Hub" />
              <StatTile value={stats.portfolios} label="Portfolios" icon="BusinessCenter" />
              <StatTile value={stats.initiatives} label="Initiatives" icon="Lightbulb" />
              <StatTile value={stats.achievements} label="Achievements" icon="EmojiEvents" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Organisational structure --------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we are organised"
            eyebrowIcon="AccountTree"
            title="Organisational structure"
            subtitle="Scroll sideways on smaller screens to see every branch. Select any node to open its team."
          />
          <div className="card">
            <OrgChart departmentName={department?.shortName ?? 'DWH'} head={head} teams={teams} />
          </div>
        </div>
      </section>

      {/* 6. Main teams ------------------------------------------------------ */}
      <section className="section section--fade">
        <div className="container-page">
          <SectionHeading
            eyebrow="Data Pillars"
            eyebrowIcon="Groups"
            title="Main teams overview"
            subtitle="Each team owns a distinct stage of the data lifecycle."
            action={<Button href={ROUTES.teams} variant="outline" iconAfter="ArrowForward">Team explorer</Button>}
          />
          <div className="grid-auto">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={{ ...team, subTeamCount: team.subTeams.length }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Sub-teams ------------------------------------------------------- */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Capability Hubs"
            eyebrowIcon="Hub"
            title="Sub-teams overview"
            subtitle="Specialist groups inside each main team, with their own focus areas."
          />
          <div className="grid-auto">
            {allSubTeams.map((sub) => (
              <div className="u-stack u-stack--sm" key={sub.id}>
                <TagList items={[sub.team.shortName]} />
                <SubTeamCard subTeam={sub} href={ROUTES.subTeam(sub.id)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Champions -------------------------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page">
          <SectionHeading
            eyebrow="Talents"
            eyebrowIcon="Star"
            title="Our champions"
            subtitle="Featured colleagues carrying the department's work forward."
            action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">All champions</Button>}
          />
          <div className="grid-auto grid-auto--4">
            {champions.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} teamName={employee.teamName} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Portfolios ------------------------------------------------------ */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="Who we serve"
            eyebrowIcon="BusinessCenter"
            title="Main portfolios"
            subtitle="The business areas our data products support."
          />
          <div className="grid-auto grid-auto--4">
            {(department?.portfolios ?? []).map((portfolio, index) => (
              <article className={`card u-anim-in u-delay-${index + 1}`} key={portfolio.name}>
                <div className="card__body">
                  <Badge tone="accent">{portfolio.teamCount} team(s)</Badge>
                  <h3 className="card__title">{portfolio.name}</h3>
                  <p className="card__text">{portfolio.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
