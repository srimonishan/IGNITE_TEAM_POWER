import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartOps AI - Intelligent Service Platform',
  description:
    'AI-powered multi-domain service request platform with intelligent prioritization and autonomous resolution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#06060f] text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
