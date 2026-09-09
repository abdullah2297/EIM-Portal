import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { TeamCard } from '@/components/cards/TeamCard';
import { EmployeeCard } from '@/components/cards/EmployeeCard';
import { AnnouncementCard } from '@/components/cards/AnnouncementCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { InitiativeCard } from '@/components/cards/InitiativeCard';
import { SuccessStoryCard } from '@/components/cards/SuccessStoryCard';
import { CompetitionCard } from '@/components/cards/CompetitionCard';
import { EmptyState } from '@/components/ui/StateViews';
import { OrgChart } from '@/components/department/OrgChart';
import { ROUTES } from '@/lib/constants';

/**
 * The remaining home page sections. They are grouped in one module because
 * each is a thin, data-driven composition of the shared card components.
 */

/** @param {{ departmentName: string, head?: any, executives?: any[], teams: any[] }} props */
export function OrgChartSection({ departmentName, head, executives, teams }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="How we are organised"
          eyebrowIcon="AccountTree"
          title="Organisational structure"
          subtitle="Behind every data-driven decision is a team that transforms information into insight and insight into action."
          action={<Button href={ROUTES.department} variant="outline" iconAfter="ArrowForward">Department page</Button>}
        />
        <div className="card">
          <OrgChart departmentName={departmentName} head={head} executives={executives} teams={teams} />
        </div>
      </div>
    </section>
  );
}

