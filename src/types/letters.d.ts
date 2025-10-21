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
