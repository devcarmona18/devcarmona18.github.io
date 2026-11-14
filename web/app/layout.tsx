import type { Metadata, Viewport } from 'next';
import './globals.css';

const url = 'https://devcarmona18.github.io';
const title = 'Michael Carmona — Full Stack Developer con IA';
const description =
  'Portafolio de Michael Carmona, desarrollador full stack con IA en Palmira, Colombia. Convierto procesos manuales en sistemas que trabajan solos: aplicaciones web, APIs, bases de datos y automatización.';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url,
    title,
    description,
    siteName: 'Michael Carmona',
    images: [{ url: `${url}/og.png`, width: 1200, height: 630, alt: 'Código que resuelve. — Michael Carmona' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [`${url}/og.png`] },
};

export const viewport: Viewport = { themeColor: '#F4F2EE', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
