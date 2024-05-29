import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Slides from "../components/home/Slides";
import HomeIntro from "../components/home/HomeIntro";
import Link from "next/link";

export default function Home(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8 flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-2/3">
          <Slides />
        </div>

        <div className="w-full md:w-1/3">
          <HomeIntro />
        </div>
      </Container>

      <Container className="mt-4">
        <div className="mb-4 w-full rounded-lg bg-yellow pb-2 pt-2">
          <p className="text-center text-black">
            The{" "}
            <Link href="/letters">
              <span className="link link-underline link-underline-black font-bold text-black">
                2023 DTR Annual Letter
              </span>
            </Link>{" "}
            is out! Also check out the DTR documentary,{" "}
            <a target="_blank" rel="noreferrer" href="https://forward.movie">
              <span className="link link-underline link-underline-black font-bold text-black">
                Forward
              </span>
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}
