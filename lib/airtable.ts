import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

export const base = Airtable.base("app6s5xR7ukC8v9g0");

export type Person = {
  id: string;
  name: string;
  title: string;
  role: string;
  status: string;
  bio: string;
  photoUrl: string | null;
};


export async function fetchPeople(): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    const results: Person[] = [];

    base("People")
      .select({
        view: "Grid view",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            results.push({
              id: record.id,
              name: (record.get("name") as string) ?? "",
              title: (record.get("title") as string) ?? "",
              role: (record.get("role") as string) ?? "Undergraduate Student Researcher",
              status: (record.get("status") as string) ?? "Active",
              bio: (record.get("bio") as string) ?? "",
              photoUrl: (record.get("photo_url") as string) ?? null,
            });
          });

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            reject(err);
          }
          resolve(results);
        }
      );
  });
};


export function sortPeople(people: Person[]): Person[] {
  // split active and alumni
  let activePeople: Person[] = people.filter((person) => {return person.status === "Active"});
  let alumniPeople: Person[] = people.filter((person) => {return person.status === "Alumni"});

  // special case for stella
  let stella: Person[] = people.filter((person) => {return person.name === "Stella"})

  // apply sorting based on role for each sublist
  let sortedSublists: Person[][] = [activePeople, alumniPeople].map((currPeople) => {
    // split people by role
    let faculty = currPeople.filter((person) => {return person.role === "Faculty"});
    let phd = currPeople.filter((person) => {return ["Ph.D. Student", "Ph.D. Candidate"].includes(person.role)});
    let masters = currPeople.filter((person) => {return person.role === "Masters Student Researcher"});
    let ugrads = currPeople.filter((person) => {return person.role === "Undergraduate Student Researcher"});

    // sort faculty
    const facultyOrder: Record<string, number> = {};
    facultyOrder["Haoqi Zhang"] = 1;
    facultyOrder["Eleanor \"Nell\" O'Rourke"] = 2;
    facultyOrder["Matt Easterday"] = 3;
    facultyOrder["Liz Gerber"] = 4;
    faculty.sort((a, b) => {return facultyOrder[a.name] - facultyOrder[b.name]});

    // sort phd students/candidates
    const phdOrder: Record<string, number> = {};
    phdOrder["Ph.D. Candidate"] = 1;
    phdOrder["Ph.D. Student"] = 2;
    phd.sort((a, b) => {
      if (phdOrder[a.role] !== phdOrder[b.role]) { return phdOrder[a.role] - phdOrder[b.role] };
      return a.name.localeCompare(b.name);
    });

    // sort masters and undergrad
    masters.sort((a, b) => { return a.name.localeCompare(b.name); });
    ugrads.sort((a, b) => { return a.name.localeCompare(b.name); });

    // return combined sorted subarrays
    return [...faculty, ...phd, ...masters, ...ugrads];
  });

  // combine sorted sublists and return
  return [...sortedSublists[0], ...stella, ...sortedSublists[1]];
}

// TODO: this can be optimized for data usage by only including needed info for Person
export type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  demo_video: string | null;
  sprint_video: string | null;
  members: Person[];
  images: ProjectImages;
  publications: ProjectPublication[];
};

export async function getProject(
  projectId: string,
  getAllData = false
): Promise<Project> {
  return new Promise(async (resolve, reject) => {
    const people = await fetchPeople();

    base("Projects").find(projectId, async function (err, record) {
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject(new Error("Project not found"));
        return;
      }

      // get people associated with the project
      const fetchedMembers: string[] = (record.get("members") as string[]) ?? [];
      const peopleOnProj: Person[] = sortPeople(
        people.filter((person) => {
          return fetchedMembers.includes(person.name)
        })
      );

      const partialProject = {
        id: record.id as string,
        name: (record.get("name") as string) ?? "",
        description: (record.get("description") as string) ?? "",
        status: (record.get("status") as string) ?? "Active",
        demo_video: (record.get("demo_video") as string) ?? null,
        sprint_video: (record.get("sprint_video") as string) ?? null,
        members: peopleOnProj,
      };

      if (!getAllData) {
        resolve({
          ...partialProject,
          images: {
            bannerImageUrl: null,
            explainerImages: [],
          },
          publications: [],
        });

        return;
      }

      const imageDocId: string[] = record.get("images") as string[];
      const images: ProjectImages = await fetchProjectImages(imageDocId[0]);

      const publicationDocId: string[] = record.get("publications") as string[];
      const publications: ProjectPublication[] = await fetchPublications(publicationDocId[0]);

      resolve({
        ...partialProject,
        images,
        publications,
      });
    });
  });
}

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
            const projectIds: string[] = (record.get("projects") as string[]) ?? [];
            const projects: Project[] = await Promise.all(
              projectIds.map((projectId) => getProject(projectId))
            );

            // get students on each proj, SIG faculty mentors, and SIG heads
            const fetchedMembers: string[] = (record.get("members") as string[]) ?? [];
            const facultyMentors: Person[] = people.filter((person) => {
              return ((record.get("faculty_mentors") as string[]) ?? []).includes(person.id);
            });

            const sigHeads: Person[] = people.filter((person) => {
              return ((record.get("sig_head") as string[]) ?? []).includes(person.id);
            });

            const members: Person[] = [
              ...Array.from(new Set(sortPeople([
                ...facultyMentors,
                ...sigHeads,
                ...people.filter((person) => {
                  return fetchedMembers.includes(person.name)
                })
              ])))
            ];

            // add results
            results.push({
              id: record.id,
              name: (record.get("name") as string) ?? "",
              description: (record.get("description") as string) ?? "",
              bannerImageUrl: (record.get("banner_image_url") as string) ?? null,
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
}

type ProjectImages = {
  bannerImageUrl: string | null;
  explainerImages: {
    url: string;
    description: string;
  }[];
};

export async function fetchProjectImages(imageDocId: string): Promise<ProjectImages> {
  return new Promise((resolve, reject) => {
    base("Project Images").find(imageDocId, function (err, record) {
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject("Project Images not found");
        return;
      }

      // get all additional images for the project
      const explainerImages: ProjectImages["explainerImages"] = [];
      [1, 2, 3, 4, 5].map((i) => {
        const imageUrl = record.get(`image_${i}_url`) as string;
        const description = record.get(`image_${i}_description`) as string;

        if (imageUrl && description) {
          explainerImages.push({
            url: imageUrl,
            description,
          });
        }
      });

      resolve({
        bannerImageUrl: (record.get("banner_image_url") as string) ?? null,
        explainerImages,
      });
    });
  });
}

type ProjectPublication = {
  id: string;
  name: string;
  conference: string;
  url: string;
};

export async function fetchPublications(publicationDocId: string): Promise<ProjectPublication[]> {
  return new Promise((resolve, reject) => {
    base("Project Publications").find(publicationDocId, function (err, record) {
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject("Project Publication not found");
        return;
      }

      const publications: ProjectPublication[] = [];

      [1, 2, 3, 4, 5].map((i) => {
        const name: string = record.get(`publication_${i}_name`) as string;
        const conference: string = record.get(`publication_${i}_conference`) as string;
        const url: string = record.get(`publication_${i}_url`) as string;

        if (name && conference && url) {
          publications.push({
            id: `${record.id}-publication-${i}`,
            name,
            conference,
            url,
          });
        }
      });

      resolve(publications);
    });
  });
}

export async function getAllProjectIds(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const projectIds: string[] = [];

    base("Projects")
      .select({
        view: "Grid view",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          for (const record of records) {
            projectIds.push(record.id);
          }

          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(projectIds);
        }
      );
  });
}
