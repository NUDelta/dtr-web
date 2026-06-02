import { readKvText, writeKvJson } from '@/lib/r2/r2-gc-kv'

export const R2_GC_ORPHAN_STATE_KEY = 'r2-gc:orphan-state'

interface R2GcOrphanEntry {
  firstSeenAt: number
  lastSeenAt: number
  size?: number
}

export interface R2GcOrphanState {
  version: 1
  updatedAt: number
  orphans: Record<string, R2GcOrphanEntry>
}

function createEmptyState(): R2GcOrphanState {
  return { version: 1, updatedAt: Date.now(), orphans: {} }
}

function parseOrphanState(text: string | undefined): R2GcOrphanState {
  if (text === undefined) {
    return createEmptyState()
  }

  try {
    const parsed = JSON.parse(text) as Partial<R2GcOrphanState>
    if (parsed.version !== 1 || typeof parsed.orphans !== 'object' || parsed.orphans === null) {
      return createEmptyState()
    }

    const orphans: R2GcOrphanState['orphans'] = {}
    for (const [key, entry] of Object.entries(parsed.orphans)) {
      if (
        typeof entry === 'object'
        && entry !== null
        && typeof entry.firstSeenAt === 'number'
        && Number.isFinite(entry.firstSeenAt)
        && typeof entry.lastSeenAt === 'number'
        && Number.isFinite(entry.lastSeenAt)
      ) {
        orphans[key] = {
          firstSeenAt: entry.firstSeenAt,
          lastSeenAt: entry.lastSeenAt,
          ...(typeof entry.size === 'number' ? { size: entry.size } : {}),
        }
      }
    }

    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      orphans,
    }
  }
  catch {
    return createEmptyState()
  }
}

export async function readR2GcOrphanState(): Promise<R2GcOrphanState> {
  return parseOrphanState(await readKvText(R2_GC_ORPHAN_STATE_KEY))
}

export async function writeR2GcOrphanState(state: R2GcOrphanState): Promise<void> {
  await writeKvJson(R2_GC_ORPHAN_STATE_KEY, { ...state, updatedAt: Date.now() })
}
