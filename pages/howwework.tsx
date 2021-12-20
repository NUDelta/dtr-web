import HowWeWorkList from "../components/HowWeWorkList";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";

export default function HowWeWork(): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-16">
        <h1 className="font-semibold text-2xl">
          Design, Technology, and Research (DTR)
        </h1>
        <div className="prose max-w-6xl mx-auto mb-20">
          <p>
            The Design, Technology, and Research program is a supportive,
            collaborative community of designers, builders, and researchers
            focused on solving critical problems in the world. In DTR, we
            develop systems that shape new experiences with people and
            technology. We work at the intersection of human-computer
            interaction, social and crowd computing, learning science,
            artificial intelligence, and design. Our supportive community
            enables students to gain experience leading cutting-edge research
            and develop into self-directed designers, engineers, and researchers
            who are well-positioned to design solutions to address people’s
            needs, explore new technologies that capture our imagination, and
            challenge ourselves to advance the state of the art through
            research.
          </p>
        </div>

        <HowWeWorkList />
      </Container>
    </main>
  );
}
