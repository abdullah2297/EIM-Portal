import { SectionHeading } from '@/components/ui/SectionHeading';
import { StatTile } from '@/components/ui/StatTile';

/**
 * Department statistics band.
 * @param {{ stats: Record<string, number> }} props
 */
export function StatsSection({ stats }) {
  const tiles = [
    { key: 'employees', label: 'Colleagues across the department', value: stats.employees, icon: 'Groups' },
    { key: 'teams', label: 'Main teams', value: stats.teams, icon: 'AccountTree' },
    { key: 'subTeams', label: 'Specialist sub-teams', value: stats.subTeams, icon: 'Hub' },
    { key: 'portfolios', label: 'Business portfolios supported', value: stats.portfolios, icon: 'BusinessCenter' },
    { key: 'initiatives', label: 'Initiatives delivered or running', value: stats.initiatives, icon: 'Lightbulb' },
    { key: 'achievements', label: 'Achievements and awards', value: stats.achievements, icon: 'EmojiEvents' },
  ];

  return (
    <section className="section section--muted">
      <div className="container-page">
        <SectionHeading
          eyebrow="By the numbers"
          eyebrowIcon="Insights"
          title="Department at a glance"
          subtitle=""
        />

        <div className="grid-auto grid-auto--4">
          {tiles.map((tile, index) => (
            <StatTile
              key={tile.key}
              value={tile.value}
              label={tile.label}
              icon={tile.icon}
              className={`u-anim-in u-delay-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
