'use client';

import Link from 'next/link';
import { statsService, submissionsService } from '@/services';
import { useAsyncData } from '@/hooks/useAsyncData';
import { ADMIN_SCHEMAS } from '@/lib/adminSchemas';
import { DataState, EmptyState } from '@/components/ui/StateViews';
import { Icon } from '@/components/ui/Icon';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

/** Admin landing page: content counts, quick actions and the latest submissions. */
export function AdminDashboard() {
  const { data, error, isLoading, refetch } = useAsyncData(() => statsService.get(), []);
  const { data: inbox } = useAsyncData(
    () => submissionsService.list({ sort: 'createdAt', order: 'desc', limit: 6 }),
    [],
  );

  const counts = data?.counts ?? {};
  const submissions = inbox?.items ?? [];

  const tiles = [
    { key: 'employees', resource: 'employees', label: 'Employees' },
    { key: 'teams', resource: 'teams', label: 'Teams' },
    { key: 'subTeams', resource: 'sub-teams', label: 'Sub-teams' },
    { key: 'initiatives', resource: 'initiatives', label: 'Initiatives' },
    { key: 'achievements', resource: 'achievements', label: 'Achievements' },
    { key: 'announcements', resource: 'announcements', label: 'Announcements' },
    { key: 'successStories', resource: 'success-stories', label: 'Success stories' },
    { key: 'competitions', resource: 'competitions', label: 'Competitions' },
    { key: 'gallery', resource: 'gallery', label: 'Gallery items' },
    { key: 'recognition', resource: 'recognition', label: 'Recognitions' },
  ];

  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">Content overview</h2>
          <p className="u-text-sm u-muted">
            Everything on the public portal is managed from here. Counts update as soon as you save.
          </p>
        </div>
        <div className="u-cluster u-cluster--sm">
          <Button href={ROUTES.home} variant="outline" icon="OpenInNew">
            View the portal
          </Button>
          <Button href={ROUTES.adminResourceNew('announcements')} icon="Add">
            New announcement
          </Button>
        </div>
      </div>

      <div className="form-alert form-alert--info mb-6">
        <Icon name="InfoOutlined" />
        <span>
          This portal is currently populated with clearly-marked <strong>sample data</strong>. Replace
          it with the department's real content from the sections in the sidebar.
        </span>
      </div>

      <DataState isLoading={isLoading} error={error} onRetry={refetch} skeletonCount={5} skeletonClassName="admin-stats">
        <div className="admin-stats">
          {tiles.map((tile) => (
            <Link key={tile.key} href={ROUTES.adminResource(tile.resource)} className="admin-stat">
              <strong>{counts[tile.key] ?? 0}</strong>
              <span>{tile.label}</span>
            </Link>
          ))}
        </div>
      </DataState>

      <div className="grid-auto grid-auto--2">
        <section className="detail-panel">
          <h2 className="detail-panel__title">
            <Icon name="Inbox" />
            Latest submissions
            {counts.newSubmissions ? <Badge tone="danger">{counts.newSubmissions} new</Badge> : null}
          </h2>

          {submissions.length ? (
            <div className="u-stack u-stack--sm">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={ROUTES.adminResourceEdit('submissions', submission.id)}
                  className="card card--flat"
                >
                  <div className="card__body">
                    <div className="u-cluster u-cluster--sm">
                      <Badge tone="primary">{submission.type}</Badge>
                      <StatusBadge status={submission.status} />
                      <span className="u-text-xs u-subtle">{formatDate(submission.createdAt, 'short')}</span>
                    </div>
                    <strong className="u-text-sm">{submission.subject}</strong>
                    <p className="card__text">{submission.message}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Inbox"
              title="The inbox is empty"
              message="Ideas, stories and competition entries submitted from the portal land here."
            />
          )}
        </section>

        <section className="detail-panel">
          <h2 className="detail-panel__title">
            <Icon name="Bolt" />
            Quick actions
          </h2>
          <div className="u-stack u-stack--sm">
            {Object.entries(ADMIN_SCHEMAS)
              .filter(([, schema]) => !schema.readOnlyCreate)
              .map(([resource, schema]) => (
                <Link key={resource} href={ROUTES.adminResourceNew(resource)} className="nav-drawer__link">
                  <Icon name={schema.icon} />
                  New {schema.label.toLowerCase()}
                </Link>
              ))}
            <Link href="/admin/department" className="nav-drawer__link">
              <Icon name="AccountBalance" />
              Edit the department profile
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
