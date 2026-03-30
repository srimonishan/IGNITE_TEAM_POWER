import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ResolveHQ — AI-Powered Service Resolution Platform',
  description:
    'The intelligent service platform for the AI agent era. Understand, prioritize, and resolve service requests autonomously across every industry.',
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
