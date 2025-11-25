"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, Book, Settings, Zap, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const isDark = localStorage.getItem("theme") === "dark" ||
            (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem("theme", newDarkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", newDarkMode);
    };

    const navigation = [
        { name: "Home", href: "/", icon: Home },
        { name: "Getting Started", href: "/docs", icon: Zap },
        {
            name: "Language",
            href: "/docs/language",
            icon: Book,
            children: [
                { name: "Syntax", href: "/docs/language/syntax" },
                { name: "Architecture", href: "/docs/language/architecture" },
                { name: "Tokens", href: "/docs/language/tokens" },
                { name: "IR Spec", href: "/docs/language/ir-spec" },
            ],
        },
        {
            name: "Configuration",
            href: "/docs/config",
            icon: Settings,
            children: [
                { name: "compose.json", href: "/docs/config/compose-json" },
                { name: "LLM Integration", href: "/docs/config/llm" },
                { name: "Imports", href: "/docs/config/imports" },
            ],
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="mr-4 md:hidden"
                    >
                        {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>

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

                    <div className="ml-auto flex items-center gap-2">
                        <a
                            href="https://github.com/darula-hpp/compose-lang"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 hover:bg-muted"
                            aria-label="View on GitHub"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <button
                            onClick={toggleDarkMode}
                            className="rounded-lg p-2 hover:bg-muted"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? "block" : "hidden"} md:block fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-background overflow-y-auto`}>
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => (
                            <div key={item.name}>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                                >
                                    <item.icon className="size-4" />
                                    {item.name}
                                </Link>
                                {item.children && (
                                    <div className="ml-7 mt-1 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-6 py-8 md:px-12">
                    <div className="mx-auto max-w-4xl">
                        {children}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
