import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { HomePageSkeleton } from '@/components/skeletons/home-page-skeleton'

const HomeClient = dynamic(() => import('./home-client'), {
  loading: () => <HomePageSkeleton />
})

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeClient />
    </Suspense>
  )
}
