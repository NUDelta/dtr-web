import Link from 'next/link';
import annualLetters from '@/lib/annual-letters';

interface MediaBannerProps {
  className?: string;
}

const MediaBanner = ({ className }: MediaBannerProps) => {
  const latestAnnualLetterDate = () => {
    const sortedAnnualLetters = annualLetters.sort((a, b) => b.datePublished.getTime() - a.datePublished.getTime());
    return sortedAnnualLetters[0].datePublished.getFullYear();
  };

  return (
    <div className={`mb-4 w-full rounded-lg bg-yellow pb-2 pt-2 ${className}`}>
      <p className="text-center text-black">
        The
        {' '}
        <Link href="/letters" className="link link-underline link-underline-black font-bold text-black">
          {latestAnnualLetterDate()}
          {' '}
          DTR Annual Letter
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
  );
};

export default MediaBanner;
