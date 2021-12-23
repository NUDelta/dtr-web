import Link from "next/link";
import React from "react";
import Container from "../../components/shared/Container";
import Header from "../../components/shared/Header";
import { fetchSigs, SIG } from "../../lib/airtable";
import ReactMarkdown from "react-markdown";

interface ProjectProps {
  sigs: SIG[];
}

export default function Projects({ sigs }: ProjectProps): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-8">
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* SIG component */}
          {sigs.map((sig) => (
            <div key={sig.id} className="bg-gray-50 p-8">
              {/* SIG name */}
              <h2 className="font-semibold text-2xl mb-4">{sig.name}</h2>

              {/* SIG banner image */}
              {sig.bannerImageUrl && (
                <img
                  src={sig.bannerImageUrl}
                  className="w-full"
                  alt={sig.name}
                />
              )}

              {/* SIG description */}
              <div className="prose-lg my-4">
                <ReactMarkdown linkTarget="_blank">{sig.description}</ReactMarkdown>
              </div>

              {/* Projects in SIG */}
              <div className="grid grid-cols-2 gap-4 my-10">
                {sig.projects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <Link href={`/projects/${project.id}`}>
                      <a>
                        <h2 className="font-semibold text-xl bg-yellow hover:bg-dark-yellow transition-colors p-2 break-normal">
                          {project.name}
                        </h2>
                      </a>
                    </Link>

                    <div className="prose mt-2">
                      <ReactMarkdown linkTarget="_blank">
                          {
                            (project.description?.substring(0, 140) ?? "") +
                            ((project.description?.length ?? 0) > 140 ? "..." : "")
                          }
                        </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* TODO: abstract this out as a component so that it can be used for project pages too */}
              {/* Members of SIG */}
              <div className="w-full">
                <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
                  Team
                </h2>

                {/* separate members of SIG into faculty, phd students, and ms/ugrad students */}
                <div className="grid grid-cols-2 grid-rows-2 grid-flow-col auto-cols-max">
                  {["Faculty", "Ph.D. Students", "Masters and Undergraduate Students"].map((role) => (
                    <div key={`${sig.id}-${role}`} className={`${role === "Masters and Undergraduate Students" ? "row-span-2": ""} mb-2`}>
                      <h3 className="font-bold text-xl mb-2">
                        {role}
                      </h3>

                    <ul className="font-medium">
                      {sig.members.filter((member) => {
                        let filterArr: string[] = [];
                        if (role == "Faculty") { filterArr = ["Faculty"]; }
                        if (role == "Ph.D. Students") { filterArr = ["Ph.D. Student", "Ph.D. Candidate"]; }
                        if (role == "Masters and Undergraduate Students") { filterArr = ["Masters Student Researcher", "Undergraduate Student Researcher"]; }

                        return filterArr.includes(member.role);
                      }).map((member) => (
                        <li key={member.name}>
                          {member.status == "Alumni" ? "🎓" : ""} {member.name}
                        </li>
                      ))}
                    </ul>
                      </div>
                    ))}
                </div>
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
