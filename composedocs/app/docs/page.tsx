import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1>Getting Started with Compose</h1>
            <p className="lead">
                Learn how to install Compose and create your first project in minutes.
            </p>

            <h2>Installation</h2>
            <p>Install the Compose compiler globally using npm:</p>
            <div className="not-prose">
                <pre className="rounded-lg bg-[#0F172A] p-4 text-gray-300"><code>npm install -g compose-lang</code></pre>
            </div>

            <h3>VS Code Extension</h3>
            <p>
                For the best development experience, install the official VS Code extension for syntax highlighting and IntelliSense:
            </p>
            <div className="not-prose">
                <a
                    href="https://marketplace.visualstudio.com/items?itemName=OlebogengMbedzi.compose-lang"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.29 4.1 17.14.29a.99.99 0 0 0-.71-.29.996.996 0 0 0-.7.3l-2.68 2.68L8.54 0 7.5.5v1.79L4.21 0 3.5.79v18.42l.71.71 3.29-2.29V19.5l1.04.5 4.51-2.98 2.68 2.68c.18.18.43.29.7.29.27 0 .52-.11.71-.29l4.15-3.81c.19-.18.31-.43.31-.71V4.8a.989.989 0 0 0-.31-.7zM17 15.5l-4.5-3-4 2.64v-8.28l4 2.64 4.5-3v9z" />
                    </svg>
                    Install VS Code Extension
                </a>
            </div>

            <h2>Quick Start</h2>

            <h3>1. Initialize a new project</h3>
            <div className="not-prose">
                <pre className="rounded-lg bg-[#0F172A] p-4 text-gray-300"><code>{`mkdir my-app
cd my-app
compose init`}</code></pre>
            </div>

            <h3>2. Create your first Compose file</h3>
            <p>Create <code>app.compose</code>:</p>
            <div className="not-prose">
                <pre className="rounded-lg bg-[#0F172A] p-4 text-gray-300"><code>{`model Todo:
  title: text
  completed: bool
  
feature TodoList:
  - Users can create new todos
  - Users can mark todos as complete
  - Users can delete todos
  
guide Styling:
  - Use Tailwind CSS
  - Add smooth animations`}</code></pre>
            </div>

            <h3>3. Build your application</h3>
            <div className="not-prose">
                <pre className="rounded-lg bg-[#0F172A] p-4 text-gray-300"><code>compose build</code></pre>
            </div>
            <p>Your application will be generated in the <code>generated/</code> directory!</p>

            <h2>Next Steps</h2>
            <div className="not-prose grid gap-4 mt-6">
                <Link
                    href="/docs/language"
                    className="block rounded-lg border border-border p-4 hover:bg-muted"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">Learn the Language</h4>
                            <p className="text-sm text-muted-foreground">
                                Understand Compose syntax, models, features, and guides
                            </p>
                        </div>
                        <ArrowRight className="size-5" />
                    </div>
                </Link>

                <Link
                    href="/docs/config"
                    className="block rounded-lg border border-border p-4 hover:bg-muted"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">Configure Your Project</h4>
                            <p className="text-sm text-muted-foreground">
                                Set up compose.json, LLM integration, and targets
                            </p>
                        </div>
                        <ArrowRight className="size-5" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
