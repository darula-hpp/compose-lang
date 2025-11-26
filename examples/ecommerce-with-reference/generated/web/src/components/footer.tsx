export default function Footer() {
  return (
    <footer className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark py-6 mt-10 shadow-inner">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Next.js E-commerce. All rights reserved.</p>
        <p className="mt-2">
          Built with ❤️ by an expert Next.js developer.
        </p>
      </div>
    </footer>
  );
}
