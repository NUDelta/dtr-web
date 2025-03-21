import type { Metadata } from 'next';
import PeopleProfiles from '@/components/people/PeopleProfiles';
import { fetchPeople } from '@/lib/people';
import { sortPeople } from '@/utils';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'People | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/people' },
};

export default async function PeoplePage() {
  const people = sortPeople(await fetchPeople() ?? []);

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
