export default function ConfigPage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Configuration</h1>
            <p className="lead">
                Configure your Compose project, LLM integration, and build targets.
            </p>

            <div className="not-prose grid gap-4 mt-8">
                <a href="/docs/config/compose-json" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">compose.json</h3>
                    <p className="text-sm text-muted-foreground">
                        Complete reference for the compose.json configuration file
                    </p>
                </a>

                <a href="/docs/config/llm" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">LLM Integration</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure and integrate with Gemini, GPT-4, and Claude
                    </p>
                </a>

                <a href="/docs/config/imports" className="block rounded-lg border border-border p-4 hover:bg-muted">
                    <h3 className="font-semibold mb-1">Imports & Entry Points</h3>
                    <p className="text-sm text-muted-foreground">
                        Understanding module imports and entry point configuration
                    </p>
                </a>
            </div>
        </div>
    );
}
