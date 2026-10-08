import { FristJahrgangPage, fristMetadata } from '@/components/FristJahrgangPage'

export const revalidate = 300
export const metadata = fristMetadata(2023)

export default function Page() {
  return <FristJahrgangPage year={2023} />
}
