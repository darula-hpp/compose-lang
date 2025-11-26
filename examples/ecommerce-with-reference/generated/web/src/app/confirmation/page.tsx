import Button from '@/components/ui/button';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        className="w-24 h-24 text-green-500 mb-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <h1 className="text-4xl font-bold mb-4 text-primary-DEFAULT dark:text-primary-dark">
        Order Confirmed!
      </h1>
      <p className="text-lg mb-8 text-text-light dark:text-text-dark max-w-md">
        Thank you for your purchase. Your order has been successfully placed and a confirmation email has been sent to your inbox.
      </p>
      <Link href="/">
        <Button className="px-8 py-3 text-lg">Continue Shopping</Button>
      </Link>
    </div>
  );
}
