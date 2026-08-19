'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { employeesService, recognitionService, teamsService, achievementsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ChipFilters, SearchInput } from '@/components/ui/Fields';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { Timeline } from '@/components/ui/Timeline';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { RecognitionCard } from '@/components/cards/RecognitionCard';
import { AchievementCard } from '@/components/cards/AchievementCard';
import { RECOGNITION_TYPES, ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const ALL = 'all';

/**
 * Recognition wall: employee and team of the quarter, recent appreciation
 * messages, awards and the full recognition history.
 */
export function RecognitionWall() {
  const [term, setTerm] = useState('');
  const [type, setType] = useState(ALL);
  const debouncedTerm = useDebouncedValue(term, 250);

  const { data: reference } = useAsyncData(async () => {
    const [teams, employees, achievements] = await Promise.all([
      teamsService.list({ sort: 'order', order: 'asc' }),
      employeesService.list(),
      achievementsService.list({ category: 'Award', limit: 6 }),
    ]);
    return { teams: teams.items, employees: employees.items, awards: achievements.items };
  }, []);

  const teams = useMemo(() => reference?.teams ?? [], [reference]);
  const employees = useMemo(() => reference?.employees ?? [], [reference]);
  const awards = useMemo(() => reference?.awards ?? [], [reference]);
  const teamsById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);
  const employeesById = useMemo(() => Object.fromEntries(employees.map((e) => [e.id, e])), [employees]);

  const { data, error, isLoading, refetch } = useAsyncData(
    () => recognitionService.list({ q: debouncedTerm, type, sort: 'date', order: 'desc' }),
    [debouncedTerm, type],
  );

  const items = useMemo(() => data?.items ?? [], [data]);

  const { data: allData } = useAsyncData(
    () => recognitionService.list({ sort: 'date', order: 'desc' }),
    [],
  );
  const all = useMemo(() => allData?.items ?? [], [allData]);

  const employeeOfQuarter = all.find((r) => r.type === 'Employee of the Quarter' && r.featured);
  const teamOfQuarter = all.find((r) => r.type === 'Team of the Quarter' && r.featured);
  const appreciation = items.filter((r) => r.type === 'Appreciation');

  const historyItems = all
    .filter((r) => r.type === 'Employee of the Quarter' || r.type === 'Team of the Quarter')
    .map((r) => ({
      id: r.id,
      date: r.date,
      title: r.title,
      description: r.message,
      tone: 'gold',
      meta: (
        <span className="u-cluster u-cluster--sm">
          {r.toEmployeeId && employeesById[r.toEmployeeId] ? (
            <Link href={ROUTES.employee(r.toEmployeeId)} className="u-cluster u-cluster--sm">
              <Avatar name={employeesById[r.toEmployeeId].fullName} size="xs" />
              <span className="u-text-xs">{employeesById[r.toEmployeeId].fullName}</span>
            </Link>
          ) : null}
          {r.toTeamId && teamsById[r.toTeamId] ? (
            <Badge tone="primary">{teamsById[r.toTeamId].name}</Badge>
          ) : null}
        </span>
      ),
    }));

  const winner = employeeOfQuarter ? employeesById[employeeOfQuarter.toEmployeeId] : null;
  const winningTeam = teamOfQuarter ? teamsById[teamOfQuarter.toTeamId] : null;

  return (
    <>
      {/* 1 + 2. Employee and team of the quarter -------------------------------- */}
      <section className="section section--tight">
        <div className="container-page grid-auto grid-auto--2">
          <div className="spotlight">
            <div className="spotlight__media">
              {winner ? (
                <Avatar name={winner.fullName} src={winner.photo} size="xl" ringGold />
              ) : (
                <span className="avatar avatar--xl">
                  <Icon name="Person" fontSize="large" />
                </span>
              )}
            </div>
            <div className="spotlight__content">
              <Badge tone="gold" icon="EmojiEvents">
                Employee of the Quarter
              </Badge>
              <h2>{winner ? winner.fullName : 'PLACEHOLDER - to be announced'}</h2>
              <p className="hero__lead">{winner?.jobTitle ?? ''}</p>
              <p className="hero__lead">{employeeOfQuarter?.message}</p>
              {winner ? (
                <Button href={ROUTES.employee(winner.id)} variant="on-dark" icon="Person">
                  View profile
                </Button>
              ) : null}
            </div>
          </div>

          <div className="spotlight">
            <div className="spotlight__media">
              <span className="avatar avatar--xl">
                <Icon name="Groups" fontSize="large" />
              </span>
            </div>
            <div className="spotlight__content">
              <Badge tone="gold" icon="Groups">
                Team of the Quarter
              </Badge>
              <h2>{winningTeam ? winningTeam.name : 'PLACEHOLDER - to be announced'}</h2>
              <p className="hero__lead">{teamOfQuarter?.message}</p>
              {winningTeam ? (
                <Button href={`${ROUTES.teams}?team=${winningTeam.id}`} variant="on-dark" icon="AccountTree">
                  View team
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 3 + 4. Recent recognitions and appreciation messages -------------------- */}
      <section className="section section--muted">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Thank you"
            eyebrowIcon="Celebration"
            title="Recent recognitions"
            subtitle="Appreciation shared between colleagues across the department."
            action={
              <Button href={ROUTES.contact} variant="primary" icon="Favorite">
                Recognise a colleague
              </Button>
            }
          />

          <div className="filter-bar">
            <SearchInput value={term} onChange={setTerm} placeholder="Search recognitions..." />
            <div className="filter-bar__footer">
              <ChipFilters
                options={[
                  { value: ALL, label: 'All types' },
                  ...RECOGNITION_TYPES.map((item) => ({ value: item, label: item })),
                ]}
                value={type}
                onChange={setType}
                ariaLabel="Filter recognitions by type"
              />
              <span>
                <strong>{items.length}</strong> recognition(s)
              </span>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={items.length === 0}
            onRetry={refetch}
            skeletonCount={6}
            emptyProps={{
              icon: 'Celebration',
              title: 'No recognitions yet',
              message: 'Be the first to say thank you to a colleague.',
              actionLabel: 'Recognise a colleague',
              actionHref: ROUTES.contact,
            }}
          >
            <div className="grid-auto">
              {items.map((recognition, index) => (
                <div key={recognition.id} className={`u-anim-in u-delay-${(index % 9) + 1}`}>
                  <RecognitionCard
                    recognition={recognition}
                    from={employeesById[recognition.fromEmployeeId]}
                    to={employeesById[recognition.toEmployeeId]}
                    teamName={teamsById[recognition.toTeamId]?.name}
                  />
                </div>
              ))}
            </div>
          </DataState>
        </div>
      </section>

      {/* Appreciation quotes ----------------------------------------------------- */}
      {appreciation.length ? (
        <section className="section">
          <div className="container-page u-stack u-stack--lg">
            <SectionHeading
              eyebrow="In their words"
              eyebrowIcon="Favorite"
              title="Appreciation messages"
              subtitle="Straight from the colleagues who wrote them."
            />
            <div className="grid-auto">
              {appreciation.slice(0, 6).map((recognition) => (
                <blockquote className="quote-block" key={`quote-${recognition.id}`}>
                  {recognition.message}
                  <footer className="u-cluster u-cluster--sm mt-3">
                    <Icon name="Person" fontSize="inherit" />
                    <span className="u-text-xs u-subtle">
                      {employeesById[recognition.fromEmployeeId]?.fullName ?? 'PLACEHOLDER'} -{' '}
                      {formatDate(recognition.date, 'short')}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. Awards ---------------------------------------------------------------- */}
      <section className="section section--fade">
        <div className="container-page u-stack u-stack--lg">
          <SectionHeading
            eyebrow="Formal recognition"
            eyebrowIcon="MilitaryTech"
            title="Awards"
            subtitle="Department and group awards earned by our teams."
            action={<Button href={ROUTES.achievements} variant="outline" iconAfter="ArrowForward">All achievements</Button>}
          />
          {awards.length ? (
            <div className="grid-auto">
              {awards.map((award) => (
                <AchievementCard
                  key={award.id}
                  achievement={award}
                  teamName={teamsById[award.teamId]?.shortName}
                  people={(award.employeeIds ?? []).map((id) => employeesById[id]).filter(Boolean)}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="MilitaryTech" title="No awards yet" message="Awards will be celebrated here." />
          )}
        </div>
      </section>

      {/* 6. Recognition history ---------------------------------------------------- */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            eyebrow="History"
            eyebrowIcon="Timeline"
            title="Recognition history"
            subtitle="Every employee and team of the quarter, most recent first."
          />
          {historyItems.length ? (
            <div className="card">
              <div className="card__body">
                <Timeline items={historyItems} />
              </div>
            </div>
          ) : (
            <EmptyState icon="Timeline" title="No history yet" message="Quarterly recognition will build up here." />
          )}
        </div>
      </section>
    </>
  );
}

export default RecognitionWall;
