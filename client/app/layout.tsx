import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Taskboard',
  description: 'Taskboard phase 0 skeleton'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <div className="flex min-h-screen items-center justify-center px-6 py-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
