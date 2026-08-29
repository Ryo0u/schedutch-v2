import type { Metadata } from 'next';
import { Zen_Kaku_Gothic_New, Noto_Sans_JP, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/sonner';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'schedutch',
  description: '予定調整アプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${zenKakuGothicNew.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <Toaster richColors />
            <Header />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
