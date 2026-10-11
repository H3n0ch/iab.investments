import type { FaqItem } from './faq'

// Structured data (schema.org) for the guide template: Article, BreadcrumbList, FAQPage.

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

export function articleLd(a: { title: string; description: string; path: string; modified: string; reviewer?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    inLanguage: 'de-DE',
    mainEntityOfPage: `${APP_URL}${a.path}`,
    dateModified: a.modified,
    author: { '@type': 'Organization', name: 'iab.investments', url: APP_URL },
    publisher: { '@type': 'Organization', name: 'iab.investments', url: APP_URL },
    ...(a.reviewer ? { reviewedBy: { '@type': 'Person', name: a.reviewer } } : {}),
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${APP_URL}${it.path}` })),
  }
}

export function faqLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

/** Serialised for a <script type="application/ld+json"> tag, safe against </script> injection */
export function ldJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
