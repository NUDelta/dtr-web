import Header from "../components/shared/Header";
import Container from "../components/shared/Container";

export default function Letters(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="prose max-w-4xl mx-auto">
          {/* Annual Letters Placeholder */}
          <h2>Annual Letters</h2>
          The DTR annual letter shares Haoqi’s reflections on mentoring and
          learning, and on DTR’s evolving culture and practice. It’s a personal
          letter to learners & educators everywhere.
          <div className="space-y-6">
            {annualLetters.map((annualLetter, i) => (
              <div key={i} className="mb-4">
                <p>
                  <ul>
                    <li>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={annualLetter.link}
                      >
                        {annualLetter.name}
                      </a>
                    </li>
                  </ul>
                </p>
              </div>
            ))}
          </div>
          {/*  Resources  */}
          <h2>Film, Paper, and Learning Resources</h2>
          To learn more about our way of mentoring and learning, see:
          <p>
            <ul>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="http://forward.movie/"
                >
                  Forward: The DTR Documentary
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://nudelta.github.io/ARSweb/docs/ars-cscw2017.pdf"
                >
                  The Agile Research Studios Paper
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="http://agileresearch.io/"
                >
                  Agile Research University
                </a>
              </li>
            </ul>
          </p>
        </div>
      </Container>
    </div>
  );
}

type AnnualLetter = {
  name: string;
  datePublished: Date;
  description: string;
  link: string;
};

const annualLetters: AnnualLetter[] = [
  {
    name: "Annual Letter 2022",
    datePublished: new Date(2022, 8 - 1, 1),
    description: "",
    link: "/letters/2022-dtr-letter.pdf",
  },
];
