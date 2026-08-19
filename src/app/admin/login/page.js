import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/StateViews';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

/** `/admin/login` - credential sign-in for the admin panel. */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Preparing sign in..." />}>
      <LoginForm />
    </Suspense>
  );
}
