import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ISSUE_PATH = process.env.ANNUAL_LETTER_ISSUE_PATH ?? process.env.GITHUB_EVENT_PATH
const TOKEN = process.env.GITHUB_TOKEN
const LETTERS_FILE = 'src/lib/annual-letters.ts'
const GENERATED_SUMMARY_FILE = '.annual-letter-generated.json'

interface IssuePayload {
  body?: string
  issue?: IssuePayload
  number?: number
}

interface DateParts {
  day: number
  month: number
  year: number
}

interface TableOfContentsSection {
  name: string
  page: string
}

interface AnnualLetterEntryInput {
  date: DateParts
  description?: string
  link: string
  tableOfContents: TableOfContentsSection[]
  year: number
}

function fail(message: string): never {
  throw new Error(`[annual-letter] ${message}`)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getIssueField(body: string, label: string): string | undefined {
  const pattern = new RegExp(
    `(?:^|\\n)###\\s+${escapeRegExp(label)}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`,
  )
  const match = body.match(pattern)
  const value = match?.[1]?.trim()

  if (value === undefined || value === '' || value === '_No response_') {
    return undefined
  }

  return value
}

function parseYear(value: string | undefined): number {
  if (value === undefined || !/^\d{4}$/.test(value)) {
    fail('Annual letter year must be a four-digit year.')
  }

  return Number.parseInt(value, 10)
}

function parsePublicationDate(value: string | undefined): DateParts {
  if (value === undefined) {
    fail('Publication date is required.')
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match === null) {
    fail('Publication date must use YYYY-MM-DD.')
  }

  const [, year, month, day] = match
  const parsed = {
    day: Number.parseInt(day, 10),
    month: Number.parseInt(month, 10),
    year: Number.parseInt(year, 10),
  }

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day))
  if (
    date.getUTCFullYear() !== parsed.year
    || date.getUTCMonth() !== parsed.month - 1
    || date.getUTCDate() !== parsed.day
  ) {
    fail('Publication date is not a valid calendar date.')
  }

  return parsed
}

function parsePdfUrl(value: string | undefined): string {
  if (value === undefined) {
    fail('PDF upload or URL is required.')
  }

  const markdownUrls = [...value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)]
    .map(match => ({
      label: match[1],
      url: match[2],
    }))
  const rawUrls = [...value.matchAll(/https?:\/\/[^\s)]+/g)]
    .map(match => ({
      label: '',
      url: match[0],
    }))
  const candidates = [...markdownUrls, ...rawUrls]
  const pdf = candidates.find(({ label, url }) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:'
        && (
          parsed.pathname.toLowerCase().includes('.pdf')
          || label.toLowerCase().includes('.pdf')
        )
    }
    catch {
      return false
    }
  })

  if (pdf === undefined) {
    fail('PDF field must include an HTTPS PDF URL or a markdown link with a .pdf filename.')
  }

  return pdf.url
}

function parseTableOfContents(value: string | undefined): TableOfContentsSection[] {
  if (value === undefined) {
    fail('Table of contents is required.')
  }

  const sections = value
    .split('\n')
    .map(line => line.trim().replace(/^[-*]\s+/, ''))
    .filter(Boolean)
    .map((line) => {
      const separator = line.lastIndexOf('|')
      if (separator === -1) {
        fail(`Invalid table of contents line "${line}". Use "section name | page".`)
      }

      const name = line.slice(0, separator).trim()
      const page = line.slice(separator + 1).trim()

      if (name === '' || page === '') {
        fail(`Invalid table of contents line "${line}". Section name and page are required.`)
      }

      if (!/^\d+[a-z]?$/i.test(page)) {
        fail(`Invalid page "${page}" for section "${name}".`)
      }

      return { name, page }
    })

  if (sections.length === 0) {
    fail('Table of contents must include at least one section.')
  }

  return sections
}

function tsString(value: string): string {
  return `'${value
    .replaceAll('\\', '\\\\')
    // Issue form textareas may include line breaks; keep generated TypeScript single-line-safe.
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\'', '\\\'')}'`
}

