import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Slides from "../components/home/Slides";
import HomeIntro from "../components/home/HomeIntro";

export default function Home(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="w-full md:w-2/3">
          <Slides />
        </div>

        <div className="w-full md:w-1/3">
          <HomeIntro />
        </div>
      </Container>
    </div>
  );
}
