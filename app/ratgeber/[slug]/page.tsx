import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleView, articleMetadata } from '@/components/ArticleView'
import { ARTICLES, getArticle } from '@/lib/wissen'

export const dynamicParams = false

// Articles with their own root-level path are served there; /ratgeber/<slug> redirects (next.config.ts)
export function generateStaticParams() {
  return ARTICLES.filter((a) => !a.path).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<'/ratgeber/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const a = getArticle(slug)
  return a ? articleMetadata(a) : {}
}

export default async function ArticlePage({ params }: PageProps<'/ratgeber/[slug]'>) {
  const { slug } = await params
  const a = getArticle(slug)
  if (!a || a.path) notFound()
  return <ArticleView article={a} />
}
