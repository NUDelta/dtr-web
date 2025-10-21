interface AnnualLetter {
  /** The name of the annual letter. e.g., "2023 Annual Letter" */
  name: string;
  /** The date the annual letter was published. */
  datePublished: Date;
  /** A brief description of the annual letter. */
  description: string;
  /** The URL link to the annual letter. It's the relative path. */
  link: string;
  /** The table of contents for the annual letter. */
  tableOfContents: TableOfContents[];
}

interface TableOfContents {
  /** The name of the section. */
  name: string;
  /** The page number where the section starts. */
  page: string;
}
