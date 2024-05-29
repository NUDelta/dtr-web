import PeopleProfiles from "../components/people/PeopleProfiles";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";
import { fetchPeople, Person, sortPeople } from "../lib/people";

interface PeopleProps {
  people: Person[];
}

export default function People({ people }: PeopleProps): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        {/* Active faculty and students in DTR */}
        <PeopleProfiles peopleList={people} statusFilter="Active" />

        {/* Alums of DTR */}
        <div className="prose-lg mx-auto mb-5 max-w-4xl">
          <h2>Alumni</h2>
        </div>

        <PeopleProfiles peopleList={people} statusFilter="Alumni" />
      </Container>
    </div>
  );
}

export async function getServerSideProps() {
  const people = sortPeople(await fetchPeople());

  return {
    props: {
      people,
    },
  };
}
