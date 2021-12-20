import Airtable from "airtable";

console.log(process.env.AIRTABLE_API_KEY);

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

export const base = Airtable.base("app6s5xR7ukC8v9g0");

export type Person = {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
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
              name: record.get("name") as string,
              title: record.get("title") as string,
              bio: record.get("bio") as string,
              photoUrl: record.get("photo_url") as string,
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
}

export type Project = {
  id: string;
  name: string;
  description: string | null;
};

export async function getProject(projectId: string): Promise<Project> {
  return new Promise((resolve, reject) => {
    base("Projects").find(projectId, function (err, record) {
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject(new Error("Project not found"));
        return;
      }

      resolve({
        id: record.id,
        name: record.get("name") as string,
        description: (record.get("description") as string) ?? null,
      });
    });
  });
}

export type SIG = {
  id: string;
  name: string;
  description: string;
  bannerImageUrl: string | null;
  members: string[];
  projects: Project[];
};

export async function fetchSigs(): Promise<SIG[]> {
  return new Promise((resolve, reject) => {
    const results: SIG[] = [];

    base("SIGs")
      .select({
        view: "Grid view",
      })
      .eachPage(
        async function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          for (const record of records) {
            const projectIds = record.get("projects") as string[];

            const projects = await Promise.all(
              projectIds.map((projectId) => getProject(projectId))
            );

            results.push({
              id: record.id,
              name: record.get("name") as string,
              description: record.get("description") as string,
              bannerImageUrl:
                (record.get("banner_image_url") as string) ?? null,
              members: record.get("members") as string[],
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
