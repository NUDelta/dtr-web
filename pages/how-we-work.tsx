import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import HowWeWorkList from "../components/how-we-work/HowWeWorkList";

export default function ValuesApproach(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold">
            Design, Technology, and Research (DTR)
          </h1>
          <div className="prose prose-lg mb-8 mt-4 max-w-none">
            <p>
              The Design, Technology, and Research program is a supportive,
              collaborative community of designers, builders, and researchers
              focused on solving critical problems in the world. We develop
              systems that shape new experiences with people and technology. We
              work at the intersection of human-computer interaction, social and
              crowd computing, learning science, artificial intelligence, and
              design. Our supportive community enables students to gain
              experience leading cutting-edge research and develop into
              self-directed designers, engineers, and researchers who are
              well-positioned to design solutions to address people’s needs,
              explore new technologies that capture our imagination, and
              challenge ourselves to advance the state of the art through
              research.
            </p>
          </div>

          <HowWeWorkList />
        </div>
      </Container>
    </div>
  );
}
