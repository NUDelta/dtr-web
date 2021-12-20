import Link from "next/link";
import React from "react";
import Container from "../../components/shared/Container";
import Header from "../../components/shared/Header";
import { fetchSigs, SIG } from "../../lib/airtable";

interface ProjectProps {
  sigs: SIG[];
}

export default function Projects({ sigs }: ProjectProps): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-10 max-w-5xl">
        <div className="space-y-8">
          {sigs.map((sig) => (
            <div key={sig.id} className="bg-gray-50 p-4">
              <h2 className="font-semibold text-2xl mb-4">{sig.name}</h2>

              {sig.bannerImageUrl && (
                <img
                  src={sig.bannerImageUrl}
                  className="w-full"
                  alt={sig.name}
                />
              )}

              <div className="prose-lg my-8">{sig.description}</div>

              <div className="grid grid-cols-2 gap-4 my-16">
                {sig.projects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <Link href={`/projects/${project.id}`}>
                      <a className="font-semibold text-xl bg-yellow hover:bg-dark-yellow transition-colors px-4 py-2">
                        {project.name}
                      </a>
                    </Link>

                    <div className="prose mt-4">
                      {project.description?.substring(0, 140)}
                      {(project.description?.length ?? 0) > 140 ? "..." : ""}
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-96">
                <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
                  Team
                </h2>

                <ul className="font-medium">
                  {sig.members.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

export async function getStaticProps() {
  const sigs = await fetchSigs();

  return {
    props: {
      sigs,
    },
  };
}
