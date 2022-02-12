import Header from "../components/shared/Header";
import Container from "../components/shared/Container";
import Link from "next/link";


export default function Apply(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="prose max-w-4xl mx-auto">
          <h2>Interested in joining us? Follow the steps below:</h2>
          <ol>
            <li>
              Learn more about DTR by{" "}
              <Link href="/">
                <a>browsing this website</a>
              </Link>
              ,{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="http://users.eecs.northwestern.edu/~hq/papers/ars-cscw2017.pdf"
              >
                reading the agile research paper
              </a>
              , or{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.forward.movie/"
              >
                watching the documentary
              </a>
              .
            </li>
            <li>
              Complete the{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://docs.google.com/forms/d/12PJFFoPrk6CzopB0mAm2Go3eLFBzNMMmwjDtCNAdKEc/viewform"
              >
                application form
              </a>{" "}
              to tell us more about you, and when you can meet with us. To join DTR next quarter, submit your applications within a few days of the quarterly DTR Open House (usually in the middle of the quarter), or by week 5 or 6 of the current quarter. Applications received after this will be reviewed next quarter.
              <br />
            </li>
            <li>
              We will contact candidates to interview within a week. We look for
              students who are exceptional in their design, technical, and/or
              research abilities. This may be evidenced through classes you have
              taken, projects you have led and worked on, personal growth, etc.
            </li>
            <li>
              During the one hour interview you will meet with two student teams
              and one faculty mentor. The meeting gives you an opportunity to
              learn about the program, the people, and the projects. It gives us
              a sense of your design skills, technical ability, and research
              feel.
            </li>
            <li>
              We will select the best candidates to join DTR, based on
              expertise, growth potential, and fit. Following our decisions, we
              will schedule followup meetings to brainstorm and define a
              direction for research before the next quarter starts.
            </li>
          </ol>
          <p>
            We take the process of selecting and training students seriously.
            Most DTR students continue until they graduate (by choice!). Our
            goal is to foster an evolving community of dedicated, interested
            students.
          </p>
          <p>
            Should you have any questions, don&apos;t hesitate to reach out to{" "}
            <a href="mailto:hq@northwestern.edu">Haoqi</a> or{" "}
            <Link href="/people">
              <a>anyone else in DTR</a>
            </Link>
          </p>

          <div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.google.com/forms/d/12PJFFoPrk6CzopB0mAm2Go3eLFBzNMMmwjDtCNAdKEc/viewform"
              className="px-4 py-2 border-2 border-black"
            >
              Apply Now
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};
