'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing on the server to avoid hydration mismatch
  }

  return (
    <header className="bg-card-light dark:bg-card-dark shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-primary-DEFAULT dark:text-primary-dark hover:text-primary-dark dark:hover:text-primary-DEFAULT transition-colors duration-200">
          NextShop
        </Link>

        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-text-light dark:text-text-dark hover:text-primary-DEFAULT dark:hover:text-primary-dark transition-colors duration-200">
            Products
          </Link>
          <Link href="/cart" className="relative text-text-light dark:text-text-dark hover:text-primary-DEFAULT dark:hover:text-primary-dark transition-colors duration-200">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:focus:ring-primary-dark"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 4a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm14 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-9 9a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4-4a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zM5 7a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm12 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM8 10a2 2 0 114 0 2 2 0 01-4 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
