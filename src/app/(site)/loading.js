import { LoadingState } from '@/components/ui/StateViews';

/** Shown while a server-rendered public page is streaming in. */
export default function SiteLoading() {
  return (
    <div className="section container-page">
      <LoadingState label="Loading the portal..." />
    </div>
  );
}
