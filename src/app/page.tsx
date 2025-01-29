import HomeIntro from '@/components/home/HomeIntro';
import Slides from '@/components/home/Slides';
import Container from '@/components/shared/Container';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Container className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-2/3">
          <Slides />
        </div>

        <div className="w-full md:w-1/3">
          <HomeIntro />
        </div>
      </Container>

      <Container className="mt-4">
        <div className="mb-4 w-full rounded-lg bg-yellow pb-2 pt-2">
          <p className="text-center text-black">
            The
            {' '}
            <Link href="/letters">
              <span className="link link-underline link-underline-black font-bold text-black">
                2024 DTR Annual Letter
              </span>
            </Link>
            {' '}
            is out! Also check out the DTR documentary,
            {' '}
            <a target="_blank" rel="noreferrer noopener" href="https://forward.movie">
              <span className="link link-underline link-underline-black font-bold text-black">
                Forward
              </span>
            </a>
            .
          </p>
        </div>
      </Container>
    </>
  );
}
