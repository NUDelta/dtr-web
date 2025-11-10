interface AirtableProject {
  id: string
  name: string
  banner_image: string | null
  description: string
  status: string
  demo_video: string | null
  sprint_video: string | null
  /** Array of member IDs associated with the project */
  members: string[] | null
  /** Array of image URLs associated with the project */
  images: string[] | null
  /** Array of publications associated with the project */
  publications: string[]
}

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
 */
interface Project {
  id: string
  name: string
  banner_image: string | null
  description: string
  status: string
  demo_video: string | null
  sprint_video: string | null
  members: PartialPerson[]
  images: ProjectImages
  publications: ProjectPublication[]
}

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
interface PartialProject {
  id: string
  name: string
  banner_image: string | null
  description: string
  status: string
}

interface ProjectImages {
  explainerImages: {
    url: string
    description: string
  }[]
}

interface ProjectPublication {
  id: string
  name: string
  conference: string
  url: string
}
