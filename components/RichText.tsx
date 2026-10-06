import Link from 'next/link'
import type { ReactNode } from 'react'

const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g

/** Renders the inline marks used in lib/wissen.ts: [Linktext](/pfad) and **fett** */
export function RichText({ text }: { text: string }): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <Link key={i} href={link[2]} className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:decoration-emerald-600">
          {link[1]}
        </Link>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
