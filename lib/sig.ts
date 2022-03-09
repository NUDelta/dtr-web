import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";
import { Person, PartialPerson, fetchPeople, sortPeople } from "./people";
import { Project, PartialProject, getProject } from "./project";

export type SIG = {
  id: string;
  name: string;
  description: string;
  banner_image: string | null;
  members: PartialPerson[];
  projects: PartialProject[];
};

export async function fetchSigs(): Promise<SIG[]> {
  return new Promise(async (resolve, reject) => {
    const people = await fetchPeople();
    const results: SIG[] = [];

    base("SIGs")
      .select({
        view: "Grid view",
      })
      .eachPage(
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

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(results);
        }
      );
  });
};
