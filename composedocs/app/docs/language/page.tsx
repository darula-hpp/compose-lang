export default function LanguagePage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Language Reference</h1>
            <p className="lead">
                Learn the Compose language syntax, architecture, and specification.
            </p>

            <div className="not-prose grid gap-4 mt-8">
                <a href="/docs/language/syntax" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">Syntax Overview</h3>
                    <p className="text-sm text-muted-foreground">
                        Complete syntax reference for models, features, and file organization
                    </p>
                </a>

                <a href="/docs/language/architecture" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">Architecture</h3>
                    <p className="text-sm text-muted-foreground">
                        Understanding the compiler architecture and processing pipeline
                    </p>
                </a>

                <a href="/docs/language/tokens" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">Tokens</h3>
                    <p className="text-sm text-muted-foreground">
                        Token types and lexical analysis
                    </p>
                </a>

                <a href="/docs/language/ir-spec" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">IR Specification</h3>
                    <p className="text-sm text-muted-foreground">
                        Intermediate Representation format and structure
                    </p>
                </a>
            </div>
        </div>
    );
}
