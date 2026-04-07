const markdownImagePattern = /!\[[^\]\n]*\]\([^)]+\)/g
const markdownLinkPattern = /\[([^\]\n]+)\]\([^)]+\)/g
const markdownReferenceLinkPattern = /\[([^\]\n]+)\]\[[^\]\n]*\]/g
const markdownReferenceDefinitionPattern = /^\s*\[[^\]\n]+\]:\s+\S.*$/gm
const htmlImagePattern = /<img[^>]*>/gi
const htmlTagPattern = /<[^>]+>/g
const fencedCodePattern = /```[\s\S]*?```/g
const inlineCodePattern = /`([^`]+)`/g
const bareUrlPattern = /\bhttps?:\/\/\S+/gi
const markdownDecorationPattern = /(?:^|\s)[>*_#~-]+(?=\s|$)/gm
const markdownListMarkerPattern = /^\s*[-*+]\s+/gm
const markdownOrderedListPattern = /^\s*\d+\.\s+/gm
const markdownTableDividerPattern = /^[-:|\t ]+$/gm
const whitespacePattern = /\s+/g

export function getProjectPreviewText(markdown: string) {
  return markdown
    .replace(fencedCodePattern, ' ')
    .replace(markdownReferenceDefinitionPattern, ' ')
    .replace(markdownImagePattern, ' ')
    .replace(htmlImagePattern, ' ')
    .replace(markdownLinkPattern, '$1')
    .replace(markdownReferenceLinkPattern, '$1')
    .replace(bareUrlPattern, ' ')
    .replace(htmlTagPattern, ' ')
    .replace(inlineCodePattern, '$1')
    .replace(markdownTableDividerPattern, ' ')
    .replace(markdownListMarkerPattern, '')
    .replace(markdownOrderedListPattern, '')
    .replace(markdownDecorationPattern, ' ')
    .replace(whitespacePattern, ' ')
    .trim()
}
