import type { Metadata } from 'next'
import PeopleDirectory from '@/components/people/PeopleDirectory'
import { fetchPeople } from '@/lib/airtable/people'
import { sortPeople } from '@/utils'

export const metadata: Metadata = {
  title: 'People | DTR',
  description: 'Meet the diverse and talented individuals who make up the DTR community, including faculty, students, and alumni.',
  alternates: { canonical: 'https://dtr.northwestern.edu/people' },
}

export default async function PeoplePage() {
  const people = sortPeople((await fetchPeople()) ?? [])

  return (
    <PeopleDirectory initialPeople={people} />
  )
}
