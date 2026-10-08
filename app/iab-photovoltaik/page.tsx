import { ArticleView, articleMetadata } from '@/components/ArticleView'
import { getArticle } from '@/lib/wissen'

const article = getArticle('iab-photovoltaik')!

export const metadata = articleMetadata(article)

export default function Page() {
  return <ArticleView article={article} />
}
