import Header from "../components/shared/Header";
import Container from "../components/shared/Container";

export default function Letters(): JSX.Element {
  return (
    <div>
      <Header />

      <Container className="mt-8">
        <div className="prose mx-auto max-w-4xl">
          {/* Annual Letters Placeholder */}
          <h2>Annual Letters</h2>
          The DTR annual letter shares Haoqi’s reflections on mentoring and
          learning, and on DTR’s evolving culture and practice. It’s a personal
          letter to learners & educators everywhere.
          <div className="space-y-6">
            {annualLetters.map((annualLetter, i) => (
              <div key={`annual-letter-${i}`} className="mb-4">
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
                      <div>
                        {/* add links to each section of the annual letter */}
                        {annualLetter.tableOfContents.map((section, j) => (
                          <span key={`table-of-contents-${j}`}>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={`${annualLetter.link}#page=${section.page}`}
                              className="!bg-transparent"
                            >
                              <span className="link link-underline link-underline-black">
                                {section.name}{" "}
                              </span>
                            </a>
                            {/* add a vertical bar to separate sections */}
                            {j < annualLetter.tableOfContents.length - 1 && (
                              <span className="text-slate-300">| </span>
                            )}
                          </span>
                        ))}
                      </div>
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

type TableOfContents = {
  name: string;
  page: string;
};

type AnnualLetter = {
  name: string;
  datePublished: Date;
  description: string;
  link: string;
  tableOfContents: TableOfContents[];
};

const annualLetters: AnnualLetter[] = [
  {
    name: "Annual Letter 2023",
    datePublished: new Date(2023, 8 - 1, 1),
    description: "",
    link: "/letters/2023-dtr-letter.pdf",
    tableOfContents: [
      { name: "welcome", page: "1" },
      { name: "celebrating success", page: "1" },
      { name: "a different approach", page: "2" },
      { name: "an independent researcher", page: "4" },
      { name: "let go, and let fall.", page: "6" },
      { name: "bad. should. enough.", page: "10" },
      { name: "the limits of my ability as a mentor and coach", page: "11" },
      { name: "teaching models for thinking", page: "13" },
      { name: "lessons from unpleasant encounters", page: "17" },
      { name: "junior faculty support group", page: "19" },
      { name: "an invitation: DTR's 10 year anniversary", page: "22" },
      {
        name: "appendix: how we coach and teach design research",
        page: "23",
      },
    ],
  },
  {
    name: "Annual Letter 2022",
    datePublished: new Date(2022, 8 - 1, 1),
    description: "",
    link: "/letters/2022-dtr-letter.pdf",
    tableOfContents: [
      { name: "welcome", page: "1" },
      { name: "celebrating success", page: "2" },
      { name: "thawing out of the pandemic", page: "3" },
      { name: "responsibility; responsive", page: "6" },
      { name: "groundhog day", page: "8" },
      { name: "sharing: putting it out there", page: "11" },
      { name: "what students get out of DTR", page: "13" },
      { name: "how we coach and teach design research", page: "17" },
      { name: "sustainability", page: "21" },
      { name: "an invitation", page: "24" },
    ],
  },
];
