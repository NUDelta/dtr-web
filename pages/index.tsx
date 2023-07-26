import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Slides from "../components/home/Slides";
import HomeIntro from "../components/home/HomeIntro";
import Link from "next/link";

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

      <Container className="mt-4">
        <div className="w-full bg-yellow pt-2 pb-2 rounded-lg mb-4">
          <p className="text-center text-black">
            The{" "}
            <Link href="/letters">
              <a>
                <span className="text-black font-bold link link-underline link-underline-black">
                  2023 DTR Annual Letter
                </span>
              </a>
            </Link>{" "}
            is out! Also check out the DTR documentary,{" "}
            <a target="_blank" rel="noreferrer" href="https://forward.movie">
              <span className="text-black font-bold link link-underline link-underline-black">
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
