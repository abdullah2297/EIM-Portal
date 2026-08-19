'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { competitionsService, employeesService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SearchInput, ChipFilters } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { StatTile } from '@/components/ui/StatTile';
import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CompetitionCard } from '@/components/cards/CompetitionCard';
import { ROUTES } from '@/lib/constants';

const ALL = 'all';

/**
 * Competitions hub: active and upcoming challenges, the standard rules and
 * prize structure, past competitions, winners and a combined leaderboard.
 */
export function CompetitionsBoard() {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 250);

  const { data: employeesData } = useAsyncData(() => employeesService.list(), []);
  const employees = useMemo(() => employeesData?.items ?? [], [employeesData]);
  const employeesById = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  const { data, error, isLoading, refetch } = useAsyncData(
    () => competitionsService.list({ q: debouncedTerm, category, sort: 'startDate', order: 'desc' }),
    [debouncedTerm, category],
  );

  const competitions = useMemo(() => data?.items ?? [], [data]);

  const active = competitions.filter((c) => c.status === 'Active');
  const upcoming = competitions.filter((c) => c.status === 'Upcoming');
  const previous = competitions.filter((c) => c.status === 'Completed');

  const categories = useMemo(
    () => [...new Set(competitions.map((c) => c.category).filter(Boolean))],
    [competitions],
  );

  const winners = previous.flatMap((competition) =>
    (competition.winnerIds ?? []).slice(0, 3).map((id, index) => ({
      key: `${competition.id}-${id}`,
      competition,
      person: employeesById[id] ?? null,
      rank: index + 1,
    })),
  );

  const totalParticipants = competitions.reduce(
    (sum, competition) => sum + (competition.participantIds?.length ?? 0),
    0,
  );
  const totalPrizes = competitions.reduce((sum, competition) => sum + (competition.prizes?.length ?? 0), 0);

  const renderGrid = (items, emptyProps) =>
    items.length ? (
      <div className="grid-auto">
        {items.map((competition, index) => (
          <div key={competition.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
            <CompetitionCard competition={competition} />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState {...emptyProps} />
    );

  return (
    <>
      {/* Search + stats -------------------------------------------------------- */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <div className="grid-auto grid-auto--4">
            <StatTile value={active.length} label="Active competitions" icon="SportsEsports" />
            <StatTile value={upcoming.length} label="Coming soon" icon="Schedule" />
            <StatTile value={totalParticipants} label="Total entries" icon="HowToReg" />
            <StatTile value={totalPrizes} label="Prizes on offer" icon="CardGiftcard" />
          </div>

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search competitions..." />
            <div className="filter-bar__footer">
              <ChipFilters
                options={[
                  { value: ALL, label: 'All categories' },
                  ...categories.map((item) => ({ value: item, label: item })),
                ]}
                value={category}
                onChange={setCategory}
                ariaLabel="Filter competitions by category"
              />
              <span>
                <strong>{competitions.length}</strong> competition(s)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Active competitions ------------------------------------------------ */}
      <section className="section section--tight">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Open now"
            eyebrowIcon="Bolt"
            title="Active competitions"
            subtitle="Enter before the closing date and get your name on the leaderboard."
          />
          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={false}
            onRetry={refetch}
            skeletonCount={3}
          >
            {renderGrid(active, {
              icon: 'SportsEsports',
              title: 'No active competitions',
              message: 'Nothing is running right now. The next challenge will be announced here.',
            })}
          </DataState>
        </div>
      </section>

      {/* 2. Upcoming ----------------------------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Coming soon"
            eyebrowIcon="Schedule"
            title="Upcoming competitions"
            subtitle="Get ready - registration opens on the start date."
          />
          {renderGrid(upcoming, {
            icon: 'Schedule',
            title: 'Nothing scheduled yet',
            message: 'Upcoming competitions will be listed here once dates are confirmed.',
          })}
        </div>
      </section>

      {/* 3-5. Rules, prizes and how to participate ------------------------------ */}
      <section className="section">
        <div className="container-page grid-auto grid-auto--2">
          <div className="u-stack">
            <SectionHeading eyebrow="The basics" eyebrowIcon="Gavel" title="Competition rules" as="h2" />
            <Accordion
              defaultOpenId="general"
              items={[
                {
                  id: 'general',
                  title: 'General rules',
                  content: (
                    <ul className="icon-list">
                      {(active[0]?.rules ?? [
                        'Open to all members of the Data Warehouse Department.',
                        'Individual entries unless the brief states otherwise.',
                        'Submissions must use approved, non-production data only.',
                        "The judging panel's decision is final.",
                      ]).map((rule) => (
                        <li className="icon-list__item" key={rule}>
                          <span className="icon-list__bullet">
                            <Icon name="CheckCircle" fontSize="inherit" />
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: 'eligibility',
                  title: 'Eligibility',
                  content: <p>{active[0]?.eligibility ?? 'All colleagues within the Data Warehouse Department.'}</p>,
                },
                {
                  id: 'judging',
                  title: 'Judging & scoring',
                  content: (
                    <p>
                      PLACEHOLDER - describe how entries are scored, who sits on the panel and when
                      results are published.
                    </p>
                  ),
                },
              ]}
            />

            <SectionHeading eyebrow="Take part" eyebrowIcon="HowToReg" title="How to participate" as="h2" />
            <ol className="icon-list">
              {(active[0]?.howToParticipate ?? [
                'Read the competition brief and the rules in full.',
                'Register your entry using the Participate Now button.',
                'Prepare and submit your entry as a zip file before the closing date.',
                'Attend the results session to see the winners.',
              ]).map((step, index) => (
                <li className="icon-list__item" key={step}>
                  <span className="icon-list__bullet">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="u-stack">
            <SectionHeading eyebrow="What you can win" eyebrowIcon="CardGiftcard" title="Prizes" as="h2" />
            <div className="u-stack u-stack--sm">
              {(active[0]?.prizes ?? []).map((prize) => (
                <article className="card" key={prize.rank}>
                  <div className="card__body">
                    <div className="u-cluster u-cluster--sm">
                      <span className={`rank-medal ${prize.rank <= 3 ? `rank-medal--${prize.rank}` : ''}`.trim()}>
                        {prize.rank}
                      </span>
                      <h3 className="card__title">{prize.title}</h3>
                    </div>
                    <p className="card__text">{prize.description}</p>
                  </div>
                </article>
              ))}
              {!active[0]?.prizes?.length ? (
                <EmptyState
                  icon="CardGiftcard"
                  title="Prizes to be announced"
                  message="Prize details are added to each competition when it opens."
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Previous competitions ---------------------------------------------- */}
      <section className="section section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Archive"
            eyebrowIcon="Timeline"
            title="Previous competitions"
            subtitle="Everything we have run before, with the final results."
          />
          {renderGrid(previous, {
            icon: 'Timeline',
            title: 'No completed competitions yet',
            message: 'Past competitions will be archived here once they close.',
          })}
        </div>
      </section>

      {/* 7. Winners ------------------------------------------------------------- */}
      <section className="section">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Hall of fame"
            eyebrowIcon="EmojiEvents"
            title="Past winners"
            subtitle="Congratulations to everyone who took the top three places."
          />
          {winners.length ? (
            <div className="grid-auto grid-auto--4">
              {winners.map((winner) => (
                <article className="achievement-card" key={winner.key}>
                  <span className={`rank-medal ${winner.rank <= 3 ? `rank-medal--${winner.rank}` : ''}`.trim()}>
                    {winner.rank}
                  </span>
                  {winner.person ? (
                    <>
                      <Avatar name={winner.person.fullName} src={winner.person.photo} size="lg" ringGold />
                      <h3 className="achievement-card__title">
                        <Link href={ROUTES.employee(winner.person.id)}>{winner.person.fullName}</Link>
                      </h3>
                      <p className="u-text-xs u-subtle">{winner.person.jobTitle}</p>
                    </>
                  ) : (
                    <h3 className="achievement-card__title">PLACEHOLDER - winner</h3>
                  )}
                  <Badge tone="gold">{winner.competition.name}</Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="EmojiEvents"
              title="No winners announced yet"
              message="Winners appear here as soon as a competition is completed."
            />
          )}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container-page">
          <div className="cta-band">
            <div className="cta-band__content">
              <Badge tone="on-dark" icon="TipsAndUpdates">
                Have an idea?
              </Badge>
              <h2>Suggest the next challenge</h2>
              <p className="hero__lead">
                Competitions work best when they come from the teams. Tell us what you would like to
                see next.
              </p>
            </div>
            <div className="cta-band__actions">
              <Button href={ROUTES.contact} variant="gold" size="lg" icon="Publish">
                Suggest a competition
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CompetitionsBoard;