function renderAnnualLetterEntry({
  date,
  description,
  link,
  tableOfContents,
  year,
}: AnnualLetterEntryInput): string {
  const toc = tableOfContents
    .map(section => `      { name: ${tsString(section.name)}, page: ${tsString(section.page)} },`)
    .join('\n')

  return `  {
    name: 'Annual Letter ${year}',
    datePublished: new Date(${date.year}, ${date.month} - 1, ${date.day}), // year, month index (0-indexed), day
    description: ${tsString(description ?? '')},
    link: ${tsString(link)},
    tableOfContents: [
${toc}
    ],
  },
`
}

function insertAnnualLetter(source: string, entry: string, year: number): string {
  const entryMatches = [...source.matchAll(/\n {2}\{\n {4}name: 'Annual Letter (\d{4})'/g)]
  if (entryMatches.length === 0) {
    fail(`Could not find existing annual letter entries in ${LETTERS_FILE}.`)
  }

  const duplicate = entryMatches.find(match => Number.parseInt(match[1], 10) === year)
  if (duplicate !== undefined) {
    fail(`Annual Letter ${year} already exists in ${LETTERS_FILE}.`)
  }

  const insertBefore = entryMatches.find(match => Number.parseInt(match[1], 10) < year)
  if (insertBefore !== undefined) {
    return `${source.slice(0, insertBefore.index + 1)}${entry}${source.slice(insertBefore.index + 1)}`
  }

  const closingIndex = source.lastIndexOf('\n]\n\nexport default annualLetters')
  if (closingIndex === -1) {
    fail(`Could not find annualLetters closing bracket in ${LETTERS_FILE}.`)
  }

  return `${source.slice(0, closingIndex + 1)}${entry}${source.slice(closingIndex + 1)}`
}

async function downloadPdf(url: string, targetPath: string): Promise<void> {
  const headers: Record<string, string> = {}
  const parsed = new URL(url)

  if (TOKEN !== undefined && parsed.hostname === 'github.com') {
    headers.Authorization = `Bearer ${TOKEN}`
  }

  const response = await fetch(url, {
    headers,
    redirect: 'follow',
  })

  if (!response.ok) {
    fail(`Could not download PDF: ${response.status} ${response.statusText}.`)
  }

  const bytes = Buffer.from(await response.arrayBuffer())
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    fail('Downloaded file does not look like a PDF.')
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, bytes)
}

async function main() {
  if (ISSUE_PATH === undefined) {
    fail('ANNUAL_LETTER_ISSUE_PATH or GITHUB_EVENT_PATH is required.')
  }

  const event = JSON.parse(await fs.readFile(ISSUE_PATH, 'utf8')) as IssuePayload
  const issue = event.issue ?? event
  if (issue?.body === undefined) {
    fail('Issue body is missing from the GitHub event.')
  }

  const year = parseYear(getIssueField(issue.body, 'Annual letter year'))
  const date = parsePublicationDate(getIssueField(issue.body, 'Publication date'))
  if (date.year !== year) {
    fail('Publication date year must match the annual letter year.')
  }

  const description = getIssueField(issue.body, 'Description') ?? ''
  const pdfUrl = parsePdfUrl(getIssueField(issue.body, 'PDF upload or URL'))
  const tableOfContents = parseTableOfContents(getIssueField(issue.body, 'Table of contents'))
  const link = `/letters/${year}-dtr-letter.pdf`
  const pdfPath = `public${link}`

  await downloadPdf(pdfUrl, pdfPath)

  const source = await fs.readFile(LETTERS_FILE, 'utf8')
  const nextSource = insertAnnualLetter(
    source,
    renderAnnualLetterEntry({
      date,
      description,
      link,
      tableOfContents,
      year,
    }),
    year,
  )
  await fs.writeFile(LETTERS_FILE, nextSource)
  await fs.writeFile(
    GENERATED_SUMMARY_FILE,
    `${JSON.stringify({
      issue: issue.number,
      link,
      pdfPath,
      tableOfContentsCount: tableOfContents.length,
      year,
    }, null, 2)}\n`,
  )
}

await main()
