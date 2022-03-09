import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";
import { Person, PartialPerson, fetchPeople, sortPeople } from "./people";

export type Project = {
  id: string;
  name: string;
  banner_image: string | null;
  description: string;
  status: string;
  demo_video: string | null;
  sprint_video: string | null;
  members: PartialPerson[];
  images: ProjectImages;
  publications: ProjectPublication[];
};

export type PartialProject = {
  id: string;
  name: string;
  banner_image: string | null;
  description: string;
  status: string;
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
      const fetchedMembers: string[] =
        (record.get("members") as string[]) ?? [];
      const peopleOnProj: Person[] = sortPeople(
        people.filter((person) => {
          return fetchedMembers.includes(person.name);
        })
      );
      const partialPeopleOnProj: PartialPerson[] = peopleOnProj.map(
        (person) => {
          return {
            id: person.id,
            name: person.name,
            role: person.role,
            status: person.status,
            profile_photo: person.profile_photo,
          }
        }
      );

      const partialParsedProjInfo = {
        id: record.id as string,
        name: (record.get("name") as string) ?? "",
        banner_image: getImgUrlFromAttachmentObj(record.get("banner_image") as Attachment[]),
        description: (record.get("description") as string) ?? "",
        status: (record.get("status") as string) ?? "Active",
        demo_video: (record.get("demo_video") as string) ?? null,
        sprint_video: (record.get("sprint_video") as string) ?? null,
        members: partialPeopleOnProj,
      };

      if (!getAllData) {
        resolve({
          ...partialParsedProjInfo,
          images: {
            explainerImages: [],
          },
          publications: [],
        });

        return;
      }

      const imageDocId: string[] = record.get("images") as string[];
      const images: ProjectImages = await fetchProjectImages(imageDocId[0]);

      const publicationDocId: string[] = record.get("publications") as string[];
      const publications: ProjectPublication[] = await fetchPublications(
        publicationDocId[0]
      );

      resolve({
        ...partialParsedProjInfo,
        images,
        publications,
      });
    });
  });
};

type ProjectImages = {
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

      // get all additional images for the project
      const explainerImages: ProjectImages["explainerImages"] = [];
      [1, 2, 3, 4, 5].map((i) => {
        const imageUrl = getImgUrlFromAttachmentObj(record.get(`image_${i}`) as Attachment[]);
        const description = record.get(`image_${i}_description`) as string;

        if (imageUrl && description) {
          explainerImages.push({
            url: imageUrl,
            description,
          });
        }
      });

      resolve({
        explainerImages,
      });
    });
  });
};

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
        const name: string = record.get(`publication_${i}_name`) as string;
        const conference: string = record.get(
          `publication_${i}_conference`
        ) as string;
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
};

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
};
