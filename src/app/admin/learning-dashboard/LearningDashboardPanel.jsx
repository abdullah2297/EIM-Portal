'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  trainingCategoriesService,
  trainingRegistrationsService,
  trainingsService,
  trainingTypesService,
} from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { DataState } from '@/components/ui/StateViews';
import { StatTile } from '@/components/ui/StatTile';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { ACTIVE_REGISTRATION_STATUS, DATE_FORMAT } from '@/lib/constants';

const SERIES_CLASSES = ['viz-series-1', 'viz-series-2', 'viz-series-3', 'viz-series-4'];
const UPCOMING_STATUSES = ['Published', 'Registration Open'];
const MONTH_FORMAT = new Intl.DateTimeFormat('en-GB', DATE_FORMAT.monthYear);

/** Admin-only L&D dashboard: KPI tiles, a highlight card, and 4 charts. */
export function LearningDashboardPanel() {
  const { data, error, isLoading, refetch } = useAsyncData(
    () =>
      Promise.all([
        trainingsService.list({ pageSize: 200 }),
        trainingCategoriesService.list({ pageSize: 200 }),
        trainingTypesService.list({ pageSize: 200 }),
        trainingRegistrationsService.list({ pageSize: 200 }),
      ]),
    [],
  );

  const stats = useMemo(() => {
    const [trainingsRes, categoriesRes, typesRes, registrationsRes] = data ?? [];
    const trainings = trainingsRes?.items ?? [];
    const categories = categoriesRes?.items ?? [];
    const types = typesRes?.items ?? [];
    const registrations = registrationsRes?.items ?? [];

    const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));

    const activeRegistrationsFor = (trainingId) =>
      registrations.filter((r) => r.trainingId === trainingId && ACTIVE_REGISTRATION_STATUS.includes(r.status));

    // KPI tiles
    const totalTraining = trainings.length;
    const upcomingTraining = trainings.filter((t) => UPCOMING_STATUSES.includes(t.status)).length;
    const activeTraining = trainings.filter((t) => t.status === 'Ongoing').length;
    const completedTraining = trainings.filter((t) => t.status === 'Completed').length;
    const totalParticipants = registrations.filter((r) => ACTIVE_REGISTRATION_STATUS.includes(r.status)).length;
    const totalCompletedRegistrations = registrations.filter((r) => r.status === 'Completed').length;

    const capacityTrainings = trainings.filter((t) => t.enableCapacity && Number(t.maxParticipants) > 0);
    const avgParticipationRate = capacityTrainings.length
      ? Math.round(
          (capacityTrainings.reduce(
            (sum, t) => sum + activeRegistrationsFor(t.id).length / Number(t.maxParticipants),
            0,
          ) /
            capacityTrainings.length) *
            100,
        )
      : 0;

    // Most popular training
    const byPopularity = trainings
      .map((t) => ({ training: t, count: activeRegistrationsFor(t.id).length }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
    const mostPopular = byPopularity[0] ?? null;

    // Participation over time - registrations per month, chronological
    const byMonth = new Map();
    registrations.forEach((r) => {
      if (!r.createdAt) return;
      const date = new Date(r.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    });
    const participationOverTime = [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        return { month: MONTH_FORMAT.format(new Date(year, month - 1, 1)), count };
      });

    // Trainings by type
    const trainingsByType = types
      .map((type) => ({
        name: type.name,
        count: trainings.filter((t) => categoriesById[t.categoryId]?.trainingTypeId === type.id).length,
      }))
      .filter((row) => row.count > 0);

    // Participants by category
    const participantsByCategory = categories
      .map((category) => ({
        name: category.name,
        count: trainings
          .filter((t) => t.categoryId === category.id)
          .reduce((sum, t) => sum + activeRegistrationsFor(t.id).length, 0),
      }))
      .filter((row) => row.count > 0);

    // Attendance vs No Show
    const attendanceVsNoShow = [
      { name: 'Attended', count: registrations.filter((r) => r.status === 'Attended').length, cls: 'viz-good' },
      { name: 'No Show', count: registrations.filter((r) => r.status === 'No Show').length, cls: 'viz-critical' },
    ];

    return {
      totalTraining,
      upcomingTraining,
      activeTraining,
      completedTraining,
      totalParticipants,
      totalCompletedRegistrations,
      avgParticipationRate,
      mostPopular,
      participationOverTime,
      trainingsByType,
      participantsByCategory,
      attendanceVsNoShow,
    };
  }, [data]);

  return (
    <DataState isLoading={isLoading} error={error} onRetry={refetch} skeletonCount={4} skeletonClassName="admin-stats">
      <div className="admin-stats">
        <StatTile value={stats.totalTraining} label="Total training" icon="MenuBook" />
        <StatTile value={stats.upcomingTraining} label="Upcoming training" icon="Schedule" />
        <StatTile value={stats.activeTraining} label="Active training" icon="Bolt" />
        <StatTile value={stats.completedTraining} label="Completed training" icon="CheckCircle" />
        <StatTile value={stats.totalParticipants} label="Total participants" icon="HowToReg" />
        <StatTile value={stats.totalCompletedRegistrations} label="Total completions" icon="EmojiEvents" />
        <StatTile value={stats.avgParticipationRate} suffix="%" label="Avg. participation rate" icon="Insights" />
      </div>

      <div className="viz-card u-cluster mb-6">
        <span className="team-card__icon">
          <Icon name="Star" fontSize="medium" />
        </span>
        <span className="u-stack u-stack--sm">
          <strong>Most popular training</strong>
          <span className="u-text-sm u-muted">
            {stats.mostPopular
              ? `${stats.mostPopular.training.name} - ${stats.mostPopular.count} participant(s)`
              : 'No registrations yet.'}
          </span>
        </span>
      </div>

      <div className="grid-auto grid-auto--2">
        <div className="viz-card">
          <SectionHeading eyebrow="Trend" eyebrowIcon="Timeline" title="Participation over time" as="h3" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.participationOverTime}>
              <CartesianGrid className="viz-grid" vertical={false} />
              <XAxis dataKey="month" className="viz-axis" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} className="viz-axis" tickLine={false} axisLine={false} width={28} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Registrations" className="viz-line-1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="viz-card">
          <SectionHeading eyebrow="Breakdown" eyebrowIcon="School" title="Trainings by type" as="h3" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.trainingsByType}>
              <CartesianGrid className="viz-grid" vertical={false} />
              <XAxis dataKey="name" className="viz-axis" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} className="viz-axis" tickLine={false} axisLine={false} width={28} />
              <Tooltip />
              <Bar dataKey="count" name="Trainings" radius={[4, 4, 0, 0]}>
                {stats.trainingsByType.map((row, index) => (
                  <Cell key={row.name} className={SERIES_CLASSES[index % SERIES_CLASSES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="viz-card">
          <SectionHeading eyebrow="Breakdown" eyebrowIcon="Category" title="Participants by category" as="h3" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.participantsByCategory}>
              <CartesianGrid className="viz-grid" vertical={false} />
              <XAxis dataKey="name" className="viz-axis" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} className="viz-axis" tickLine={false} axisLine={false} width={28} />
              <Tooltip />
              <Bar dataKey="count" name="Participants" radius={[4, 4, 0, 0]}>
                {stats.participantsByCategory.map((row, index) => (
                  <Cell key={row.name} className={SERIES_CLASSES[index % SERIES_CLASSES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="viz-card">
          <SectionHeading eyebrow="Outcome" eyebrowIcon="HowToReg" title="Attendance vs. No Show" as="h3" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.attendanceVsNoShow} layout="vertical">
              <CartesianGrid className="viz-grid" horizontal={false} />
              <XAxis type="number" allowDecimals={false} className="viz-axis" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" className="viz-axis" tickLine={false} axisLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Registrations" radius={[0, 4, 4, 0]}>
                {stats.attendanceVsNoShow.map((row) => (
                  <Cell key={row.name} className={row.cls} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DataState>
  );
}

export default LearningDashboardPanel;
