import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Discogs Music Collection Valuator | Discogs',
  description: 'Calculate real-time realistic values of your Vinyl, CD, and Cassette collection using Discogs database & Goldmine condition adjustments.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23222" stroke="%230275d8" stroke-width="4"/><circle cx="50" cy="50" r="36" fill="none" stroke="%23666" stroke-width="2"/><circle cx="50" cy="50" r="24" fill="none" stroke="%23666" stroke-width="2"/><circle cx="50" cy="50" r="14" fill="%230275d8"/><circle cx="50" cy="50" r="4" fill="%23222"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f4f4f6] dark:bg-[#121212] text-[#333333] dark:text-[#f0f0f0] font-sans antialiased text-[14px] min-h-screen transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
