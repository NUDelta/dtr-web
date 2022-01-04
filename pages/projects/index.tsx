import Header from "../../components/shared/Header";
import Container from "../../components/shared/Container";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import TeamMembers from "../../components/people/TeamMembers";
import { fetchSigs, SIG } from "../../lib/sig";
import { revalidateTime } from "../../lib/consts";


interface ProjectProps {
  sigs: SIG[];
}

export default function Projects({ sigs }: ProjectProps): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* SIG component */}
          {sigs.map((sig) => (
            <div key={sig.id} className="bg-gray-50 p-8">
              {/* SIG name */}
              <h2 className="font-semibold text-3xl mb-4">{sig.name}</h2>

              {/* SIG banner image */}
              {sig.bannerImageUrl && (
                <img
                  src={sig.bannerImageUrl}
                  className="w-full"
                  alt={sig.name}
                />
              )}

              {/* SIG description */}
              <ReactMarkdown linkTarget="_blank" className="prose-lg my-4">
                {sig.description}
              </ReactMarkdown>

              {/* Projects in SIG */}
              <div className="grid grid-cols-2 gap-4 my-10">
                {sig.projects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <Link href={`/projects/${project.id}`}>
                      <a>
                        <h2 className="font-semibold text-2xl bg-yellow hover:bg-dark-yellow transition-colors p-2 break-normal">
                          {project.name}
                        </h2>
                      </a>
                    </Link>

                    <ReactMarkdown linkTarget="_blank" className="prose mt-2">
                        {
                          (project.description?.substring(0, 140) ?? "") +
                          ((project.description?.length ?? 0) > 140 ? "..." : "")
                        }
                    </ReactMarkdown>
                  </div>
                ))}
              </div>

              {/* Members of SIG */}
              <div className="w-full">
                <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
                  Team
                </h2>

                <TeamMembers groupId={sig.id} members={sig.members} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export async function getStaticProps() {
  const sigs = await fetchSigs();

  return {
    props: {
      sigs,
    },
    revalidate: revalidateTime,
  };
};
