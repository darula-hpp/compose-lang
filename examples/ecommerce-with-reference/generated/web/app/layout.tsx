import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'my shop',
  description: 'A modern e-commerce shop built with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CartProvider>
            <Navbar />
            <main className="container mx-auto p-4 min-h-[calc(100vh-64px)]">
              {children}
            </main>
            {/* Optional: Add a footer here */}
            <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 text-gray-600 dark:text-gray-400 mt-8">
              &copy; {new Date().getFullYear()} my shop. All rights reserved.
            </footer>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
