import { GetServerSideProps } from "next";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player/youtube";
import TeamMembers from "../../components/people/TeamMembers";
import Container from "../../components/shared/Container";
import Header from "../../components/shared/Header";
import { getProject, Project } from "../../lib/project";

interface IndividualProjectPageProps {
  project: Project;
}

export default function IndividualProjectPage({
  project,
}: IndividualProjectPageProps): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-20">
        <div className="mx-auto max-w-4xl bg-gray-50 p-4">
          {/* Title */}
          <h2 className="mb-4 text-3xl font-semibold">{project.name}</h2>

          {/* Banner Image */}
          {project.banner_image && (
            <img
              src={project.banner_image}
              className="w-full"
              alt={project.name}
            />
          )}

          {/* Description */}
          <ReactMarkdown className="prose-lg my-8">
            {project.description}
          </ReactMarkdown>

          {/* Extra images */}
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {project.images.explainerImages.map((img, i) => (
              <div key={`img-${i}`}>
                <img
                  src={img.url}
                  className="mb-4 w-full"
                  alt={`${project.name} image ${i + 1}`}
                />
                {img.description.trim() !== "" ? (
                  <ReactMarkdown className="text-sm">
                    {`Figure ${i + 1}: ${img.description}`}
                  </ReactMarkdown>
                ) : (
                  <></>
                )}
              </div>
            ))}
          </div>

          {/* Publications or Additional Content (e.g., Slides) */}
          {project.publications.length > 0 && (
            <div className="mb-8 w-full">
              <h2 className="mb-2 border-b border-black pb-2 text-2xl font-bold">
                Publications
              </h2>

              <ul className="prose max-w-none list-none font-medium">
                {project.publications.map((publication) => (
                  <li key={publication.id}>
                    <a href={publication.url} target="_blank" rel="noreferrer">
                      {publication.name}
                    </a>
                    , {publication.conference}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Demo Video */}
          {project.demo_video !== null && (
            <div className="mb-8 w-full">
              <h2 className="mb-2 border-b border-black pb-2 text-2xl font-bold">
                Demo video
              </h2>

              <div className="player-wrapper">
                <ReactPlayer
                  url={project.demo_video}
                  className="react-player"
                  width="100%"
                  height="100%"
                  controls={true}
                />
              </div>
            </div>
          )}

          {/* Sprint Video */}
          {project.sprint_video !== null && (
            <div className="mb-8 w-full">
              <h2 className="mb-2 border-b border-black pb-2 text-2xl font-bold">
                Sprint Video
              </h2>

              <div className="player-wrapper">
                <ReactPlayer
                  url={project.sprint_video}
                  className="react-player"
                  width="100%"
                  height="100%"
                  controls={true}
                />
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="w-full">
            <h2 className="mb-2 border-b border-black pb-2 text-2xl font-bold">
              Team
            </h2>

            <TeamMembers groupId={project.id} members={project.members} />
          </div>
        </div>
      </Container>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (query) => {
  const project = await getProject(query.params?.id as string, true);

  if (!project) {
    console.log(`Project ${query.params?.id} not found`);
  }

  return {
    props: {
      project,
    },
  };
};
