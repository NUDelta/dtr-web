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
  members: string[];
  images: ProjectImages;
  publications: ProjectPublication[];
};

export async function getProject(
  projectId: string,
  getAllData = false
): Promise<Project> {
  return new Promise((resolve, reject) => {
    base("Projects").find(projectId, async function (err, record) {
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject(new Error("Project not found"));
        return;
      }

      const partialProject = {
        id: record.id,
        name: record.get("name") as string,
        description: (record.get("description") as string) ?? null,
        members: record.get("members") as string[],
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

      const imageDocId = record.get("images") as string[];
      const images = await fetchProjectImages(imageDocId[0]);

      const publicationDocId = record.get("publications") as string[];
      const publications = await fetchPublications(publicationDocId[0]);

      resolve({
        ...partialProject,
        images,
        publications,
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

type ProjectImages = {
  bannerImageUrl: string | null;
  explainerImages: {
    url: string;
    description: string;
  }[];
};

export async function fetchProjectImages(
  imageDocId: string
): Promise<ProjectImages> {
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

export async function fetchPublications(
  publicationDocId: string
): Promise<ProjectPublication[]> {
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
        const name = record.get(`publication_${i}_name`) as string;
        const conference = record.get(`publication_${i}_conference`) as string;
        const url = record.get(`publication_${i}_url`) as string;

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
