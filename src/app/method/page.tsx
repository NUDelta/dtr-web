import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Method | DTR',
  alternates: { canonical: 'https://dtr.northwestern.edu/method' },
};

export default function Method() {
  return (
    <div className="prose mx-auto max-w-4xl">
      <h2>DTR at a glance</h2>
      <p>
        Students participate in DTR through fast-paced, quarter-long
        programs (intended to be repeated). Students work with a mentor to
        identify a direction of research, explore and iterate over designs,
        prototype at varying fidelities, build working systems, conduct
        evaluative studies, and report findings through conference
        publications. As a cohort, students demo their prototypes, provide
        and receive feedback, and help each other resolve technical
        challenges.
      </p>
      <p>
        DTR adapts and extends agile development and design-based research
        practices with scrums, sprints, studio critique, design logs, and
        pair research. Students embraced these practices and praised their
        effectiveness for promoting productivity, learning, and
        collaboration.
      </p>

      <p>
        Below is a rough schedule for the course. Students meet with the
        instructor weeks prior to signing up for the course to determine a
        research direction.
      </p>
      <ul>
        <li>
          <span className="font-bold">Weeks 0 to 2:</span>
          {' '}
          Learn relevant
          web, mobile, and wearable technologies.
        </li>
        <li>
          <span className="font-bold">Weeks 1 to 6:</span>
          {' '}
          Iteratively
          design and build based on needfinding, frequent user feedback, and
          in-lab testing.
        </li>
        <li>
          <span className="font-bold">Weeks 6 to 8:</span>
          {' '}
          Setting up and
          conducting user studies to test key hypotheses.
        </li>
        <li>
          <span className="font-bold">Weeks 8 to 10:</span>
          {' '}
          Analyze
          collected data. Write academic papers for submission to top
          conferences. Report findings to a general audience on DTR website.
        </li>
      </ul>

      <h2>Getting started</h2>
      <p>
        Students participate in DTR for one or more quarters. Each quarter
        is a well-scoped, self-contained research project that culminates in
        a working prototype, a user study or deployment, and an academic
        paper. The first time a student participates, the student meets with
        their mentor in the weeks before a session starts to brainstorm
        project ideas and research directions. They start with as many as
        10-15 ideas, narrow down to a handful that the student’s most
        interested in, and then dive in to brainstorm and identify a
        specific project for the quarter. Once a project is identified, a
        student works individually or in a small group to drive the
        research.
      </p>

      <h2>Grow with time</h2>
      <p>
        A first-time participant is expected to build a functioning
        prototype, conducting a small scale study (10-40 users), and write
        most of an academic paper (e.g., all sections with the exception of
        related work). A student continuing beyond a quarter will typically
        expand on their project by building a scalable, deployable system,
        conducting medium to large scale studies (100-1000+ users), and
        writing the entire research paper themselves. As students develop
        their design, technical, research, and communication skills, they
        are expected to mentor other DTR students, and to help others with
        both technical challenges and the research process.
      </p>
    </div>
  );
}
