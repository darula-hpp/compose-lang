import fs from "fs/promises";
import path from "path";

export default async function SyntaxPage() {
    const mdPath = path.join(process.cwd(), "../SYNTAX.md");
    const content = await fs.readFile(mdPath, "utf-8");

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        </div>
    );
}

function renderMarkdown(md: string): string {
    // Simple markdown to HTML conversion
    return md
        .split("\n")
        .map((line) => {
            // Headers
            if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
            if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
            if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;

            // Code blocks
            if (line.startsWith("```")) {
                const lang = line.slice(3);
                return lang ? `<pre class="not-prose"><code class="language-${lang}">` : `</code></pre>`;
            }

            // Lists
            if (line.trim().startsWith("- ")) return `<li>${line.trim().slice(2)}</li>`;

            // Horizontal rule
            if (line === "---") return `<hr />`;

            // Empty lines
            if (!line.trim()) return "<br />";

            // Regular paragraphs
            return `<p>${line}</p>`;
        })
        .join("\n");
}
