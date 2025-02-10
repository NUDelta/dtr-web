import type { Metadata } from 'next';
import Container from '@/components/shared/Container';
import Header from '@/components/shared/Header';
import PopupAnnouncement from '@/components/shared/PopupAnnouncement';
import RouterTransition from '@/components/shared/RouterTransition';
import { Lato } from 'next/font/google';

import './globals.css';

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dtr.northwestern.edu/'),
  title: 'Design, Technology, and Research',
  description:
    'DTR is a community of designers, builders, and researchers shaping new experiences with technology. We collaborate, innovate, and advance research together.',
  keywords: [
    'design',
    'technology',
    'research',
    'northwestern',
    'university',
    'dtr',
    'design technology research',
  ],
  alternates: { canonical: 'https://dtr.northwestern.edu/' },
  verification: {
    google: '14ltX0knmJHA_JnO3Z428TX8YioIFSWFy1yABn_Qh10',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lato.variable} bg-white pb-8`}>
        <RouterTransition />
        <PopupAnnouncement />
        <Header />
        <main className="pt-[4rem]">
          <Container className="mt-8">
            {children}
          </Container>
        </main>
      </body>
    </html>
  );
}
