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
        <div className="bg-gray-50 p-4 max-w-4xl mx-auto">
          {/* Title */}
          <h2 className="font-semibold text-3xl mb-4">{project.name}</h2>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {project.images.explainerImages.map((img, i) => (
              <div key={`img-${i}`}>
                <img
                  src={img.url}
                  className="w-full mb-4"
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
            <div className="w-full mb-8">
              <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
                Publications
              </h2>

              <ul className="font-medium prose max-w-none list-none">
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
            <div className="w-full mb-8">
              <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
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
            <div className="w-full mb-8">
              <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
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
            <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
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
