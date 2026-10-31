interface Announcement {
  /** Unique id for the announcement. e.g., "dtr-w27-open-house" */
  id: string
  /** The title shown in the popup and the homepage strip. */
  title?: string
  /** Longer text shown under the title in the popup. */
  description?: string
  /** Short one-line details for the homepage strip, e.g. date, time and place. Leave unset to skip the strip. */
  summary?: string
  /** The image shown in the popup. It's the relative path. */
  image?: string
  /** The call-to-action button shown in the popup and the homepage strip. */
  link?: { url: string, text: string }
  /** Last day the announcement is shown, in YYYY-MM-DD format. */
  expiryDate: string
}
