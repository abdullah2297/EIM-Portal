import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentEmployee, getDepartment, getLdNavData } from '@/lib/dataAccess';

// Reads the department profile (and its logo) on every request so an admin
// upload appears in the header/footer immediately.
export const dynamic = 'force-dynamic';

/** Chrome shared by every public page: skip link, sticky header, footer. */
export default async function SiteLayout({ children }) {
  const [department, ldNav, me] = await Promise.all([
    getDepartment(),
    getLdNavData(),
    getCurrentEmployee(),
  ]);

  return (
    <>
      <a href="#main-content" className="u-sr-only">
        Skip to main content
      </a>
      <div className="app-shell">
        <Header logo={department?.logo} ldNav={ldNav} me={me} />
        <main className="app-main" id="main-content">
          {children}
        </main>
        <Footer logo={department?.logo} />
      </div>
    </>
  );
}
