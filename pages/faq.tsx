import React from "react";
import Link from "next/link";
import Container from "../components/shared/Container";
import Header from "../components/shared/Header";

export default function Faq(): JSX.Element {
  return (
    <main>
      <Header />

      <Container className="mt-8  max-w-4xl">
        <div className="prose-lg">
          <h2>Frequently Asked Questions</h2>

          <div className="space-y-6">
            {questionsAndAnswers.map((qa, i) => (
              <div key={i} className="">
                <h5 className="font-medium">{qa.question}</h5>
                {qa.answer}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

type QA = {
  question: string | JSX.Element;
  answer: JSX.Element;
};

const questionsAndAnswers: QA[] = [
  {
    question: "When is DTR offered?",
    answer: (
      <>
        DTR is offered as a{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.mccormick.northwestern.edu/computer-science/academics/courses/descriptions/315-497.html"
        >
          EECS 315/497 course
        </a>{" "}
        every quarter. Students can start in any quarter. Most students choose
        to continue in DTR till they graduate.
      </>
    ),
  },

  {
    question: "When does DTR meet?",
    answer: (
      <>
        We meet for a single 3 hour meeting each week, and a separate one hour
        SIG meeting. The longer meeting is used mainly for hackathons, pair
        research, and demos. We require all students be able to make the longer
        meeting. The time for that meeting is scheduled by polling students to
        find the best mutually agreeable meeting time. Typically it&apos;s
        Thursday afternoon or Friday, but it really depends on everyone&apos;s
        schedule.
      </>
    ),
  },
  {
    question: "What is the right time to join DTR?",
    answer: (
      <>
        Whenever you are ready to grow. Most students join in Spring of their
        sophomore or junior year.
      </>
    ),
  },
  {
    question: "Can I work on my personal project in DTR?",
    answer: (
      <>
        While students in DTR have a lot of freedom to choose a project from a
        set that we curate in the{" "}
        <Link href="/projects">
          <a>research areas</a>
        </Link>{" "}
        we work in, the structure of DTR does not accommodate students working
        on their personal projects.
      </>
    ),
  },
  {
    question: "How many hours should I dedicate to DTR?",
    answer: (
      <>
        DTR is a hard class and will require at least 10 hours a week. Students
        joining DTR have the expectation that research is not a one week on, one
        week off endeavor, and instead requires making consistent progress and
        learning to be professional.
      </>
    ),
  },
  {
    question: "Can I take DTR as a fifth class?",
    answer: (
      <>
        Nope. DTR is a hard class and we don&apos;t recommend anyone taking more
        than four classes while one of them is DTR.
      </>
    ),
  },
  {
    question:
      "I am a CS/CE major. Does DTR count toward my major requirements?",
    answer: (
      <>
        DTR satisfies the project requirement &amp; Interfaces depth
        requirement. Depending on the focus of the project you work on, you
        may be able to petition for DTR to count for other depth requirements
        (e.g., CogSys or Systems).
      </>
    ),
  },
  {
    question: "How do I know if I am well-prepared for DTR?",
    answer: (
      <>
        Students entering DTR typically have taken a good number of technical
        courses as well as a course in human computer interaction or
        user-centered design. Most students entering DTR have prior experience
        working on challenging personal or class projects. Students are not
        expected to have had prior research experience.
      </>
    ),
  },
  {
    question: "What are my chances of getting in?",
    answer: (
      <>
        Only one way to find out:{" "}
        <Link href="/apply">
          <a>APPLY!</a>
        </Link>
      </>
    ),
  },
  {
    question: (
      <>
      I have no experience with <u>&nbsp;&nbsp;&nbsp;&nbsp;(fill in the blank)&nbsp;&nbsp;&nbsp;&nbsp;</u>. Can I still apply?
      </>
    ),
    answer: (
      <>
        Absolutely. We find that while prior experience matters, students who
        bring with them a growth mindset excel. Many of the current DTR students
        came in without knowing the technologies they build on. They learned by
        doing, failing, and doing again.
      </>
    ),
  },
  {
    question: "I have a question and it's not covered here. Who do I ask?",
    answer: (
      <>
        Get in touch with <a href="mailto:hq@northwestern.edu\">Haoqi</a> or{" "}
        <Link href="/people">
          <a>anyone else in DTR</a>
        </Link>
        .
      </>
    ),
  },
];
