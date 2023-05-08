import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";
import { Person, PartialPerson, fetchPeople, sortPeople } from "./people";
import { Project, PartialProject, getProject } from "./project";
/**
 * @typedef SIG
 * used to contain information for a given SIG, 
 * including sig ID(in airtable db), name, description, and banner image 
 */
export type SIG = {
  id: string;
  name: string;
  description: string;
  banner_image: string | null;
  members: PartialPerson[];
  projects: PartialProject[];
};
/**
 * @function fetchSigs()
 * fetches all SIGS from the Airtable DB
 * @returns a promise that is resolved via an array of SIG[]
 */

export async function fetchSigs(): Promise<SIG[]> {
  return new Promise(async (resolve, reject) => {
    const people = await fetchPeople();
    const results: SIG[] = [];
    // base airtable DB page is "SIGs"
    base("SIGs")
      .select({
        view: "Grid view",
      })
      // for each SIG, push the SIG information onto the SIG[] array
        async function page(records, fetchNextPage) {
          // parse out info for each record
          for (const record of records) {
            // projects associated with SIG
            const projectIds: string[] =
              (record.get("projects") as string[]) ?? [];
            const projects: Project[] = await Promise.all(
              projectIds.map((projectId) => getProject(projectId))
            );

            const partialProjects: PartialProject[] = projects.map((project) => {
              // pre-trim text not needed to be transferred over the wire since text can be long
              // have at most 150 chars, removing partial words if they are cut
              // from: https://stackoverflow.com/a/5454303
              let maxCharLen = 150;
              let preTrimmedDescription = (project.description?.substring(0, maxCharLen) ?? "");
              preTrimmedDescription = preTrimmedDescription.substring(0,
                Math.min(preTrimmedDescription.length, preTrimmedDescription.lastIndexOf(" ")));
              preTrimmedDescription += (project.description?.length ?? 0) > maxCharLen ? "..." : "";
              // will be pushed onto SIG type array
              return {
                id: project.id,
                name: project.name,
                banner_image: project.banner_image,
                description: preTrimmedDescription,
                status: project.status
              };
            });

            // get students on each proj, SIG faculty mentors, and SIG heads
            const fetchedMembers: string[] =
              (record.get("members") as string[]) ?? [];
            const facultyMentors: Person[] = people.filter((person) => {
              return (
                (record.get("faculty_mentors") as string[]) ?? []
              ).includes(person.id);
            });

            const sigHeads: Person[] = people.filter((person) => {
              return ((record.get("sig_head") as string[]) ?? []).includes(
                person.id
              );
            });
            // from the array of all people, get an array of information for people specifically on this SIG 
            const members: Person[] = [
              ...Array.from(
                new Set(
                  sortPeople([
                    ...facultyMentors,
                    ...sigHeads,
                    ...people.filter((person) => {
                      return fetchedMembers.includes(person.name);
                    }),
                  ])
                )
              ),
            ];
            // from the set of full information of SIG memebers, only keep name, role, status, and profile pic
            const partialMembers: PartialPerson[] = members.map((person) => {
              return {
                id: person.id,
                name: person.name,
                role: person.role,
                status: person.status,
                profile_photo: person.profile_photo,
              }
            });

            // add results
            results.push({
              id: record.id,
              name: (record.get("name") as string) ?? "",
              description: (record.get("description") as string) ?? "",
              banner_image:
                getImgUrlFromAttachmentObj(record.get("banner_image") as Attachment[]),
              members: partialMembers,
              projects: partialProjects,
            });
          }
          // callback to the next page of SIG information etc 

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          // resolve the promise with the array of SIG information
          resolve(results);
        }
      );
  });
};
