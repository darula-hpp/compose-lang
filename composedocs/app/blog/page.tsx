import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export default async function BlogPage() {
    const posts = await getAllPosts();

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Compose
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/docs" className="text-sm font-medium hover:text-primary">
                            Docs
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-primary">
                            Blog
                        </Link>
                    </div>
                </div>
            </header>

            {/* Blog Content */}
            <section className="px-6 py-16 md:py-24">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12">
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Blog</h1>
                        <p className="text-lg text-muted-foreground">
                            Thoughts on AI-native development, LLM-assisted compilation, and building the future of software.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="block rounded-lg border border-border p-6 transition-colors hover:bg-muted"
                            >
                                <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
                                    <time dateTime={post.date}>
                                        {new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                    <span>•</span>
                                    <span>{post.author}</span>
                                </div>
                                <h2 className="mb-2 text-2xl font-bold">{post.title}</h2>
                                <p className="mb-4 text-muted-foreground">{post.excerpt}</p>
                                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                    Read more
                                    <ArrowRight className="size-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
