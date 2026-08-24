import { ParticipationPanel } from './ParticipationPanel';

export const metadata = {
  title: 'Participation - Admin',
  robots: { index: false, follow: false },
};

/** `/admin/participation` - every training registration in one searchable, filterable table. */
export default function AdminParticipationPage() {
  return (
    <>
      <div className="admin-page-head">
        <div className="u-stack u-stack--sm">
          <h2 className="u-display">Participation</h2>
          <p className="u-text-sm u-muted">
            Search and filter every training registration, update status inline, and export to CSV.
          </p>
        </div>
      </div>

      <ParticipationPanel />
    </>
  );
}
