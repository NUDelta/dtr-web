import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import HomeIntro from "../components/home/HomeIntro";
import Slides from "../components/home/Slides";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";

const Home: NextPage = () => {
  return (
    <div>
      <Header />

      <Container className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="w-2/3">
          <Slides />
        </div>

        <div className="w-1/3">
          <HomeIntro />
        </div>
      </Container>
    </div>
  );
};

export default Home;
