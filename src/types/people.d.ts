/**
 * @typedef Person
 * all possible information about a person, including their name, title (professor, undergrad,grad, stella, etc), and their bio/profile photo
 * this is displayed on the "People" page on the website
 */
interface Person {
  /**
   * id of the person, held by airtable
   * to find this value, click on an airtable field/person, and look at the URL at the part with the value ./recxxxxxx
   * the value of their id is that recxxxx value from the URL
   */
  id: string;
  /** Person's displayed name on this section */
  name: string;
  /**
   * Displayed on the website, but describes their role such as "Professor","undergraduate researcher", etc.
   * This doesn't work to actually organize the people, which is why we also have the "Role" field
   */
  title: string;
  /** Drop-down version of title, used to sort people on the website (professor -> phd -> grad/ug etc) */
  role: string;
  /** Drop down on airtable indicating if a person is active or inactive- this is used to also sort graduate and undergraduate students */
  status: string;
  /** Bio of a particular person, displayed on the "people" page of the website */
  bio: string;
  /** URL to someone's profile photo, from the airtable database */
  profile_photo: string | null;
}

/**
 * @typedef PartialPerson
 * concated set of information about a person
 * used in the files - "Teammembers.tsx" and "Project.ts" and "Sig.ts"
 * We have this type because it allows us to more quickly fetch content about people in cases where we don't need their bios
 * this is displayed on the "Projects" and "Sigs" part of the website, which only display someone's name and if they're active/graduated
 */
interface PartialPerson {
  /** id of the person, held by airtable- look at @typedef Person for more info on how to find this */
  id: string;
  /** Person's displayed name on this section */
  name: string;
  /** Not displayed here, but describes their role such as "Professor","undergraduate researcher", etc. */
  role: string;
  /** Drop-down version of title, used to sort people on the list of names (professor -> phd -> grad/ug etc), on the SIG and project pages */
  status: string;
  /** URL to someone's profile photo, from the airtable database- not displayed in these sections */
  profile_photo: string | null;
}
