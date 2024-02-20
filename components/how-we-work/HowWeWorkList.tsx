import Image, { StaticImageData } from "next/image";

import ProblemsHow from "./assets/problems-how.png";
import ProblemsPyrus from "./assets/problems-pyrus.png";
import ProblemsProcess from "./assets/problems-process.jpg";

import ResearchSccs from "./assets/research-sccs.png";
import ResearchSig from "./assets/research-sig.png";
import ResearchOpenhouse from "./assets/research-openhouse.png";

import CommunityUist from "./assets/community-uist.png";
import CommunityCircle from "./assets/community-circle.png";
import CommunityBbq from "./assets/community-bbq.png";

import WorkingGlance from "./assets/working-glance.png";
import WorkingAgile from "./assets/working-agile.png";
import WorkingGrowth from "./assets/working-growth.png";

export default function HowWeWorkList(): JSX.Element {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <style jsx>{`
        .section-header {
          margin: 0;
        }
      `}</style>

      {sections.map((section, i) => (
        <div key={i}>
          <h2 className="text-2xl border-b border-black font-semibold mb-4">
            {section.title}
          </h2>

          <div className="space-y-4">
            {section.subsections.map((subsection, j) => (
              <div
                key={`subsection-${i}-${j}`}
                className={`flex flex-col gap-4 ${
                  i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {subsection.imagePath !== null && (
                  <>
                    <div className="w-full md:w-1/3">
                      <Image
                        src={subsection.imagePath}
                        alt={subsection.title}
                        className="responsive"
                      />
                    </div>

                    <div className="w-full md:w-2/3 prose">
                      <h3 className="section-header">{subsection.title}</h3>
                      {subsection.description}
                    </div>
                  </>
                )}

                {subsection.imagePath === null && (
                  <>
                    <div className="w-full md:w-2/3 prose">
                      <h3 className="section-header">{subsection.title}</h3>
                      {subsection.description}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type SubSection = {
  title: string;
  description: JSX.Element;
  imagePath: StaticImageData | null;
};

type Section = {
  title: string;
  subsections: SubSection[];
};

const sections: Section[] = [
  {
    title:
      "We are an interdisciplinary community working on solving hard problems.",
    subsections: [
      {
        title: "Interdisciplinary Problem Solving",
        description: (
          <>
            We work on designing, implementing, and testing systems that solve
            real-world problems by conducting interdisciplinary research, using
            methods and theories from social computing, crowdsourcing,
            human-centered design, psychology, learning sciences, artificial
            intelligence, and organizational behavior.
          </>
        ),
        imagePath: ProblemsHow,
      },
      {
        title: "Communicating Research via Grants and Publications",
        description: (
          <>
            Our students practice writing and submitting grant proposals and
            papers on their work. Undergraduates regularly receive funding
            though{" "}
            <a
              href="https://undergradresearch.northwestern.edu/funding/ayurg/"
              target="_blank"
              rel="noreferrer"
            >
              Undergraduate Research Grants
            </a>
            for their projects. We publish research at conferences like CHI,
            CSCW, UIST, and HCOMP that make substantial contributions to a
            variety of academic disciplines. Our undergraduates regularly
            compete in student research competitions, often receiving awards for
            their research.
          </>
        ),
        imagePath: ProblemsPyrus,
      },
      {
        title: "Celebrating Work Process, Not Just Outcomes",
        description: (
          <>
            We celebrate and emphasize work process over outcomes. Our students
            receive DTR certificates for working towards a submission, not for
            getting research published. Students reflect on their growth at the
            end of each quarter, and grade themselves on their effort and
            process, not the outcomes of their work. We believe that with strong
            process and continued practice comes great outcomes.
          </>
        ),
        imagePath: ProblemsProcess,
      },
    ],
  },
  {
    title: "We train students to be self-directed researchers and mentors.",
    subsections: [
      {
        title: "Rethinking Research Training      ",
        description: (
          <>
            We rethink the roles of undergraduates and graduate students in
            research labs. Undergraduates and masters students learn to self
            direct through the whole research process, from research questions
            to writing a conference paper. Ph.D. students learn to self-direct
            through the research process, and also learn to mentor
            undergraduates and masters students by shadowing advisors in the
            first years to learn about mentoring and critique. We believe that
            by distributing support across the community, faculty can train more
            students in leading and mentoring research.
          </>
        ),
        imagePath: ResearchSccs,
      },
      {
        title: "Research Goal Setting Through Canvases and Sprints      ",
        description: (
          <>
            We teach conceptual models of research and rigorous methodologies to
            help strengthen our expertise (e.g., design arguments, research
            canvases, synthesis trees, etc.). We practice identifying the
            riskiest risks in our research and use agile methods to plan a slice
            of work that de-risks our research. We work in two-week sprints,
            where the sprint stories are conceived by students, rather than
            being assigned by mentors.
          </>
        ),
        imagePath: ResearchSig,
      },
      {
        title: "Reflection and Growth      ",
        description: (
          <>
            We conduct regular self-assessments, where students use guided
            reflections to think about both their project and personal growth.
            Students regularly meet with mentors to discuss their personal
            goals, and how they might work to achieve them.
          </>
        ),
        imagePath: ResearchOpenhouse,
      },
    ],
  },
  {
    title: "We are a supportive, collaborative, playful community.   ",
    subsections: [
      {
        title: "Help and Collaboration        ",
        description: (
          <>
            We provide coordinated opportunities, such as{" "}
            <a
              href="https://www.pairresearch.io/"
              target="_blank"
              rel="noreferrer"
            >
              Pair Research
            </a>{" "}
            to offer and receive help with other students and faculty to
            overcome obstacles in our work. We believe every community member
            has areas of expertise that can be shared. Help-seeking from anyone
            in our 30 person studio is encouraged, in addition to the direct
            help from mentors and project teammates.
          </>
        ),
        imagePath: CommunityUist,
      },
      {
        title: "Research Mentoring        ",
        description: (
          <>
            We meet once a week as a studio, providing students with
            opportunities to learn core research skills through lecture and
            practice. Students also take turns sharing their research and
            getting feedback from the DTR community. Students also meet with
            their special interest groups (SIGs) where they learn to plan
            research with their peers, grad student mentors, and faculty
            advisors. We believe that we can accelerate one anothers growth and
            learning by working together.
          </>
        ),
        imagePath: CommunityCircle,
      },
      {
        title: "Building Community Outside the Lab        ",
        description: (
          <>
            We have a strong culture of students and faculty gathering outside
            of class times. Every week, a passionate squad of board gamers meet,
            while a subset of the lab have started their own intramural ultimate
            frisbee team. Every quarter, we host four social events: (1)
            community potluck dinners at faculty homes; (2) social outings,
            which in the past has included ice skating, yoga, and escape rooms;
            (3) a DTRager which starts with a Saturday evening party, and
            continues to a Sunday morning lab session of collective research
            work over catered breakfast; and (4) a themed hackathon, where we
            spend a night playing with new tech.
          </>
        ),
        imagePath: CommunityBbq,
      },
    ],
  },
  {
    title: "Work fast in a quarter; grow across quarters.",
    subsections: [
      {
        title: "DTR at a Glance        ",
        description: (
          <>
            <p>
              Students participate in DTR for one or more quarters (intended to
              be repeated). The first time a student participates, the student
              meets with their mentor in the weeks before a session starts to
              brainstorm project ideas and research directions. They start with
              as many as 10-15 ideas, narrow down to a handful that the
              student’s most interested in, and then dive in to brainstorm and
              identify a specific project for the quarter. Once a project is
              identified, a student works individually or in a small group to
              drive the research.
            </p>
          </>
        ),
        imagePath: WorkingGlance,
      },
      {
        title: "Working Agile During the Quarter        ",
        description: (
          <>
            <p>
              During a single quarter, students explore and iterate over
              designs, prototype at varying fidelities, build working systems,
              conduct evaluative studies, and report findings through the DTR
              website. As a cohort, students demo their prototypes, provide and
              receive feedback, and help each other resolve technical
              challenges.
            </p>
          </>
        ),
        imagePath: WorkingAgile,
      },
      {
        title: "Grow With Time        ",
        description: (
          <>
            As a student grows and their project advances, the research work
            matures. A student continuing beyond a quarter may build a scalable,
            deployable system, conduct medium to large scale studies, write
            research papers, and present them at conferences. As students
            develop their design, technical, research, and communication skills,
            they are also expected to mentor other DTR students, and to help
            others with both technical challenges and the research process.
          </>
        ),
        imagePath: WorkingGrowth,
      },
    ],
  },
];
