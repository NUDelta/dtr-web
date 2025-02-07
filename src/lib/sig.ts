'use server';

import type { Attachment } from 'airtable';
import { getImgUrlFromAttachmentObj, sortPeople } from '@/utils';
import { getCachedRecords } from './airtable';
import { fetchPeople } from './people';
import { getProject } from './project';

const truncateToNearestWord = (input: string, maxLength: number): string => {
  if (typeof input !== 'string' || typeof maxLength !== 'number' || maxLength <= 0) {
    return '';
  }

  // No truncation needed
  if (input.length <= maxLength) {
    return input;
  }

  let truncated = input.substring(0, maxLength);

  // Find the last space within the truncated string to avoid cutting words
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }

  return `${truncated}...`;
};

/**
 * Fetches all SIGs (Special Interest Groups) from the Airtable database.
 *
 * The function retrieves SIG details, associated projects, and members.
 * It optimizes project fetching by batching requests to reduce redundant API calls.
 *
 * Steps:
 *  1. Fetch SIG records from Airtable.
 *  2. Retrieve all associated project IDs for each SIG.
 *  3. Fetch project details in parallel (caching results to optimize performance).
 *  4. Trim project descriptions to 150 characters, avoiding partial words.
 *  5. Fetch people data and filter for members, faculty mentors, and SIG heads.
 *  6. Sort people: Faculty → SIG Heads → General Members.
 *  7. Convert full person details to `PartialPerson` type (removing unnecessary bio info).
 *  8. Store results and return all SIGs as an array.
 *
 * @async
 * @function fetchSigs
 * @returns {Promise<SIG[]>} A promise resolving to an array of SIG objects.
 *
 * @example
 * ```typescript
 * const sigs = await fetchSigs();
 * console.log(sigs);
 * ```
 */
export async function fetchSigs(): Promise<SIG[]> {
  try {
    // Fetch all people records from Airtable
    const people = await fetchPeople();
    if (!people) {
      console.error('Failed to fetch people records.');
      return [];
    }

    // Fetch all SIG records
    const sigRecords = await getCachedRecords('SIGs');
    if (!sigRecords.length) {
      console.warn('No SIG records found.');
      return [];
    }

    // Extract all project IDs across SIGs
    const allProjectIds = new Set(
      sigRecords.flatMap(record => (record.fields.projects as string[]) ?? []),
    );

    // Fetch project data in batch to optimize API calls
    const projectData = new Map<string, Project | null>();
    await Promise.all([...allProjectIds].map(async (projectId) => {
      try {
        const project = await getProject(projectId);
        if (project) {
          projectData.set(projectId, project);
        }
      }
      catch (error) {
        console.error(`Failed to fetch project: ${projectId}`, error);
        projectData.set(projectId, null);
      }
    }));

    // Process each SIG record
    const results: SIG[] = sigRecords.map((record) => {
      // Fetch projects linked to the SIG
      const projectIds: string[] = (record.fields.projects as string[]) ?? [];
      const projects: Project[] = projectIds
        .map(projectId => projectData.get(projectId))
        .filter((p): p is Project => p !== null);

      // Trim project descriptions (max 150 chars, avoiding cut-off words)
      const partialProjects: PartialProject[] = projects.map((project) => {
        const maxCharLen = 150;

        return {
          id: project.id,
          name: project.name,
          banner_image: project.banner_image,
          description: truncateToNearestWord(project.description, maxCharLen),
          status: project.status,
        };
      });

      // Fetch people associated with the SIG
      const fetchedMembers: string[] = (record.fields.members as string[]) ?? [];
      const facultyMentors = people.filter(person =>
        ((record.fields.faculty_mentors as string[]) ?? []).includes(person.id),
      );

      const sigHeads = people.filter(person =>
        ((record.fields.sig_head as string[]) ?? []).includes(person.id),
      );

      // Compile all members: Faculty → SIG Heads → General Members
      const members = Array.from(
        new Set(
          sortPeople([
            ...facultyMentors,
            ...sigHeads,
            ...people.filter(person => fetchedMembers.includes(person.name)),
          ]),
        ),
      );

      // Convert full person details to PartialPerson (removing bio)
      const partialMembers: PartialPerson[] = members.map(person => ({
        id: person.id,
        name: person.name,
        role: person.role,
        status: person.status,
        profile_photo: person.profile_photo,
      }));

      // Construct SIG object
      return {
        id: record.id,
        name: (record.fields.name as string) ?? '',
        description: (record.fields.description as string) ?? '',
        banner_image: getImgUrlFromAttachmentObj(record.fields.banner_image as Attachment[]),
        members: partialMembers,
        projects: partialProjects,
      };
    });

    return results;
  }
  catch (error) {
    console.error('Error fetching SIGs:', error);
    return [];
  }
}
