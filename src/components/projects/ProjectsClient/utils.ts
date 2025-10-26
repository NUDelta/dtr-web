export const collapseVariants = {
  open: { height: 'auto', opacity: 1, transition: { duration: 0.22 } },
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.20 } },
}

export const cardAppear = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34 } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.30 } },
}

/**
 * Estimate collapsed card height (px) for balancing columns.
 * Collapsed = Banner (if any) + Header + Description + paddings.
 * These constants are calibrated for a ~2-col layout.
 */
export const estimateCollapsedHeight = (sig: SIG, hasBanner: boolean, desc: string): number => {
  const HEADER = 84 // title + toggle row + paddings
  const BANNER = hasBanner ? 140 : 0 // approx banner height at md two-column width
  const DESC_LINE_H = 22 // line-height in px for prose body
  const CHARS_PER_LINE = 80 // conservative wrap length (depends on your font/width)
  const MARGINS = 24 + 16 // spacing above/below description + card spacing

  const textLen = (desc ?? '').trim().length
  const lines = Math.ceil(textLen / CHARS_PER_LINE) || 1
  const descHeight = lines * DESC_LINE_H

  return HEADER + BANNER + descHeight + MARGINS
}

/** Greedy bin-packing into 2 columns by estimated collapsed height. */
export const balanceTwoColumns = <T extends SIG>(
  items: T[],
  getHeight: (item: T) => number,
): [T[], T[]] => {
  // Sort big->small for better packing (descending by estimate)
  const sorted = [...items].sort((a, b) => getHeight(b) - getHeight(a))
  const left: T[] = []
  const right: T[] = []
  let leftH = 0
  let rightH = 0

  for (const it of sorted) {
    const h = getHeight(it)
    if (leftH <= rightH) {
      left.push(it)
      leftH += h
    }
    else {
      right.push(it)
      rightH += h
    }
  }

  // Keep relative order within each column as per original input for nicer perception
  const indexMap = new Map(items.map((it, i) => [it.id, i]))
  const byOriginal = (a: T, b: T) => (indexMap.get(a.id)! - indexMap.get(b.id)!)
  left.sort(byOriginal)
  right.sort(byOriginal)

  return [left, right]
}
