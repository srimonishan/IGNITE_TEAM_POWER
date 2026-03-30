import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ResolveHQ — AI-Powered Apartment Service Management',
  description: 'Smart maintenance tracking with AI-powered priority detection, automated resolution, and real-time Kanban dashboard for residential properties.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#09090b] text-zinc-50 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
