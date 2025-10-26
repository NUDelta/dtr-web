import HomeIntro from '@/components/home/HomeIntro'
import MediaBanner from '@/components/home/MediaBanner'
import Slides from '@/components/home/Slides'

export default function HomePage() {
  return (
    <div className="mx-2 md:mx-4">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <Slides className="w-full md:w-2/3" />
        <HomeIntro className="w-full md:w-1/3" />
      </div>

      <div className="mt-4">
        <MediaBanner />
      </div>
    </div>
  )
}
