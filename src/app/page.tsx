import HomeIntro from '@/components/home/HomeIntro';
import Slides from '@/components/home/Slides';
import Container from '@/components/shared/Container';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Container className="flex flex-col gap-6 md:flex-row md:items-center">
        <Slides className="w-full md:w-2/3" />
        <HomeIntro className="w-full md:w-1/3" />
      </Container>

      <Container className="mt-4">
        <div className="mb-4 w-full rounded-lg bg-yellow pb-2 pt-2">
          <p className="text-center text-black">
            The
            {' '}
            <Link href="/letters" className="link link-underline link-underline-black font-bold text-black">
              2024 DTR Annual Letter
            </Link>
            {' '}
            is out! Also check out the DTR documentary,
            {' '}
            <Link target="_blank" rel="noreferrer noopener" href="https://forward.movie" className="link link-underline link-underline-black font-bold text-black">
              Forward
            </Link>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
