import type { Metadata } from 'next';
import PeopleProfiles from '@/components/people/PeopleProfiles';
import { fetchPeople } from '@/lib/people';
import { maybeRunR2CleanupFromISR } from '@/lib/r2-gc';
import { sortPeople } from '@/utils';

// Revalidate every 4 hours, maximum 186 times per month
export const revalidate = 14400;

export const metadata: Metadata = {
  title: 'People | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/people' },
};

export default async function PeoplePage() {
  // Throttled GC: at most once every 24h; delete objects not accessed in 60 days
  await maybeRunR2CleanupFromISR({
    prefix: 'images/',
    maxAgeDays: 60,
    minIntervalHours: 24,
    maxDeletePerRun: 250,
  });

  const people = sortPeople((await fetchPeople()) ?? []);

  return (
    <>
      {/* Active faculty and students in DTR */}
      <PeopleProfiles peopleList={people} statusFilter="Active" />

      {/* Alums of DTR */}
      <div className="prose-lg mx-auto mb-5 max-w-4xl">
        <h2>Alumni</h2>
      </div>

      <PeopleProfiles peopleList={people} statusFilter="Alumni" />
    </>
  );
}
