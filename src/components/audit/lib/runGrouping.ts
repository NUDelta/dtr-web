import type { AuditRun } from './types'

export function getSelectedRun(
  runs: AuditRun[],
  selectedKey: string | undefined,
): AuditRun | undefined {
  if (selectedKey === undefined) {
    return undefined
  }

  return runs.find(run => run.detailKey === selectedKey || run.key === selectedKey)
}
