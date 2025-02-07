/**
 * @typedef Person
 * all possible information about a person, including their name, title (professor, undergrad,grad, stella, etc), and their bio/profile photo
 * this is displayed on the "People" page on the website
 * @property {string} id: id of the person, held by airtable-
 * to find this value, click on an airtable field/person, and look at the URL at the part with the value ./recxxxxxx
 * the value of their id is that recxxxx value from the URL
 * @property {string} name: Person's displayed name on this section
 * @property {string} title:  Displayed on the website, but describes their role such as "Professor","undergraduate researcher", etc.
 * This doesn't work to actually organize the people, which is why we also have the "Role" field
 * @property {string} role: Drop-down version of title, used to sort people on the website (professor -> phd -> grad/ug etc)
 * @property {string} status: Drop down on airtable indicating if a person is active or inactive- this is used to also sort graduate and undergraduate students
 * @property {string} bio : Bio of a particular person, displayed on the "people" page of the website
 * @property {string} profile_photo: URL to someone's profile photo, from the airtable database
 *
 */
interface Person {
  id: string;
  name: string;
  title: string;
  role: string;
  status: string;
  bio: string;
  profile_photo: string | null;
}

/**
 * @typedef PartialPerson
 * concated set of information about a person
 * used in the files - "Teammembers.tsx" and "Project.ts" and "Sig.ts"
 * We have this type because it allows us to more quickly fetch content about people in cases where we don't need their bios
 * this is displayed on the "Projects" and "Sigs" part of the website, which only display someone's name and if they're active/graduated
 * @property {string} id: id of the person, held by airtable- look at @typedef Person for more info on how to find this
 * @property {string} name: Person's displayed name on this section
 * @property {string} title:  Not displayed here, but describes their role such as "Professor","undergraduate researcher", etc.
 * @property {string} role: Drop-down version of title, used to sort people on the list of names (professor -> phd -> grad/ug etc), on the SIG and project pages
 * @property {string} bio : Bio of a particular person, not displayed on the "projects" or "sig" part of the website
 * @property {string} profile_photo: URL to someone's profile photo, from the airtable database- not displayed in these sections
 */
interface PartialPerson {
  id: string;
  name: string;
  role: string;
  status: string;
  profile_photo: string | null;
}
