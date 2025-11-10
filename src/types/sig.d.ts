interface AirtableSIG {
  id: string
  name: string
  description: string
  banner_image: Attachment[] | null
  members: string[] | null
  sig_head: string[] | null
  faculty_mentors: string[] | null
  projects: string[] | null
}

/**
 * @typedef SIG
 * @property {string} id: Id of the SIG, held by airtable-
 *      to find this value, click on an airtable field/SIG (from the SIGs database), and look at the URL at the part with the value ./recxxxxxx
 *      the value of the SIG id is that recxxxx value from the URL
 * used to contain information for a given SIG,
 * @property {string} name: name of a SIG
 * @property {string} description: Description of a SIG
 * @property {string} banner_image: either the URL to the banner image, or Null (no banner image)
 * @property {PartialPerson[]} members: array of information about members of a sig, including name, role, and if they're active
 * @property {PartialProject[]} projects: array of information about projects in a sig, not including explainer images and publications
 *  including sig ID(in airtable db), name, description, and banner image
 *
 */
interface SIG {
  id: string
  name: string
  description: string
  banner_image: string | null
  members: PartialPerson[]
  projects: PartialProject[]
  sig_head?: string[]
  faculty_mentors?: string[]
}
