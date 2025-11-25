import fs from "fs/promises";
import path from "path";
import { MDXRemote } from "next-mdx-remote/rsc";

export default async function LLMPage() {
    const mdPath = path.join(process.cwd(), "../docs/llm-integration.md");
    const content = await fs.readFile(mdPath, "utf-8");

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            <MDXRemote source={content} />
        </div>
    );
}
