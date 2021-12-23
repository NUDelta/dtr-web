import React from "react";
import Image from "next/image";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";
import { fetchPeople, sortPeople, Person } from "../lib/airtable";
import ReactMarkdown from "react-markdown";
import PlaceHolderImg from "../components/people/default-pic.png";

interface PeopleProps {
  people: Person[];
}

export default function People({ people }: PeopleProps): JSX.Element {
  return (
    <main>
      <Header />

      {/* Active faculty and students in DTR */}
      <Container className="mt-8">
        <div className="space-y-8 max-w-4xl mx-auto mb-8">
          {people.filter((person) => {return person.status === "Active"})
          .map((person) => (
            <div key={person.id} className="flex gap-4">
              <div className="w-52 flex-shrink-0">
                <Image
                  src={person.photoUrl ?? PlaceHolderImg}
                  width={200}
                  height={200}
                  alt={person.name}
                />
              </div>

              <div>
                <h2 className="text-2xl font-medium">{person.name}</h2>
                <h3 className="uppercase text-gray-500 mb-4">{person.title}</h3>

                <div className="prose max-w-none">
                  <ReactMarkdown linkTarget="_blank">{person.bio}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

       {/* Alums of DTR */}
        <div className="prose-lg mb-5 max-w-4xl mx-auto">
          <h2>Alumni</h2>
        </div>
        <div className="space-y-8 max-w-4xl mx-auto">
          {people.filter((person) => {return person.status === "Alumni"})
          .map((person) => (
            <div key={person.id} className="flex gap-4">
              <div className="w-52 flex-shrink-0">
                <Image
                  src={person.photoUrl ?? PlaceHolderImg}
                  width={200}
                  height={200}
                  alt={person.name}
                />
              </div>

              <div>
                <h2 className="text-2xl font-medium mb-2">{person.name}</h2>
                <h3 className="uppercase text-gray-500 mb-4">{person.title}</h3>

                <div className="prose max-w-none">
                  <ReactMarkdown linkTarget="_blank">{person.bio}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

export async function getStaticProps() {
  const people = sortPeople(await fetchPeople());

  return {
    props: {
      people,
    },
  };
}
