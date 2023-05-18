import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";

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
export type Person = {
  id: string;
  name: string;
  title: string;
  role: string;
  status: string;
  bio: string;
  profile_photo: string | null;
};

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
export type PartialPerson = {
  id: string;
  name: string;
  role: string;
  status: string;
  profile_photo: string | null;
};

/**
 * @function fetchPeople
 * @returns array of People type
 * at a high level, fetches all information from the Airtable DB about all people in the database
 * steps:
 *  1. Select the base from airtable (in this case, "people")
 *  2. For each page (person), we push the people onto the "Results" array, and then callback for the next page
 *  3. Continue step 2 until this process is completed and all people are pushed onto the results array
 */
export async function fetchPeople(): Promise<Person[]> {
  return new Promise((resolve, reject) => {
    const results: Person[] = [];
    // airtable function to select the specific page of the db to attend to: the "base" is people
    base("People")
      .select({
        view: "Grid view",
      })
      // for each line in the people database: airtable function
      .eachPage(
        function page(records, fetchNextPage) {
          // this function pushes the people info onto the "results" array, and then calls itself again via a fetchnextpage callback
          // the callback is from the airtable API
          records.forEach(function (record) {
            results.push({
              id: record.id,
              name: (record.get("name") as string) ?? "",
              title: (record.get("title") as string) ?? "",
              role:
                (record.get("role") as string) ??
                "Undergraduate Student Researcher",
              status: (record.get("status") as string) ?? "Active",
              bio: (record.get("bio") as string) ?? "",
              profile_photo: getImgUrlFromAttachmentObj(
                record.get("profile_photo") as Attachment[]
              ),
            });
          });
          // callback function to fetch next page of results
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            console.error(err);
            reject(err);
          }
          // resolve the promise with the array of results
          resolve(results);
        }
      );
  });
}

/**
 * @function sortPeople - sorted array of people where people are in categories: professors, phds, students (grad and ugrad), active, non active, and stella !
 * We use this in the people, project, and sig pages of the website, where we sort students and professors
 * @param people Person[]
 * @returns array of Person[]in the correct order
 */
export function sortPeople(people: Person[]): Person[] {
  // split active and alumni via the "status" parameter of the Person type
  let activePeople: Person[] = people.filter((person) => {
    return person.status === "Active";
  });

  let alumniPeople: Person[] = people.filter((person) => {
    return person.status === "Alumni";
  });

  // special case for stella
  let stella: Person[] = people.filter((person) => {
    return person.name === "Stella";
  });

  // apply sorting based on role for each sublist
  let sortedSublists: Person[][] = [activePeople, alumniPeople].map(
    (currPeople) => {
      // split people by role
      let faculty = currPeople.filter((person) => {
        return person.role === "Faculty";
      });

      let phd = currPeople.filter((person) => {
        return ["Ph.D. Student", "Ph.D. Candidate"].includes(person.role);
      });

      let masters = currPeople.filter((person) => {
        return person.role === "Masters Student Researcher";
      });

      let ugrads = currPeople.filter((person) => {
        return person.role === "Undergraduate Student Researcher";
      });

      // sort faculty
      const facultyOrder: Record<string, number> = {};
      // explicit faculty ordering
      facultyOrder["Haoqi Zhang"] = 1;
      facultyOrder['Eleanor "Nell" O\'Rourke'] = 2;
      facultyOrder["Matt Easterday"] = 3;
      facultyOrder["Liz Gerber"] = 4;
      faculty.sort((a, b) => {
        return facultyOrder[a.name] - facultyOrder[b.name];
      });

      // sort phd students/candidates
      const phdOrder: Record<string, number> = {};
      phdOrder["Ph.D. Candidate"] = 1;
      phdOrder["Ph.D. Student"] = 2;
      phd.sort((a, b) => {
        if (phdOrder[a.role] !== phdOrder[b.role]) {
          return phdOrder[a.role] - phdOrder[b.role];
        }
        return a.name.localeCompare(b.name);
      });

      // sort masters and undergrad
      masters.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      ugrads.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      // return combined sorted subarrays
      return [...faculty, ...phd, ...masters, ...ugrads];
    }
  );

  // combine sorted sublists and return
  return [...sortedSublists[0], ...stella, ...sortedSublists[1]];
}
