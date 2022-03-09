import { Attachment } from "airtable";
import { base, getImgUrlFromAttachmentObj } from "./airtable";

export type Person = {
  id: string;
  name: string;
  title: string;
  role: string;
  status: string;
  bio: string;
  profile_photo: string | null;
};

export type PartialPerson = {
  id: string;
  name: string;
  role: string;
  status: string;
  profile_photo: string | null;
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
              role:
                (record.get("role") as string) ??
                "Undergraduate Student Researcher",
              status: (record.get("status") as string) ?? "Active",
              bio: (record.get("bio") as string) ?? "",
              profile_photo: getImgUrlFromAttachmentObj(record.get("profile_photo") as Attachment[]),
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
};
