import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getDepartment } from '@/lib/dataAccess';

// Reads the department profile (and its logo) on every request so an admin
// upload appears in the header/footer immediately.
export const dynamic = 'force-dynamic';

/** Chrome shared by every public page: skip link, sticky header, footer. */
export default async function SiteLayout({ children }) {
  const department = await getDepartment();

  return (
    <>
      <a href="#main-content" className="u-sr-only">
        Skip to main content
      </a>
      <div className="app-shell">
        <Header logo={department?.logo} />
        <main className="app-main" id="main-content">
          {children}
        </main>
        <Footer logo={department?.logo} />
      </div>
    </>
  );
}
