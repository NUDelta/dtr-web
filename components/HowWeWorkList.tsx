import React from "react";
import Image from "next/image";

import ProblemsHow from "./how-we-work-images/problems-how.png";
import ProblemsPyrus from "./how-we-work-images/problems-pyrus.png";
import ProblemsProcess from "./how-we-work-images/problems-process.jpg";

import ResearchSccs from "./how-we-work-images/research-sccs.png";
import ResearchSig from "./how-we-work-images/research-sig.png";
import ResearchOpenhouse from "./how-we-work-images/research-openhouse.png";

import CommunityUist from "./how-we-work-images/community-uist.png";
import CommunityCircle from "./how-we-work-images/community-circle.png";
import CommunityBbq from "./how-we-work-images/community-bbq.png";

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
                className={`flex gap-4 ${
                  i % 2 === 0 ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="w-1/3">
                  <Image
                    src={subsection.imagePath}
                    alt={subsection.title}
                    layout="responsive"
                  />
                </div>

                <div className="w-2/3 prose">
                  <h3 className="section-header">{subsection.title}</h3>
                  {subsection.description}
                </div>
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
  imagePath: StaticImageData;
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
            Our undergraduates practice writing and submitting grant proposals
            for their work, and regularly receive funding though Undergraduate
            Research Grants for their projects. We publish research at
            conferences like CHI, CSCW, UIST, and HCOMP that make substantial
            contributions to a variety of academic disciplines. Our
            undergraduates regularly compete in student research competitions,
            often receiving awards for their research.
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
            research labs. Undergraduates learn to self direct through the whole
            research process, from research questions to writing a conference
            paper. Graduate students not only learn to self-direct through the
            research process, but also learn to mentor undergraduates by
            shadowing advisors in the first years to learn about mentoring and
            critique. We believe that by distributing support across the
            community, faculty can train more students in leading and mentoring
            research.
          </>
        ),
        imagePath: ResearchSccs,
      },
      {
        title: "Research Goal Setting Through Canvases and Sprints      ",
        description: (
          <>
            We teach conceptual models of research and rigorous methodologies to
            help strengthen our expertise (e.g. design arguments, research
            canvases, synthesis trees, etc). We practice identifying the
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
            <a href="http://pairresearch.io/" target="_blank" rel="noreferrer">Pair Research</a> to offer and
            receive help with other students and faculty to overcome obstacles
            in our work. We believe every community member has areas of
            expertise that can be shared. Help-seeking from anyone in our 30
            person studio is encouraged, in addition to the direct help from
            mentors and project teammates.
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
            community potluck dinners at faculty homes; (2) social outings, which
            in the past has included ice skating, yoga, and escape rooms; (3) a
            DTRager which starts with a Saturday evening party, and continues to
            a Sunday morning lab session of collective research work over
            catered breakfast; and (4) a themed hackathon, where we spend a night
            playing with new tech.
          </>
        ),
        imagePath: CommunityBbq,
      },
    ],
  },
];
