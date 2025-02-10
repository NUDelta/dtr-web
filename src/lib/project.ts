'use server';

import type { Attachment } from 'airtable';
import { getImgUrlFromAttachmentObj, sortPeople } from '@/utils';
import { getCachedRecords } from './airtable';
import { fetchPeople } from './people';

/**
 * Retrieves detailed project information from Airtable.
 *
 * This function fetches project data, including basic details, associated team members,
 * and optionally related images and publications. If `getAllData` is false, only partial
 * project information is returned.
 *
 * @async
 * @function getProject
 * @param {string} projectId - The unique ID of the project in Airtable.
 * @param {boolean} [getAllData] - Whether to fetch additional images and publications.
 * @returns {Promise<Project | null>} A promise that resolves to the project details, or `null` if not found.
 *
 * @example
 * ```typescript
 * const project = await getProject("rec123456", true);
 * console.log(project);
 * ```
 */
export async function getProject(projectId: string, getAllData = false): Promise<Project | null> {
  try {
    const projects = await getCachedRecords('Projects');
    const projectRecord = projects.find(p => p.id === projectId);

    if (!projectRecord) {
      return null;
    }

    // Fetch and filter team members
    const people = await fetchPeople();
    if (!people) {
      console.error('Failed to fetch people records.');
      return null;
    }

    const fetchedMembers = (projectRecord.fields.members as string[]) ?? [];
    const members = sortPeople(people.filter(person => fetchedMembers.includes(person.name)))
      .map(({ id, name, role, status, profile_photo }) => ({
        id,
        name,
        role,
        status,
        profile_photo,
      }));

    // Construct basic project details
    const bannerImage = await getImgUrlFromAttachmentObj(projectRecord.fields.banner_image as Attachment[]);

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
    };

    // Return only partial details if `getAllData` is false
    if (!getAllData) {
      return project;
    }

    // Fetch additional images and publications concurrently, but ensure failure doesn't break the entire request
    const [imagesResult, publicationsResult] = await Promise.allSettled([
      fetchProjectImages(Array.isArray(projectRecord.fields.images) ? (projectRecord.fields.images[0] as string) : ''),
      fetchPublications(Array.isArray(projectRecord.fields.publications) ? (projectRecord.fields.publications[0] as string) : ''),
    ]);

    return {
      ...project,
      images: imagesResult.status === 'fulfilled' ? imagesResult.value : { explainerImages: [] },
      publications: publicationsResult.status === 'fulfilled' ? publicationsResult.value : [],
    };
  }
  catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    return null;
  }
}

/**
 * Fetches images associated with a project from Airtable.
 *
 * @async
 * @function fetchProjectImages
 * @param {string} imageDocId - The unique Airtable record ID for project images.
 * @returns {Promise<ProjectImages>} A promise resolving to an object containing image URLs and descriptions.
 * Returns an empty array if no images are found.
 *
 * @example
 * ```typescript
 * const images = await fetchProjectImages("rec123456");
 * console.log(images);
 * ```
 */
export async function fetchProjectImages(imageDocId: string): Promise<ProjectImages> {
  if (!imageDocId) {
    return { explainerImages: [] };
  }

  try {
    const records = await getCachedRecords('Project Images');
    const record = records.find(r => r.id === imageDocId);

    if (!record) {
      console.warn(`Project Images not found: ${imageDocId}`);
      return { explainerImages: [] };
    }

    const explainerImages: ProjectImages['explainerImages'] = [];
    for (let i = 1; i <= 5; i++) {
      const imageUrl = await getImgUrlFromAttachmentObj(record.fields[`image_${i}`] as Attachment[]);
      const description = record.fields[`image_${i}_description`] as string;

      if (imageUrl !== null && description) {
        explainerImages.push({ url: imageUrl, description });
      }
    }

    return { explainerImages };
  }
  catch (error) {
    console.error(`Error fetching project images for ${imageDocId}:`, error);
    return { explainerImages: [] };
  }
}

/**
 * Fetches publications related to a project from Airtable.
 *
 * @async
 * @function fetchPublications
 * @param {string} publicationDocId - The unique Airtable record ID for project publications.
 * @returns {Promise<ProjectPublication[]>} A promise resolving to an array of publications.
 * Returns an empty array if no publications are found.
 *
 * @example
 * ```typescript
 * const publications = await fetchPublications("rec123456");
 * console.log(publications);
 * ```
 */
export async function fetchPublications(publicationDocId: string): Promise<ProjectPublication[]> {
  if (!publicationDocId) {
    return [];
  }

  try {
    const records = await getCachedRecords('Project Publications');
    const record = records.find(r => r.id === publicationDocId);

    if (!record) {
      console.warn(`Project Publications not found: ${publicationDocId}`);
      return [];
    }

    const publications: ProjectPublication[] = [];
    for (let i = 1; i <= 5; i++) {
      const name = record.fields[`publication_${i}_name`] as string;
      const conference = record.fields[`publication_${i}_conference`] as string;
      const url = record.fields[`publication_${i}_url`] as string;

      if (name && conference && url) {
        publications.push({ id: `${record.id}-publication-${i}`, name, conference, url });
      }
    }

    return publications;
  }
  catch (error) {
    console.error(`Error fetching project publications for ${publicationDocId}:`, error);
    return [];
  }
}

/**
 * Fetches all project IDs from the Airtable "Projects" table.
 *
 * @returns {Promise<string[]>} A list of project IDs.
 *
 * @example
 * const projectIds = await getAllProjectIds();
 * console.log(projectIds); // ["rec123456", "rec789101", ...]
 */
export async function getAllProjectIds(): Promise<string[]> {
  const projects = await getCachedRecords('Projects');
  return projects.map(project => project.id);
}
