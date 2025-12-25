import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from './AppShell';

export const metadata: Metadata = {
  title: 'Taskboard',
  description: 'Taskboard phase 0 skeleton'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
