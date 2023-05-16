import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";
import { Person, PartialPerson, fetchPeople, sortPeople } from "./people";
/**
 * type that describes projects- including relevant videos, images, members, and associated publications 
 * @typedef {object} Project 
 * @property {string} id: id of the project w/in Airtable projects database
 * @property {string} name: working name of the project, stored w/in database
 * @property {string} banner_image: Image URL of banner_image, stored as a string 
 * @property {string} description: description of project
 * @property {string} status: active/inactive project, string
 * @property {string} demo_video: Video URL of demo_video, stored as a string
 * @property {string} sprint_video: Video URL of sprint_video
 * @property {PartialPerson[]} members: array of members on a project, each w/o all details (does not include full bio, for instance)
 * @property {ProjectImages} images: type that includes an array of image urls and descriptions, fetched from airtable 
 * @property {ProjectPublication[]} publications: type that includes the id of the publi ation in airtable, 
 * the name of the publication, the conference, and the URL link to the paper (?)
 *  */
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
/**
 * @typedef {object} PartialProject
 * We use this in the "Sig" page, which describes a SIG and its associated projects
 * We also have this because fetching all information about a project is more costly, and people are directly associated w/ SIGs as part of airtable
 * and because publications, videos, and multiple images are not displayed on the SIG page
 * @property {string} id: id of the project w/in Airtable projects database
 * @property {string} name: working name of the project, stored w/in database
 * @property {string} banner_image: Image URL of banner_image, stored as a string 
 * @property {string} status string stating if the project is active or a past project 
 * intended to give a subset of information about a project, including id, name, banner image, description, and status
 * 
 */

export type PartialProject = {
  id: string;
  name: string;
  banner_image: string | null;
  description: string;
  status: string;
};
/**
 * @function getProject 
 * We have this to get projects to display on each of the SIG pages
 * It has the default value of "getAllData"
 * @param projectId 
 * @param getAllData - default value of "False" so that this function defaults to just providing PartialProject info
 * If getAllData is true, then it also recieves the partial images and publications
 * getAllData is true in [id].txt and false in sig.ts
 * @returns partial project info, images, and related publications from nested functions
 * This is what is actually used to display project information
 */

export async function getProject(
  projectId: string,
  getAllData = false
): Promise<Project> {
  return new Promise(async (resolve, reject) => {
    const people = await fetchPeople();
    // fetch people returns an array of people 
    // this will then be used to add information about project members to each project 
    // We fetch people because people are directly mapped to their SIGS in the Airtable
    // return record is the information related to the project w/ "projectid"
    base("Projects").find(projectId, async function (err, record) {
      
      if (err) {
        reject(err);
        return;
      }
      if (!record) {
        reject(new Error("Project not found"));
        return;
      }

      
      const fetchedMembers: string[] =
        // getting the list of memebers from the project information recieved from above
        (record.get("members") as string[]) ?? [];
      const peopleOnProj: Person[] = sortPeople(
        people.filter((person) => {
          // people array is filtered to include just the information about people on this project
          return fetchedMembers.includes(person.name);
        })
      );
      // returns an array w/ type partial person (may not be an explicit type)
      // mapped from the set of "people" filtered from the peopleOnProj function
      const partialPeopleOnProj: PartialPerson[] = peopleOnProj.map(
      // this is a subset of the information of every person in the filtered people array
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
        // "record" is the return value from "base("Projects").find", searching through airtable db
        id: record.id as string,
        name: (record.get("name") as string) ?? "",
        banner_image: getImgUrlFromAttachmentObj(record.get("banner_image") as Attachment[]),
        description: (record.get("description") as string) ?? "",
        status: (record.get("status") as string) ?? "Active",
        demo_video: (record.get("demo_video") as string) ?? null,
        sprint_video: (record.get("sprint_video") as string) ?? null,
        members: partialPeopleOnProj, // from the above function
      };

      if (!getAllData) { //getAllData is set to false at the beginning of this function
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
/**
 * @function fetchProjectImages
 * @param imageDocId 
 * @returns an array of <ProjectImages> for a given project
 * Called within the getProject function, specifically in the "project.ts" page 
 * steps for this function
 *   1. Select the base from airtable (in this case, "Project Images")
 *   2. Just find images for a specific project- denoted by "imageDocID"
 *          Our "Project Images" DB is organized by project, so each project has its own unique ID
 *   3. Each image is organized via "Image_i_description" and "Image_i", so we map i in range(1,5) to get each image
 *   4. Lastly, if there is both an image URL and an image description, we push that onto the "explainerImages" array
 *   5. We resolve the promise w/ that array of Explainer images
 */

export async function fetchProjectImages(
  imageDocId: string
): Promise<ProjectImages> {
  return new Promise((resolve, reject) => {
    base("Project Images").find(imageDocId, function (err, record) {
      // record is the set of project information from getProject, filterd for the specific projectid.
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
      // in the database, project images are each on their own column, with numbers from 1-5
      // this is why the part of the application has this mapping: each is image_1,_2, etc
      [1, 2, 3, 4, 5].map((i) => {
        //attachment is an airtable object, then recieve the imageUrl.
        const imageUrl = getImgUrlFromAttachmentObj(record.get(`image_${i}`) as Attachment[]);
        //
        const description = record.get(`image_${i}_description`) as string;

        if (imageUrl && description) {
          // pushes each url and description onto the array of explainer Images, which then are "ProjectImages" in getProject.
          explainerImages.push({
            url: imageUrl,
            description,
          });
        }
      });
      // resolve the promise with the array of images for a specific project
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

/**
 * 
 * @param publicationDocId 
 * @returns array of <ProjectPublications>
 * this function is called within getProject to get all relevant publications for a project
 * specifically this is called when "getAllData" is true in fetch projects
 *  steps for this function
 *   1. Select the base from airtable (in this case, "Project Publications")
 *   2. Just find publications for a specific project- denoted by "publicationDocId"
 *          Our "Project Publications" DB is organized by project, so each project has its own unique ID
 *   3. Each publication is organized via "Publication_i_name" and "Publication_i_url", so we map i in range(1,5) to get each publication + url
 *   4. Lastly, if there is both a name and a URL, we push that onto the "ProjectPublication" array
 *   5. We resolve the promise w/ that array of ProjectPublications
 */
export async function fetchPublications(
  publicationDocId: string
): Promise<ProjectPublication[]> {
  return new Promise((resolve, reject) => {
    // this is called w/in getProject, so record is the set of information about a project recieved from that call.
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
      // in the database from "record", each publication is in the database via this publication_1_name and publication_1_url system. 
      // Because all publicatiosn are named in this way, can loop through this part of the function w/ different values for i
      [1, 2, 3, 4, 5].map((i) => {
        const name: string = record.get(`publication_${i}_name`) as string;
        const conference: string = record.get(
          `publication_${i}_conference`
        ) as string;
        const url: string = record.get(`publication_${i}_url`) as string;
        // this checks that the publication actually exists- if it does, push it onto the publications array
        if (name && conference && url) {
          publications.push({
            id: `${record.id}-publication-${i}`,
            name,
            conference,
            url,
          });
        }
      });
      // this function resolves the promise w/ the array of publications
      resolve(publications);
    });
  });
};
// this returns the set of project ids
//this is not currently used in any part of the app (right?)
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
          // this returns the project Ids as a promise 
          resolve(projectIds);
        }
      );
  });
};
