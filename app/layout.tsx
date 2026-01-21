import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Political Risk Framework | Leadership Now',
  description: 'Track and assess political risk across 10 key categories in the United States',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-cream dark:bg-navy min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-navy/95 backdrop-blur-sm shadow-ln-medium sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/logo-white.png"
                    alt="Leadership Now Project"
                    width={180}
                    height={40}
                    className="h-10 w-auto"
                    priority
                  />
                </Link>
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    href="/"
                    className="text-white hover:text-gold transition-colors text-sm font-medium px-4 py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/history"
                    className="text-white hover:text-gold transition-colors text-sm font-medium px-4 py-2"
                  >
                    Historical View
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gold-light uppercase tracking-wider hidden sm:inline">
                  US Political Risk Assessment
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-navy border-t border-navy-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-white.png"
                  alt="Leadership Now Project"
                  width={150}
                  height={34}
                  className="h-8 w-auto"
                />
              </div>
              <div className="text-center md:text-right">
                <p className="text-cream/80 text-sm">
                  US Political Risk Framework Assessment
                </p>
                <p className="text-cream/60 text-xs mt-1">
                  Data updated regularly. Risk assessments are for informational purposes only.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
