'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/StateViews';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

/**
 * Route-level error boundary. Any uncaught render or data error inside the app
 * lands here instead of a blank screen.
 */
export default function AppError({ error, reset }) {
  useEffect(() => {
    // Surfaced in the browser console / server log for diagnosis only.
    console.error('[eim-portal]', error);
  }, [error]);

  return (
    <div className="app-shell">
      <main className="app-main section" id="main-content">
        <div className="container-narrow u-stack">
          <ErrorState
            title="Something went wrong"
            message="We hit an unexpected problem loading this page. Trying again usually fixes it."
            onRetry={reset}
          />
          <div className="u-cluster justify-center">
            <Button href={ROUTES.home} variant="outline" icon="Home">
              Back to the home page
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
