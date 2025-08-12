import HomeIntro from '@/components/home/HomeIntro';
import MediaBanner from '@/components/home/MediaBanner';
import Slides from '@/components/home/Slides';
import Container from '@/components/shared/Container';

export default function HomePage() {
  return (
    <>
      <Container className="flex flex-col gap-6 md:flex-row md:items-center">
        <Slides className="w-full md:w-2/3" />
        <HomeIntro className="w-full md:w-1/3" />
      </Container>

      <Container className="mt-4">
        <MediaBanner />
      </Container>
    </>
  );
}
