import { LearningDashboardPanel } from './LearningDashboardPanel';

export const metadata = {
  title: 'L&D Dashboard - Admin',
  robots: { index: false, follow: false },
};

/** `/admin/learning-dashboard` - KPIs and charts for the Learning & Development module. */
export default function AdminLearningDashboardPage() {
  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">L&amp;D Dashboard</h2>
          <p className="u-text-sm u-muted">
            Training and participation at a glance, calculated live from the portal content.
          </p>
        </div>
      </div>

      <LearningDashboardPanel />
    </>
  );
}
