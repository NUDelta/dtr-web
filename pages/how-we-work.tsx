import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import HowWeWorkList from "../components/how-we-work/HowWeWorkList";

export default function ValuesApproach(): JSX.Element {
  return (
      <div>
        <Header />

        <Container className="mt-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-semibold text-3xl">
              Design, Technology, and Research (DTR)
            </h1>
            <div className="prose prose-lg max-w-none mt-4 mb-8">
              <p>
                The Design, Technology, and Research program is a supportive,
                collaborative community of designers, builders, and researchers
                focused on solving critical problems in the world. We
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
          </div>
        </Container>
      </div>
  );
};
