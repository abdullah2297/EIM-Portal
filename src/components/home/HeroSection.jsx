import { Button } from '@/components/ui/Button';
import { StatTile } from '@/components/ui/StatTile';
import { ROUTES } from '@/lib/constants';

/**
 * Home page hero: department introduction plus four headline numbers.
 *
 * @param {{ department: Record<string, any>, stats: Record<string, number> }} props
 */
export function HeroSection({ department, stats }) {
  return (
    <section className="hero">
      <span className="hero__decor" aria-hidden="true" />
      <span className="hero__grid-lines" aria-hidden="true" />

      <div className="container-page hero__inner">
        <div className="hero__content">
          <span className="hero__eyebrow">
            {department?.shortName ?? 'DWH'} - Internal Portal
          </span>

          <h1 className="hero__title">
            The home of the <span className="hero__highlight">{department?.name ?? 'Data Warehouse Department'}</span>
          </h1>

          <p className="hero__lead">{department?.overview}</p>

          <div className="hero__actions">
            <Button href={ROUTES.employees} variant="gold" size="lg" icon="Groups">
              Meet the people
            </Button>
            <Button href={ROUTES.teams} variant="on-dark" size="lg" icon="AccountTree">
              Explore the teams
            </Button>
            <Button href={ROUTES.competitions} variant="on-dark" size="lg" icon="SportsEsports">
              Explore competitions
            </Button>
            <Button href={ROUTES.recognition} variant="on-dark" size="lg" icon="Celebration">
              Recognition wall
            </Button>
          </div>
        </div>

        <div className="hero__panel">
          <StatTile value={stats.employees} label="Colleagues" icon="Groups" onDark />
          <StatTile value={stats.teams} label="Main teams" icon="AccountTree" onDark />
          <StatTile value={stats.subTeams} label="Sub-teams" icon="Hub" onDark />
          <StatTile value={stats.portfolios} label="Portfolios" icon="BusinessCenter" onDark />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
