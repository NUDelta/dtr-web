'use server'

import { getImgUrlFromAttachmentObj } from '@/utils'
import { getCachedRecords } from './airtable'

/**
 * Fetches all people data from the Airtable "People" table.
 * This function retrieves cached records from Airtable, ensuring efficient data fetching
 * and reducing unnecessary API requests.
 *
 * @async
 * @function fetchPeople
 * @returns {Promise<Person[] | null>} A promise that resolves to an array of people, or `null` if no records are found.
 *
 * @example
 * ```typescript
 * const people = await fetchPeople();
 * console.log(people); // [{ id: "recXXXXXX", name: "John Doe", ... }, ...]
 * ```
 */
export async function fetchPeople(): Promise<Person[] | null> {
  const peopleRecords = await getCachedRecords<AirtablePerson>('People')

  if (!peopleRecords.length) {
    console.warn('No people records found.')
    return null
  }

  return Promise.all(peopleRecords.map(async ({ id, fields }) => ({
    id,
    name: fields.name ?? '',
    title: fields.title ?? '',
    role: fields.role ?? 'Undergraduate Student Researcher',
    status: fields.status ?? 'Active',
    bio: fields.bio ?? '',
    profile_photo: await getImgUrlFromAttachmentObj(fields.profile_photo ?? []),
  })))
}
