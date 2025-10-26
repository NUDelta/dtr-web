'use server'

import type { Attachment } from 'airtable'
import { getImgUrlFromAttachmentObj, sortPeople } from '@/utils'
import { getCachedRecords } from './airtable'
import { fetchPeople } from './people'

/**
 * Retrieves detailed project information from Airtable for multiple projects.
 *
 * This function fetches project data, including basic details, associated team members,
 * and optionally related images and publications. If `getAllData` is false, only partial
 * project information is returned.
 *
 * @async
 * @function getProjects
 * @param {string[]} projectIds - An array of unique project IDs in Airtable.
 * @param {boolean} [getAllData] - Whether to fetch additional images and publications.
 * @returns {Promise<Project[]>} A promise that resolves to an array of project details.
 *
 * @example
 * ```typescript
 * const projects = await getProjects(["rec123456", "rec789101"], true);
 * console.log(projects);
 * ```
 */
export async function getProjects(projectIds: string[], getAllData = false): Promise<Project[]> {
  try {
    const projects = await getCachedRecords('Projects')
    const people = await fetchPeople()

    if (!people) {
      console.error('Failed to fetch people records.')
      return []
    }

    // Filter projects based on provided IDs
    const filteredProjects = projects.filter(p => projectIds.includes(p.id))

    // Extract all project IDs across SIGs
    const result = await Promise.all(
      filteredProjects.map(async (projectRecord) => {
        // Fetch people associated with the project
        const fetchedMembers = (projectRecord.fields.members as string[]) ?? []
        const members = sortPeople(people.filter(person => fetchedMembers.includes(person.name)))
          .map(({ id, name, role, status, profile_photo }) => ({
            id,
            name,
            role,
            status,
            profile_photo,
          }))

        // Fetch project banner image
        const bannerImage = await getImgUrlFromAttachmentObj(projectRecord.fields.banner_image as Attachment[])

        // Construct project object
        const project: Project = {
          id: projectRecord.id,
          name: (projectRecord.fields.name as string) ?? '',
          banner_image: bannerImage,
          description: (projectRecord.fields.description as string) ?? '',
          status: (projectRecord.fields.status as string) ?? 'Active',
          demo_video: (projectRecord.fields.demo_video as string) ?? null,
          sprint_video: (projectRecord.fields.sprint_video as string) ?? null,
          members,
          images: { explainerImages: [] },
          publications: [],
        }

        // Return partial project data if `getAllData` is false
        if (!getAllData) {
          return project
        }

        // Fetch additional project
        const [imagesResult, publicationsResult] = await Promise.allSettled([
          fetchProjectImages(projectRecord.fields.images as string[] ?? []),
          fetchPublications(projectRecord.fields.publications as string[] ?? []),
        ])

        // Return full project data
        return {
          ...project,
          images: imagesResult.status === 'fulfilled' ? imagesResult.value : { explainerImages: [] },
          publications: publicationsResult.status === 'fulfilled' ? publicationsResult.value : [],
        }
      }),
    )

    return result
  }
  catch (error) {
    console.error(`Error fetching projects:`, error)
    return []
  }
}

/**
 * Fetches images associated with multiple projects from Airtable.
 *
 * @async
 * @function fetchProjectImages
 * @param {string[]} imageDocIds - An array of Airtable record IDs for project images.
 * @returns {Promise<ProjectImages>} A promise resolving to an object containing image URLs and descriptions.
 * Returns an empty array if no images are found.
 *
 * @example
 * ```typescript
 * const images = await fetchProjectImages(["rec123456", "rec789101"]);
 * console.log(images);
 * ```
 */
export async function fetchProjectImages(imageDocIds: string[]): Promise<ProjectImages> {
  try {
    const records = await getCachedRecords('Project Images')
    const relevantRecords = records.filter(r => imageDocIds.includes(r.id))

    const explainerImages: ProjectImages['explainerImages'] = []

    // Fetch images and descriptions for each project
    for (const record of relevantRecords) {
      // Fetch up to 5 images and descriptions
      for (let i = 1; i <= 5; i++) {
        const imageUrl = await getImgUrlFromAttachmentObj(record.fields[`image_${i}`] as Attachment[])
        const description = record.fields[`image_${i}_description`] as string
        if (imageUrl !== null && description) {
          explainerImages.push({ url: imageUrl, description })
        }
      }
    }

    return { explainerImages }
  }
  catch (error) {
    console.error(`Error fetching project images:`, error)
    return { explainerImages: [] }
  }
}

/**
 * Fetches publications related to multiple projects from Airtable.
 *
 * @async
 * @function fetchPublications
 * @param {string[]} publicationDocIds - An array of Airtable record IDs for project publications.
 * @returns {Promise<ProjectPublication[]>} A promise resolving to an array of publications.
 * Returns an empty array if no publications are found.
 *
 * @example
 * ```typescript
 * const publications = await fetchPublications(["rec123456", "rec789101"]);
 * console.log(publications);
 * ```
 */
export async function fetchPublications(publicationDocIds: string[]): Promise<ProjectPublication[]> {
  try {
    const records = await getCachedRecords('Project Publications')
    const relevantRecords = records.filter(r => publicationDocIds.includes(r.id))

    const publications: ProjectPublication[] = []

    for (const record of relevantRecords) {
      for (let i = 1; i <= 5; i++) {
        const name = record.fields[`publication_${i}_name`] as string
        const conference = record.fields[`publication_${i}_conference`] as string
        const url = record.fields[`publication_${i}_url`] as string
        if (name && conference && url) {
          publications.push({ id: `${record.id}-publication-${i}`, name, conference, url })
        }
      }
    }

    return publications
  }
  catch (error) {
    console.error(`Error fetching project publications:`, error)
    return []
  }
}

/**
 * Fetches all project IDs from the Airtable "Projects" table.
 * For ISR generation.
 *
 * @returns {Promise<string[]>} A list of project IDs.
 *
 * @example
 * const projectIds = await getAllProjectIds();
 * console.log(projectIds); // ["rec123456", "rec789101", ...]
 */
export async function getAllProjectIds(): Promise<string[]> {
  const projects = await getCachedRecords('Projects')
  return projects.map(project => project.id)
}
