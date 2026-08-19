import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/** Chrome shared by every public page: skip link, sticky header, footer. */
export default function SiteLayout({ children }) {
  return (
    <>
      <a href="#main-content" className="u-sr-only">
        Skip to main content
      </a>
      <div className="app-shell">
        <Header />
        <main className="app-main" id="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
