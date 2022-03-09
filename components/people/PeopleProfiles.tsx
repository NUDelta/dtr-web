import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Person } from "../../lib/people";
import PlaceHolderImg from "./assets/default-pic.png";

interface PeopleProfileProps {
  peopleList: Person[];
  statusFilter: "Active" | "Alumni";
}

export default function PeopleProfiles({
  peopleList,
  statusFilter,
}: PeopleProfileProps): JSX.Element {
  const relevantPeople = peopleList.filter((person) => {
    return person.status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto mb-8">
      {relevantPeople.map((person) => (
        <div key={person.id} className="flex flex-col md:flex-row gap-4">
          <div className="w-52 flex-shrink-0">
            <Image
              src={person.profile_photo ?? PlaceHolderImg}
              width={200}
              height={200}
              alt={`Headshot of ${person.name}`}
            />
          </div>

          <div>
            <h2 className="text-2xl font-medium">{person.name}</h2>
            <h3 className="uppercase text-gray-500 mb-4">{person.title}</h3>

            <ReactMarkdown linkTarget="_blank" className="prose max-w-none">
              {person.bio}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
