import './globals.scss';
import { Providers } from '@/components/layout/Providers';
import { SITE, STORAGE_KEYS } from '@/lib/constants';

export const metadata = {
  title: {
    default: `${SITE.name} - ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A2A4A' },
    { media: '(prefers-color-scheme: dark)', color: '#08131F' },
  ],
};

/**
 * Applies the saved theme before first paint so dark-mode users never see a
 * flash of the light palette. Runs synchronously, before React hydrates.
 */
const THEME_BOOTSTRAP = `(function(){try{var k='${STORAGE_KEYS.theme}';var s=localStorage.getItem(k);var m=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(m==='dark'){document.documentElement.classList.add('dark');}document.documentElement.dataset.theme=m;}catch(e){}})();`;

/**
 * Root layout: document shell and providers only.
 * The public site chrome lives in `(site)/layout.js`; the admin panel has its
 * own shell in `admin/layout.js`.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
