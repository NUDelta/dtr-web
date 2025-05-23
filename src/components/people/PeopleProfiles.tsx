import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import PlaceHolderImg from './assets/default-pic.png';

interface PeopleProfileProps {
  peopleList: Person[];
  statusFilter: 'Active' | 'Alumni';
}

export default function PeopleProfiles({
  peopleList,
  statusFilter,
}: PeopleProfileProps) {
  const relevantPeople = peopleList.filter((person) => {
    return person.status === statusFilter;
  });

  return (
    <div className="mx-auto mb-8 max-w-4xl space-y-8">
      {relevantPeople.map((person, index) => (
        <div key={person.id} className="flex flex-col gap-4 md:flex-row">
          <div className="w-52 shrink-0">
            <Image
              src={person.profile_photo ?? PlaceHolderImg}
              width={200}
              height={200}
              alt={`Headshot of ${person.name}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
              priority={index < 5}
            />
          </div>

          <div>
            <h3 className="text-2xl font-medium">{person.name}</h3>
            <h4 className="mb-4 uppercase text-gray-500">{person.title}</h4>

            <div className="prose max-w-none">
              <ReactMarkdown>
                {person.bio}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
