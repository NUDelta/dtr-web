import { base } from "./airtable";
import { Person, fetchPeople, sortPeople } from "./people";
import { Project, getProject } from "./project";

// TODO: this can be optimized for data usage by only including needed info for Person/Project
export type SIG = {
  id: string;
  name: string;
  description: string;
  bannerImageUrl: string | null;
  members: Person[];
  projects: Project[];
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

            // add results
            results.push({
              id: record.id,
              name: (record.get("name") as string) ?? "",
              description: (record.get("description") as string) ?? "",
              bannerImageUrl:
                (record.get("banner_image_url") as string) ?? null,
              members,
              projects,
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
