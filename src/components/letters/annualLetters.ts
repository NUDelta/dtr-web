interface TableOfContents {
  name: string;
  page: string;
}

interface AnnualLetter {
  name: string;
  datePublished: Date;
  description: string;
  link: string;
  tableOfContents: TableOfContents[];
}

const annualLetters: AnnualLetter[] = [
  {
    name: 'Annual Letter 2024',
    datePublished: new Date(2024, 8 - 1, 1), // year, month index (0-indexed), day
    description: '',
    link: '/letters/2024-dtr-letter.pdf',
    tableOfContents: [
      { name: 'welcome', page: '1' },
      { name: '10 years of DTR', page: '1' },
      { name: 'the good', page: '6' },
      { name: 'love', page: '8' },
      { name: 'breaking the jump', page: '9' },
      { name: 'troubles in goal-oriented thinking', page: '11' },
      { name: 'sharing models of students', page: '14' },
      { name: 'the value of DTR in a CS curriculum', page: '15' },
      { name: 'junior faculty support group', page: '21' },
      { name: 'perfection', page: '22' },
      { name: 'an invitation', page: '23' },
    ],
  },
  {
    name: 'Annual Letter 2023',
    datePublished: new Date(2023, 8 - 1, 1), // year, month index (0-indexed), day
    description: '',
    link: '/letters/2023-dtr-letter.pdf',
    tableOfContents: [
      { name: 'welcome', page: '1' },
      { name: 'celebrating success', page: '1' },
      { name: 'a different approach', page: '2' },
      { name: 'an independent researcher', page: '4' },
      { name: 'let go, and let fall.', page: '6' },
      { name: 'bad. should. enough.', page: '10' },
      { name: 'the limits of my ability as a mentor and coach', page: '11' },
      { name: 'teaching models for thinking', page: '13' },
      { name: 'lessons from unpleasant encounters', page: '17' },
      { name: 'junior faculty support group', page: '19' },
      { name: 'an invitation: DTR\'s 10 year anniversary', page: '22' },
      {
        name: 'appendix: how we coach and teach design research',
        page: '23',
      },
    ],
  },
  {
    name: 'Annual Letter 2022',
    datePublished: new Date(2022, 8 - 1, 1), // year, month index (0-indexed), day
    description: '',
    link: '/letters/2022-dtr-letter.pdf',
    tableOfContents: [
      { name: 'welcome', page: '1' },
      { name: 'celebrating success', page: '2' },
      { name: 'thawing out of the pandemic', page: '3' },
      { name: 'responsibility; responsive', page: '6' },
      { name: 'groundhog day', page: '8' },
      { name: 'sharing: putting it out there', page: '11' },
      { name: 'what students get out of DTR', page: '13' },
      { name: 'how we coach and teach design research', page: '17' },
      { name: 'sustainability', page: '21' },
      { name: 'an invitation', page: '24' },
    ],
  },
];

export default annualLetters;
