"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, Sparkles, Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.svg"
              alt="Compose Logo"
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Compose
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/darula-hpp/compose-lang"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary flex items-center gap-1.5"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <Link href="/docs" className="text-sm font-medium hover:text-primary">
              Docs
            </Link>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 hover:bg-muted"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm">
              <Sparkles className="size-4" />
              <span>AI-Powered Development</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              LLM-Aware
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Build System
              </span>
            </h1>

            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Version-controlled architecture specs that compile to production code via LLM.
              Reproducible builds, dependency tracking, and export-aware code generation.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/docs/language"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold transition-colors hover:bg-muted"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Compose?</h2>
            <p className="text-lg text-muted-foreground">
              A revolutionary approach to software development
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Code2 className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Structured DSL</h3>
              <p className="text-muted-foreground">
                Three keywords (model, feature, guide) for defining architecture specs
              </p>
            </div>

            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Reproducible Builds</h3>
              <p className="text-muted-foreground">
                LLM caching and export maps ensure consistent, incremental code generation
              </p>
            </div>

            <div className="rounded-lg border border-border p-6">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Zap className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Multi-Target</h3>
              <p className="text-muted-foreground">
                Generate code for Next.js, Express, Flutter, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple & Intuitive</h2>
            <p className="text-lg text-muted-foreground">
              See how easy it is to define your application
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-muted px-4 py-2">
              <span className="text-sm text-muted-foreground">app.compose</span>
            </div>
            <div className="bg-[#0F172A] p-6">
              <pre className="text-sm"><code className="text-gray-300">{`model User:
  name: text
  email: text (unique)
  role: "admin" | "customer"
  
feature UserManagement:
  - Create new users with email/password
  - Users can update their profiles
  - Admin can manage user roles
  
guide Authentication:
  - Use JWT for authentication
  - Hash passwords with bcrypt
  - Sessions expire after 24 hours`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
