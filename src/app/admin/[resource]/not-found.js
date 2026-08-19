import { EmptyState } from '@/components/ui/StateViews';
import { ROUTES } from '@/lib/constants';

/** Shown when an admin URL points at an unknown collection or record. */
export default function AdminResourceNotFound() {
  return (
    <EmptyState
      icon="SearchOff"
      title="Nothing to manage here"
      message="That section or record does not exist. Pick a section from the sidebar to continue."
      actionLabel="Back to the dashboard"
      actionHref={ROUTES.admin}
    />
  );
}
