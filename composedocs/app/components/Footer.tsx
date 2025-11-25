import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* About */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Compose</h3>
                        <p className="text-sm text-muted-foreground">
                            English-based programming language for LLM-assisted code generation.
                        </p>
                    </div>

                    {/* Documentation */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Documentation</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                                    Getting Started
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs/language" className="text-muted-foreground hover:text-foreground">
                                    Language Reference
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs/config" className="text-muted-foreground hover:text-foreground">
                                    Configuration
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://github.com/darula-hpp/compose-lang"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://marketplace.visualstudio.com/items?itemName=OlebogengMbedzi.compose-lang"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    VS Code Extension
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold">Community</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://github.com/darula-hpp/compose-lang/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Issues
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/darula-hpp/compose-lang/discussions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Discussions
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>© {currentYear} Compose Language. Open source under MIT License.</p>
                </div>
            </div>
        </footer>
    );
}