/** @param {{ teams: any[] }} props */
export function TeamsSection({ teams }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our structure"
          eyebrowIcon="AccountTree"
          title="The Teams Behind the Data Journey"
          subtitle="Behind every data-driven decision is a team that transforms information into insight and insight into action."
          action={<Button href={ROUTES.teams} variant="outline" iconAfter="ArrowForward">All teams</Button>}
        />

        {teams.length ? (
          <div className="grid-auto">
            {teams.map((team, index) => (
              <div key={team.id} className={`u-anim-in u-delay-${index + 1}`}>
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="Groups" title="No teams yet" message="Add the first team through the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ employees: any[] }} props */
export function FeaturedEmployeesSection({ employees }) {
  return (
    <section className="section section--muted">
      <div className="container-page">
        <SectionHeading
          eyebrow="Meet the team"
          eyebrowIcon="Badge"
          title="Featured colleagues"
          subtitle="Get to know the people behind the data - their expertise, their interests and what they are working on."
          action={<Button href={ROUTES.employees} variant="outline" iconAfter="ArrowForward">Employee directory</Button>}
        />

        {employees.length ? (
          <div className="grid-auto grid-auto--4">
            {employees.slice(0, 4).map((employee, index) => (
              <div key={employee.id} className={`u-anim-in u-delay-${index + 1}`}>
                <EmployeeCard employee={employee} teamName={employee.team?.name} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="Badge" title="No colleagues yet" message="Add people through the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ announcements: any[] }} props */
export function AnnouncementsSection({ announcements }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Stay informed"
          eyebrowIcon="Campaign"
          title="Latest announcements"
          subtitle="Department updates, events and things you need to know this week."
          action={<Button href={ROUTES.announcements} variant="outline" iconAfter="ArrowForward">All news</Button>}
        />

        {announcements.length ? (
          <div className="grid-auto grid-auto--2">
            {announcements.map((announcement, index) => (
              <div key={announcement.id} className={`u-anim-in u-delay-${index + 1}`}>
                <AnnouncementCard announcement={announcement} author={announcement.author} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="Campaign" title="No announcements yet" message="Publish the first update from the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ achievements: any[], teamsById: Record<string, any> }} props */
export function AchievementsSection({ achievements, teamsById }) {
  return (
    <section className="section section--fade">
      <div className="container-page">
        <SectionHeading
          eyebrow="Celebrating success"
          eyebrowIcon="EmojiEvents"
          title="Recent achievements & awards"
          subtitle="Recognition earned by our teams and colleagues, inside and outside the department."
          action={<Button href={ROUTES.achievements} variant="outline" iconAfter="ArrowForward">All achievements</Button>}
        />

        {achievements.length ? (
          <div className="grid-auto">
            {achievements.map((achievement, index) => (
              <div key={achievement.id} className={`u-anim-in u-delay-${index + 1}`}>
                <AchievementCard
                  achievement={achievement}
                  teamName={(achievement.teamIds ?? [])
                    .map((id) => teamsById[id]?.shortName)
                    .filter(Boolean)
                    .join(', ')}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="EmojiEvents" title="No achievements recorded" message="Record the first achievement from the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ initiatives: any[] }} props */
export function InitiativesSection({ initiatives }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Innovation"
          eyebrowIcon="Lightbulb"
          title="Featured initiatives"
          subtitle="Ideas that started inside the department and turned into real improvements."
          action={<Button href={ROUTES.initiatives} variant="outline" iconAfter="ArrowForward">All initiatives</Button>}
        />

        {initiatives.length ? (
          <div className="grid-auto">
            {initiatives.map((initiative, index) => (
              <div key={initiative.id} className={`u-anim-in u-delay-${index + 1}`}>
                <InitiativeCard
                  initiative={initiative}
                  teamName={initiative.teams?.map((team) => team.name).join(', ')}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="Lightbulb" title="No initiatives yet" message="Add the first initiative from the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ stories: any[] }} props */
export function SuccessStoriesSection({ stories }) {
  const [featured, ...rest] = stories;

  return (
    <section className="section section--muted">
      <div className="container-page">
        <SectionHeading
          eyebrow="Success stories"
          eyebrowIcon="AutoStories"
          title="What great looks like"
          subtitle="Real problems, the work that solved them, and the difference it made."
          action={<Button href={ROUTES.successStories} variant="outline" iconAfter="ArrowForward">All stories</Button>}
        />

        {featured ? (
          <div className="u-stack u-stack--lg">
            <SuccessStoryCard story={featured} teamName={featured.team?.name} contributors={featured.contributors} featured />
            {rest.length ? (
              <div className="grid-auto grid-auto--2">
                {rest.map((story) => (
                  <SuccessStoryCard
                    key={story.id}
                    story={story}
                    teamName={story.team?.name}
                    contributors={story.contributors}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState icon="AutoStories" title="No stories yet" message="Share the first success story from the admin panel." />
        )}
      </div>
    </section>
  );
}

/** @param {{ competitions: any[] }} props */
export function CompetitionsSection({ competitions }) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading
          eyebrow="Get involved"
          eyebrowIcon="SportsEsports"
          title="Competitions & challenges"
          subtitle="Take part, climb the leaderboard and win one of the prizes on offer."
          action={<Button href={ROUTES.competitions} variant="outline" iconAfter="ArrowForward">All competitions</Button>}
        />

        {competitions.length ? (
          <div className="grid-auto">
            {competitions.map((competition, index) => (
              <div key={competition.id} className={`u-anim-in u-delay-${index + 1}`}>
                <CompetitionCard competition={competition} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="SportsEsports"
            title="No open competitions"
            message="Nothing is running right now - the next challenge will appear here as soon as it is announced."
          />
        )}
      </div>
    </section>
  );
}

/** @param {{ head?: any }} props */
export function CtaSection({ head }) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="cta-band">
          <div className="cta-band__content">
            <Badge tone="on-dark" icon="Handshake">
              Employee engagement
            </Badge>
            <h2>This portal is built by all of us</h2>
            <p className="hero__lead">
              Got an idea worth trying, a story worth telling or a colleague worth celebrating? Send it
              our way and we will feature it here.
            </p>
            {head ? (
              <span className="u-cluster u-cluster--sm">
                <Avatar name={head.fullName} src={head.photo} size="sm" />
                <span className="u-text-sm">
                  {head.fullName} - {head.jobTitle}
                </span>
              </span>
            ) : null}
          </div>

          <div className="cta-band__actions">
            <Button href={ROUTES.contact} variant="gold" size="lg" icon="TipsAndUpdates">
              Submit an idea
            </Button>
            <Button href={ROUTES.recognition} variant="on-dark" size="lg" icon="Celebration">
              Recognise a colleague
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small helper strip linking to the sections not covered by the main nav. */
export function QuickLinksSection() {
  const links = [
    { href: ROUTES.gallery, label: 'Gallery', icon: 'PhotoLibrary', text: 'Photos from our events and celebrations.' },
    { href: ROUTES.recognition, label: 'Recognition wall', icon: 'Celebration', text: 'Employee and team of the quarter.' },
    { href: ROUTES.department, label: 'Our department', icon: 'AccountBalance', text: 'Mission, structure and portfolios.' },
    { href: ROUTES.contact, label: 'Get involved', icon: 'ContactSupport', text: 'Ideas, stories and contact details.' },
  ];

  return (
    <section className="section section--tight">
      <div className="container-page">
        <div className="grid-auto grid-auto--4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="card card--interactive">
              <div className="card__body">
                <span className="team-card__icon">
                  <Icon name={link.icon} fontSize="medium" />
                </span>
                <h3 className="card__title">{link.label}</h3>
                <p className="card__text">{link.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
