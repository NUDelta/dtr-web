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
                      <div>
                        {annualLetter.tableOfContents.map((section, j) => (
                          <span key={j}>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={annualLetter.link + "#page=" + section.page}
                              className="!bg-transparent"
                            >
                              {section.section}{" "}
                              <span className="text-slate-300">
                                {j < annualLetter.tableOfContents.length - 1
                                  ? "|"
                                  : ""}
                              </span>
                            </a>
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

// type AnnualLetter = {
//   name: string;
//   datePublished: Date;
//   description: string;
//   link: string;
//   tableOfContents: [{ section: string; page: string }];
// };

const annualLetters = [
  {
    name: "Annual Letter 2023",
    datePublished: new Date(2023, 8 - 1, 1),
    description: "",
    link: "/letters/2023-dtr-letter.pdf",
    tableOfContents: [
      { section: "welcome", page: "1" },
      { section: "celebrating success", page: "1" },
      { section: "a different approach", page: "2" },
      { section: "an independent researcher", page: "4" },
      { section: "let go, and let fall.", page: "6" },
      { section: "bad. should. enough.", page: "10" },
      { section: "the limits of my ability as a mentor and coach", page: "11" },
      { section: "teaching models for thinking", page: "13" },
      { section: "lessons from unpleasant encounters", page: "17" },
      { section: "junior faculty support group", page: "19" },
      { section: "an invitation: DTR's 10 year anniversary", page: "22" },
      {
        section: "appendix: how we coach and teach design research",
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
      { section: "welcome", page: "1" },
      { section: "celebrating success", page: "2" },
      { section: "thawing out of the pandemic", page: "3" },
      { section: "responsibility; responsive", page: "6" },
      { section: "groundhog day", page: "8" },
      { section: "sharing: putting it out there", page: "11" },
      { section: "what students get out of DTR", page: "13" },
      { section: "how we coach and teach design research", page: "17" },
      { section: "sustainability", page: "21" },
      { section: "an invitation", page: "24" },
    ],
  },
];
