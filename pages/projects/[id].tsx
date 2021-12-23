import React from "react";
import Header from "../../components/shared/Header";
import Container from "../../components/shared/Container";
import { getAllProjectIds, getProject, Project } from "../../lib/airtable";
import { GetStaticPaths, GetStaticProps } from "next";
import ReactMarkdown from "react-markdown";

interface IndividualProjectPageProps {
  project: Project;
}

export default function IndividualProjectPage({
  project,
}: IndividualProjectPageProps): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-20 max-w-5xl">
        <div className="bg-gray-50 p-4">
          <h2 className="font-semibold text-2xl mb-4">{project.name}</h2>

          {project.images.bannerImageUrl && (
            <img
              src={project.images.bannerImageUrl}
              className="w-full"
              alt={project.name}
            />
          )}

          <div className="prose-lg my-8">
            <ReactMarkdown linkTarget="_blank">{project.description ?? ""}</ReactMarkdown>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            {project.images.explainerImages.map((img, i) => (
              <div key={`img-${i}`}>
                <img
                  src={img.url}
                  className="w-full mb-4"
                  alt={`${project.name} ${i}`}
                />
                <p className="text-sm">
                  <ReactMarkdown linkTarget="_blank">{img.description}</ReactMarkdown>
                </p>
              </div>
            ))}
          </div>

          {project.publications.length > 0 && (
            <div className="w-96">
              <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
                Publications
              </h2>

              <ul className="font-medium prose mb-12">
                {project.publications.map((publication) => (
                  <li key={publication.id}>
                    <a href={publication.url} target="_blank" rel="noreferrer">{publication.name}</a>,{" "}
                    {publication.conference}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="w-96">
            <h2 className="font-bold text-2xl mb-2 pb-2 border-b border-black">
              Team
            </h2>

            <ul className="font-medium">
              {project.members.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async (query) => {
  const project = await getProject(query.params?.id as string, true);

  return {
    props: {
      project,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const projectIds = await getAllProjectIds();

  return {
    paths: projectIds.map((projectId) => ({
      params: {
        id: projectId,
      },
    })),
    fallback: true,
  };
};
