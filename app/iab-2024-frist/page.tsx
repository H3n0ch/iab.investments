import { FristJahrgangPage, fristMetadata } from '@/components/FristJahrgangPage'

export const revalidate = 300
export const metadata = fristMetadata(2024)

export default function Page() {
  return <FristJahrgangPage year={2024} />
}
