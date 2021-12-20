import React from "react";
import Image from "next/image";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";
import { fetchPeople, Person } from "../lib/airtable";
import ReactMarkdown from "react-markdown";

interface PeopleProps {
  people: Person[];
}

export default function People({ people }: PeopleProps): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-20">
        <div className="space-y-8">
          {people.map((person) => (
            <div key={person.id} className="flex gap-4">
              <div className="w-52 flex-shrink-0">
                <Image
                  src={person.photoUrl}
                  width={200}
                  height={200}
                  alt={person.name}
                />
              </div>

              <div>
                <h2 className="text-2xl font-medium">{person.name}</h2>
                <h3 className="uppercase text-gray-500 mb-4">{person.title}</h3>

                <div className="prose">
                  <ReactMarkdown>{person.bio}</ReactMarkdown>
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
  const people = await fetchPeople();

  return {
    props: {
      people,
    },
  };
}
