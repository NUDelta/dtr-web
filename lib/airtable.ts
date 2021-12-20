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
    const everything: Person[] = [];

    base("People")
      .select({
        view: "Grid view",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          records.forEach(function (record) {
            everything.push({
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
          resolve(everything);
        }
      );
  });
}
