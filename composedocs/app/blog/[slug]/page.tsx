import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} - Compose Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

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
                        <Link href="/blog" className="text-sm font-medium hover:text-primary">
                            Blog
                        </Link>
                    </div>
                </div>
            </header>

            {/* Article */}
            <article className="px-6 py-16 md:py-24">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/blog"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Blog
                    </Link>

                    <header className="mb-8">
                        <time className="text-sm text-muted-foreground" dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </time>
                        <h1 className="mt-2 text-4xl font-bold md:text-5xl">{post.title}</h1>
                        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
                    </header>

                    <div
                        className="prose prose-slate dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>
        </div>
    );
}
