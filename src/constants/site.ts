/**
 * Canonical public origin for the DTR website.
 *
 * Keep this value without a trailing slash because RSS and metadata builders
 * append paths explicitly.
 */
export const siteUrl = 'https://dtr.northwestern.edu'

/**
 * RSS feed filename written under the site root.
 *
 * Keep this value without a leading slash because feed generation joins it to
 * {@link siteUrl}.
 */
export const feedFileName = 'letters-feed.xml'
